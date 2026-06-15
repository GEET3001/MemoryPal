import { useState, useEffect } from "react";
import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { PlusIcon } from "../icons/PlusIcon";
import { ChatSection } from "./ChatSection";

interface CreateContentModalProps {
    open: boolean;
    onClose: () => void;
    initialData?: {
        id: string;
        title: string;
        links: string[];
        description: string;
        tags: string[];
    } | null;
}

export function CreateContentModal({ open, onClose, initialData }: CreateContentModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [links, setLinks] = useState<string[]>([""]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [suggestingTags, setSuggestingTags] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        if (open && initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setLinks(initialData.links.length > 0 ? initialData.links : [""]);
            setTags(initialData.tags || []);
            setShowChat(true);
        } else if (open) {
            setTitle("");
            setDescription("");
            setLinks([""]);
            setTags([]);
            setTagInput("");
            setShowChat(false);
        }
    }, [open, initialData]);

    const addLinkField = () => setLinks([...links, ""]);

    const updateLink = (index: number, value: string) => {
        const newLinks = [...links];
        newLinks[index] = value;
        setLinks(newLinks);
    };

    const removeLink = (index: number) => {
        if (links.length > 1) {
            setLinks(links.filter((_, i) => i !== index));
        } else {
            setLinks([""]);
        }
    };

    const addTag = (value: string) => {
        const normalized = value.trim().toLowerCase().replace(/,/g, "").replace(/^#/, "");
        if (normalized && !tags.includes(normalized)) {
            setTags(prev => [...prev, normalized]);
        }
        setTagInput("");
    };

    const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

    const suggestTags = async () => {
        if (!title.trim() || suggestingTags) return;
        setSuggestingTags(true);
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/suggest-tags`,
                { title, description },
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            const suggested = (response.data.tags as string[]) || [];
            const newTags = suggested.filter(t => !tags.includes(t));
            setTags(prev => [...prev, ...newTags]);
        } catch {
            // silently fail — tag suggestion is non-critical
        } finally {
            setSuggestingTags(false);
        }
    };

    async function handleSave() {
        if (!title.trim()) {
            alert("Please provide a title");
            return;
        }

        const finalLinks = links.map(l => l.trim()).filter(l => l !== "");

        try {
            if (initialData) {
                await axios.put(
                    `${BACKEND_URL}/api/v1/content/${initialData.id}`,
                    { links: finalLinks, title, description, tags },
                    { headers: { Authorization: localStorage.getItem("token") } }
                );
            } else {
                await axios.post(
                    `${BACKEND_URL}/api/v1/content`,
                    { links: finalLinks, title, description, tags },
                    { headers: { Authorization: localStorage.getItem("token") } }
                );
            }
            onClose();
        } catch {
            alert("Failed to save note.");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-hidden animate-in fade-in duration-300">
            <div className="max-w-[1400px] mx-auto h-screen flex flex-col transition-all duration-700">

                {/* Fixed Header */}
                <header className="flex justify-between items-center px-8 py-8 border-b border-gray-50 bg-white">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {initialData ? "Edit Note" : "New Note"}
                        </h1>
                        {initialData && (
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${showChat ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                            >
                                {showChat ? "Hide AI Assistant" : "Show AI Assistant"}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                        <CrossIcon />
                    </button>
                </header>

                {/* Main Content Area - Split Pane */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left: Editor */}
                    <div className={`flex-1 overflow-y-auto px-8 py-12 transition-all duration-700 ${showChat ? "md:border-r border-gray-50" : ""}`}>
                        <div className="max-w-4xl mx-auto space-y-12 pb-32">

                            {/* Title */}
                            <div className="space-y-4">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Title</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Title"
                                    className="w-full text-5xl font-black border-none focus:ring-0 placeholder:text-gray-100 tracking-tighter"
                                />
                            </div>

                            {/* Links */}
                            <div className="space-y-6">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Links</label>
                                <div className="space-y-3">
                                    {links.map((link, index) => (
                                        <div key={index} className="flex gap-2 group">
                                            <div className="flex-1 bg-gray-50 rounded-2xl p-1 flex items-center transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-600/10">
                                                <div className="px-4 text-gray-300 font-black text-[10px]">{index + 1}</div>
                                                <input
                                                    value={link}
                                                    onChange={e => updateLink(index, e.target.value)}
                                                    placeholder="Paste link"
                                                    className="flex-1 bg-transparent border-none focus:ring-0 py-4 text-sm font-bold text-gray-700"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeLink(index)}
                                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addLinkField}
                                        className="flex items-center gap-3 px-6 py-4 text-purple-600 hover:bg-purple-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                                    >
                                        <PlusIcon />
                                        Add link
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-6">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Notes</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Write your note here..."
                                    className="w-full min-h-[300px] text-xl leading-[1.8] text-gray-600 border-none focus:ring-0 placeholder:text-gray-100 resize-none font-medium"
                                />
                            </div>

                            {/* Tags */}
                            <div className="space-y-4">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Tags</label>

                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold"
                                            >
                                                #{tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="text-purple-400 hover:text-purple-700 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <input
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" || e.key === ",") {
                                                e.preventDefault();
                                                addTag(tagInput);
                                            }
                                        }}
                                        placeholder="Add a tag and press Enter..."
                                        className="flex-1 bg-gray-50 rounded-2xl px-5 py-3.5 text-sm border-none focus:ring-2 focus:ring-purple-600/10 outline-none"
                                    />
                                    <button
                                        onClick={suggestTags}
                                        disabled={suggestingTags || !title.trim()}
                                        className="px-5 py-3.5 bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-600 rounded-2xl text-xs font-bold disabled:opacity-40 transition-all whitespace-nowrap flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                        {suggestingTags ? "Thinking..." : "AI Suggest"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Chat Section */}
                    {initialData && showChat && (
                        <div className="w-full md:w-[450px] lg:w-[500px] bg-white p-8 flex flex-col animate-in slide-in-from-right duration-500">
                            <ChatSection contentId={initialData.id} />
                        </div>
                    )}
                </div>

                {/* Fixed Footer */}
                <footer className="px-8 py-8 border-t border-gray-50 bg-white flex justify-between items-center">
                    <div />
                    <Button
                        onClick={handleSave}
                        variant="primary"
                        text="Save"
                        fullWidth={false}
                    />
                </footer>
            </div>
        </div>
    );
}
