import { ShareIcon } from "../icons/ShareIcon";

interface CardProps {
    id: string;
    title: string;
    links: string[];
    description?: string;
    shareHash?: string;
    onEdit: () => void;
    onDelete: () => void;
    onRefresh: () => void;
}

export function Card({id, title, links, description, shareHash, onEdit, onDelete, onRefresh}: CardProps) {
    const firstLink = links && links.length > 0 ? links[0] : "";
    
    const getThumbnail = (url: string) => {
        if (!url) return null;
        try {
            if (url.includes("youtube.com") || url.includes("youtu.be")) {
                let videoId = "";
                if (url.includes("v=")) {
                    videoId = url.split("v=")[1]?.split("&")[0];
                } else {
                    videoId = url.split("/").pop() || "";
                }
                if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
            if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
                return url;
            }
        } catch (e) {
            return null;
        }
        return null;
    };

    const thumbnail = getThumbnail(firstLink);

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (shareHash) {
            const shareUrl = `${window.location.origin}/shared/${shareHash}`;
            navigator.clipboard.writeText(shareUrl);
            alert("Share link copied to clipboard: " + shareUrl);
        } else {
            alert("This note doesn't have a share link yet. Please edit and save it again.");
        }
    };

    return (
        <div 
            onClick={onEdit}
            className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group cursor-pointer hover:-translate-y-2 relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-black text-2xl text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                            {title}
                        </h2>
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">{links.length} {links.length === 1 ? 'Link' : 'Links'}</span>
                    </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={handleShare}
                        className="p-3 text-gray-200 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all"
                        title="Copy Share Link"
                    >
                        <ShareIcon />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        title="Delete Note"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 mb-8 overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-50 relative aspect-[16/10] group/preview">
                {thumbnail ? (
                    <img 
                        src={thumbnail} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110" 
                        alt="Preview" 
                        onError={(e) => {
                            if (thumbnail.includes("maxresdefault")) {
                                (e.target as HTMLImageElement).src = thumbnail.replace("maxresdefault", "mqdefault");
                            } else {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.856.12-1.683.342-2.466" />
                            </svg>
                        </div>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white text-purple-600 px-6 py-3 rounded-2xl font-black shadow-2xl transform translate-y-4 group-hover/preview:translate-y-0 transition-transform">
                        VIEW NOTE
                    </div>
                </div>
            </div>

            {description && (
                <div className="mb-8">
                    <p className="text-gray-500 text-lg leading-relaxed line-clamp-3 font-medium">
                        {description}
                    </p>
                </div>
            )}
            
            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-3 overflow-hidden">
                    {links.slice(0, 3).map((l, i) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-xl bg-white border-4 border-white shadow-sm flex items-center justify-center text-purple-600 ring-2 ring-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                        </div>
                    ))}
                    {links.length > 3 && (
                        <div className="inline-block h-10 w-10 rounded-xl bg-gray-50 border-4 border-white flex items-center justify-center text-gray-400 font-bold text-xs">
                            +{links.length - 3}
                        </div>
                    )}
                </div>
                <div className="text-purple-600 hover:text-purple-700 font-black text-sm tracking-widest uppercase">
                    Read More →
                </div>
            </div>
        </div>
    );
}