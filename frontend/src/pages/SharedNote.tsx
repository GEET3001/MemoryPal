import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Logo } from "../icons/Logo";

export function SharedNote() {
    const { shareHash } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate(`/signin?redirect=/shared/${shareHash}`);
            return;
        }

        async function fetchSharedNote() {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/v1/shared/${shareHash}`, {
                    headers: { Authorization: token }
                });
                setNote(response.data.content);
            } catch (e: any) {
                if (e.response?.status === 401 || e.response?.status === 403) {
                    // Token expired — clear it and send to sign in with return URL
                    localStorage.removeItem("token");
                    navigate(`/signin?redirect=/shared/${shareHash}`);
                } else {
                    setError(true);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchSharedNote();
    }, [shareHash, navigate]);

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </div>
        </div>
    );

    if (error) return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
            <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Note Not Found</h2>
            <p className="text-gray-500 max-w-md">This note may have been deleted or the link is invalid.</p>
            <button onClick={() => navigate("/dashboard")} className="mt-8 text-purple-600 font-bold hover:underline">
                Go to My Dashboard
            </button>
        </div>
    );

    const firstLink = note.links?.[0];
    const getThumbnail = (url: string) => {
        if (!url) return null;
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("/").pop();
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        return null;
    };
    const thumbnail = getThumbnail(firstLink);

    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-gray-50 py-6 px-8 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
                    <div className="text-purple-600">
                        <Logo />
                    </div>
                    <span className="font-black text-xl tracking-tight">MemoryPal</span>
                </div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                    Authenticated View
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <header className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
                        {note.title}
                    </h1>

                    {note.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {note.tags.map((tag: string) => (
                                <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-xl text-xs font-bold">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {note.links?.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {note.links.map((l: string, i: number) => (
                                <a
                                    key={i}
                                    href={l}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all font-bold text-sm border border-gray-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                    </svg>
                                    {note.links.length > 1 ? `Reference ${i + 1}` : "Reference"}
                                </a>
                            ))}
                        </div>
                    )}
                </header>

                {thumbnail && (
                    <div className="mb-12 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl aspect-video">
                        <img
                            src={thumbnail}
                            className="w-full h-full object-cover"
                            alt="Preview"
                            onError={e => {
                                const img = e.target as HTMLImageElement;
                                if (img.src.includes("maxresdefault")) {
                                    img.src = img.src.replace("maxresdefault", "mqdefault");
                                } else {
                                    img.style.display = "none";
                                }
                            }}
                        />
                    </div>
                )}

                {note.description && (
                    <article>
                        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                            {note.description}
                        </p>
                    </article>
                )}

                <footer className="mt-24 pt-12 border-t border-gray-50 text-center">
                    <p className="text-gray-300 font-bold text-sm tracking-widest uppercase mb-4">Captured with MemoryPal</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="inline-block bg-purple-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-purple-100 hover:scale-105 transition-transform"
                    >
                        Back to My Dashboard
                    </button>
                </footer>
            </main>
        </div>
    );
}
