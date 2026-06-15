import { ShareIcon } from "../icons/ShareIcon";

interface CardProps {
    id: string;
    title: string;
    links: string[];
    description?: string;
    isShared?: boolean;
    shareHash?: string;
    onEdit: () => void;
    onDelete: () => void;
    onRefresh: () => void;
}

export function Card({title, links, description, shareHash, onEdit, onDelete}: CardProps) {
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
            if (url.match(/\.(jpeg|jpg|gif|png)$/i) != null) return url;
        } catch {
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
            alert("Share link copied!");
        } else {
            alert("Save the note first to generate a share link.");
        }
    };

    return (
        <div
            onClick={onEdit}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer hover:-translate-y-0.5"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <h2 className="font-bold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {title}
                    </h2>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                    <button
                        onClick={handleShare}
                        className="p-2 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        title="Copy share link"
                    >
                        <ShareIcon />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content area */}
            {thumbnail ? (
                <div className="mb-4 overflow-hidden rounded-xl relative aspect-video bg-gray-50">
                    <img
                        src={thumbnail}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt="Preview"
                        onError={(e) => {
                            if (thumbnail.includes("maxresdefault")) {
                                (e.target as HTMLImageElement).src = thumbnail.replace("maxresdefault", "mqdefault");
                            } else {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }
                        }}
                    />
                </div>
            ) : description ? (
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-4 mb-4 flex-1">
                    {description}
                </p>
            ) : (
                <div className="mb-4 flex items-center justify-center h-16 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-300 font-medium">No content yet</span>
                </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                {links.length > 0 ? (
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <span className="text-xs font-medium">{links.length} {links.length === 1 ? 'link' : 'links'}</span>
                    </div>
                ) : (
                    <span className="text-xs text-gray-300">No links</span>
                )}
                <span className="text-xs text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
            </div>
        </div>
    );
}
