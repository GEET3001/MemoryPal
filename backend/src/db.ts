import mongoose, { model, Schema } from "mongoose";
import { MONGO_URL } from "./config";

mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((e) => console.error("Error connecting to MongoDB:", e));

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

export const UserModel = model("User", UserSchema);

const TagSchema = new Schema({
    title: { type: String, unique: true, required: true }
});

export const TagModel = model("Tag", TagSchema);

const ContentSchema = new Schema({
    title: { type: String, required: true },
    links: [String],
    description: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    isShared: { type: Boolean, default: false },
    shareHash: { type: String, unique: true, sparse: true }
}, { timestamps: true });

export const ContentModel = model("Content", ContentSchema);

const ChatSchema = new Schema({
    contentId: { type: mongoose.Types.ObjectId, ref: 'Content', required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'model'], required: true },
    text: { type: String, required: true }
}, { timestamps: true });

export const ChatModel = model("Chat", ChatSchema);