import { useState, useRef, useEffect } from "react";
import { CrossIcon } from "../icons/CrossIcon";
import { BACKEND_URL } from "../config";
import axios from "axios";

interface Message {
    role: "user" | "model";
    text: string;
}

interface GlobalChatModalProps {
    open: boolean;
    onClose: () => void;
}

const STARTER_QUESTIONS = [
    "What did I save about productivity?",
    "Summarize my notes on AI",
    "What are the main topics in my notes?",
    "Find connections between my notes",
];

export function GlobalChatModal({ open, onClose }: GlobalChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setMessages([]);
            setInput("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async (text?: string) => {
        const userMessage = (text ?? input).trim();
        if (!userMessage || loading) return;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/chat`,
                { message: userMessage },
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            setMessages(prev => [...prev, { role: "model", text: response.data.response }]);
        } catch {
            setMessages(prev => [...prev, {
                role: "model",
                text: "Something went wrong connecting to AI. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex justify-between items-center px-8 py-6 border-b border-gray-50">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ask Your Second Brain</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Search across all your notes with AI</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-4 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                >
                    <CrossIcon />
                </button>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center pt-16">
                            <div className="w-16 h-16 bg-purple-50 rounded-3xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Ask anything about your notes</h3>
                            <p className="text-gray-400 mt-2 max-w-md text-sm">
                                I can search across all your saved knowledge and give you synthesized answers.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-lg">
                                {STARTER_QUESTIONS.map(q => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        className="p-4 rounded-2xl border border-gray-100 text-left text-sm text-gray-600 hover:border-purple-200 hover:bg-purple-50 transition-all font-medium"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                        msg.role === "user"
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-50 text-gray-700"
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-50 px-5 py-4 rounded-2xl flex gap-1.5 items-center">
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-50 px-4 py-5">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Ask anything about your notes..."
                        className="flex-1 bg-gray-50 rounded-2xl px-5 py-4 text-sm border border-gray-100 focus:ring-2 focus:ring-purple-600/20 focus:border-transparent outline-none transition-all"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 disabled:opacity-40 transition-all"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
