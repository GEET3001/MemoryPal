import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

interface Message {
    role: "user" | "model";
    text: string;
}

export function ChatSection({ contentId }: { contentId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/v1/content/${contentId}/chat`, {
                    headers: { "Authorization": localStorage.getItem("token") }
                });
                setMessages(response.data.messages);
            } catch (e) {
                console.error("Failed to fetch chat history");
            }
        };
        fetchHistory();
    }, [contentId]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/content/${contentId}/chat`, 
                { message: userMessage },
                { headers: { "Authorization": localStorage.getItem("token") } }
            );
            setMessages(prev => [...prev, { role: "model", text: response.data.response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: "model", text: "Error: Failed to get AI response." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <h3 className="font-black text-xl text-gray-900 mb-2">AI Note Companion</h3>
                        <p className="text-gray-500 text-sm max-w-[240px]">Ask questions about your links, summarize your note, or generate new ideas based on this content.</p>
                    </div>
                )}
                
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                            m.role === "user" 
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-100 rounded-tr-none" 
                                : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none"
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Ask a question..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-purple-600/20 transition-all outline-none"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
