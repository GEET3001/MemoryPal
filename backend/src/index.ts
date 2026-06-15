import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import bcryptjs from "bcryptjs";
import { UserModel, ContentModel, ChatModel } from "./db";
import { JWT_PASSWORD, PORT, GEMINI_API_KEY } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());
const corsOrigin = process.env.FRONTEND_URL;
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        // Allow the configured frontend URL
        if (corsOrigin && origin === corsOrigin) return callback(null, true);
        // Allow all Chrome extension origins (chrome-extension://<id>)
        if (origin.startsWith("chrome-extension://")) return callback(null, true);
        // If no specific origin is configured, allow all (dev mode)
        if (!corsOrigin) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const modelAI = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.send("MemoryPal API is running. Visit port 5173 for the frontend.");
});

// --- AUTH ROUTES ---

app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password;
    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        await UserModel.create({ username, password: hashedPassword });
        res.json({ message: "User signed up" });
    } catch (e) {
        res.status(411).json({ message: "User already exists" });
    }
});

app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password;
    const existingUser = await UserModel.findOne({ username });

    let isValid = false;
    if (existingUser) {
        const isHashed = existingUser.password.startsWith("$2");
        if (isHashed) {
            isValid = await bcryptjs.compare(password, existingUser.password);
        } else {
            isValid = existingUser.password === password;
            if (isValid) {
                const hashed = await bcryptjs.hash(password, 10);
                await UserModel.updateOne({ _id: existingUser._id }, { password: hashed });
            }
        }
    }

    if (isValid && existingUser) {
        const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD, { expiresIn: "7d" });
        res.json({ token });
    } else {
        res.status(403).json({ message: "Incorrect credentials" });
    }
});

// --- CHAT ROUTES (per-note, placed early to avoid /:contentId conflict) ---

app.get("/api/v1/content/:contentId/chat", userMiddleware, async (req, res) => {
    try {
        const contentId = req.params.contentId;
        const messages = await ChatModel.find({
            contentId,
            //@ts-ignore
            userId: req.userId
        }).sort({ createdAt: 1 });
        res.json({ messages });
    } catch (e) {
        res.status(500).json({ message: "Error fetching chat" });
    }
});

app.post("/api/v1/content/:contentId/chat", userMiddleware, async (req, res) => {
    const contentId = req.params.contentId;
    const { message } = req.body;
    try {
        const content = await ContentModel.findOne({
            _id: contentId,
            //@ts-ignore
            userId: req.userId
        });
        if (!content) {
            res.status(404).json({ message: "Note not found" });
            return;
        }

        const history = await ChatModel.find({
            contentId,
            //@ts-ignore
            userId: req.userId
        }).sort({ createdAt: 1 });

        const systemPrompt = `You are a helpful assistant for a specific note.
        CONTEXT:
        Title: ${content.title}
        Description: ${content.description || ""}
        Links: ${content.links.join(", ")}

        Answer ONLY based on this note.`;

        const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
        let responseText = "";
        let error = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting AI response with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const chat = model.startChat({
                    history: history.map(m => ({
                        role: m.role as "user" | "model",
                        parts: [{ text: m.text }]
                    })),
                });

                const fullMessage = history.length === 0 ? `${systemPrompt}\n\nUser: ${message}` : message;
                const result = await chat.sendMessage(fullMessage);
                responseText = result.response.text();
                if (responseText) break;
            } catch (e) {
                console.error(`Model ${modelName} failed:`, e);
                error = e;
                continue;
            }
        }

        if (!responseText) {
            throw error || new Error("All AI models failed");
        }

        await ChatModel.create([
            //@ts-ignore
            { contentId, userId: req.userId, role: "user", text: message },
            //@ts-ignore
            { contentId, userId: req.userId, role: "model", text: responseText }
        ]);

        res.json({ response: responseText });
    } catch (e) {
        console.error("Final Chat error:", e);
        res.status(500).json({ message: "AI processing failed. Check backend logs for model errors." });
    }
});

// --- GLOBAL AI CHAT (across all notes) ---

app.post("/api/v1/chat", userMiddleware, async (req, res) => {
    const { message } = req.body;
    //@ts-ignore
    const userId = req.userId;
    if (!message?.trim()) {
        res.status(400).json({ message: "Message is required" });
        return;
    }
    try {
        const notes = await ContentModel.find({ userId }).sort({ createdAt: -1 });

        if (notes.length === 0) {
            res.json({ response: "You don't have any notes yet! Start by adding some notes to your MemoryPal, then I can help you search and connect them." });
            return;
        }

        const notesContext = notes.map((note, i) => {
            const tags = (note.tags as string[] || []).join(", ") || "none";
            return `Note ${i + 1}: "${note.title}"\nTags: ${tags}\nDescription: ${note.description || "none"}\nLinks: ${note.links.join(", ") || "none"}`;
        }).join("\n\n---\n\n");

        const systemPrompt = `You are a helpful AI assistant with access to the user's entire knowledge base (${notes.length} saved notes). Help them recall, connect, and explore their saved knowledge.

KNOWLEDGE BASE:
${notesContext}

Instructions:
- Answer based on the notes above when relevant
- If referencing a specific note, mention its title
- If the answer isn't in the notes, say so and offer general knowledge
- Be concise and helpful`;

        const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
        let responseText = "";
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(`${systemPrompt}\n\nUser question: ${message}`);
                responseText = result.response.text();
                if (responseText) break;
            } catch (e) {
                lastError = e;
                continue;
            }
        }

        if (!responseText) throw lastError || new Error("All models failed");
        res.json({ response: responseText });
    } catch (e) {
        console.error("Global chat error:", e);
        res.status(500).json({ message: "AI processing failed" });
    }
});

// --- TAG SUGGESTION ---

app.post("/api/v1/suggest-tags", userMiddleware, async (req, res) => {
    const { title, description } = req.body;
    if (!title?.trim()) {
        res.json({ tags: [] });
        return;
    }
    try {
        const prompt = `Given this note, suggest 3-5 concise tags (single words or short phrases, lowercase). Return ONLY a JSON array of strings with no explanation.

Title: ${title}
Description: ${description || ""}

Example output: ["productivity", "deep work", "focus", "time management"]`;

        const result = await modelAI.generateContent(prompt);
        const text = result.response.text().trim();
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) {
            res.json({ tags: [] });
            return;
        }
        const parsed = JSON.parse(match[0]);
        const tags = Array.isArray(parsed)
            ? parsed.map((t: unknown) => String(t).toLowerCase().trim()).filter(Boolean)
            : [];
        res.json({ tags });
    } catch (e) {
        console.error("Suggest tags error:", e);
        res.json({ tags: [] });
    }
});

// --- TAG LIST ---

app.get("/api/v1/tags", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    try {
        const contents = await ContentModel.find({ userId }, { tags: 1 });
        const tagSet = new Set<string>();
        contents.forEach(c => {
            ((c.tags as string[]) || []).forEach(t => t && tagSet.add(t));
        });
        const allTags = Array.from(tagSet).sort();
        res.json({ tags: allTags });
    } catch (e) {
        res.status(500).json({ message: "Error fetching tags" });
    }
});

// --- CONTENT ROUTES ---

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const { links, title, description, tags } = req.body;
    await ContentModel.create({
        links,
        title,
        description,
        tags: Array.isArray(tags) ? tags : [],
        //@ts-ignore
        userId: req.userId,
        shareHash: random(10)
    });
    res.json({ message: "Note added" });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const { q, tag } = req.query;
    const filter: Record<string, unknown> = { userId };

    if (q && typeof q === "string" && q.trim()) {
        filter.$text = { $search: q.trim() };
    }
    if (tag && typeof tag === "string" && tag.trim()) {
        filter.tags = tag.trim();
    }

    const content = await ContentModel.find(filter).sort({ createdAt: -1 });
    res.json({ content });
});

app.put("/api/v1/content/:contentId", userMiddleware, async (req, res) => {
    const contentId = req.params.contentId;
    const { title, links, description, tags } = req.body;
    await ContentModel.updateOne({
        _id: contentId,
        //@ts-ignore
        userId: req.userId
    }, {
        title,
        links,
        description,
        tags: Array.isArray(tags) ? tags : []
    });
    res.json({ message: "Note updated" });
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const { contentId } = req.body;
    await ContentModel.deleteOne({
        _id: contentId,
        //@ts-ignore
        userId: req.userId
    });
    res.json({ message: "Deleted" });
});

app.get("/api/v1/shared/:shareHash", userMiddleware, async (req, res) => {
    try {
        const shareHash = req.params.shareHash;
        const content = await ContentModel.findOne({ shareHash });
        if (!content) {
            res.status(404).json({ message: "Note not found" });
            return;
        }
        res.json({ content });
    } catch (e) {
        res.status(500).json({ message: "Error fetching shared note" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
