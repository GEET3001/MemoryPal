import { useEffect, useState } from "react"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { CreateContentModal } from "../components/CreateContentModal"
import { GlobalChatModal } from "../components/GlobalChatModal"
import { PlusIcon } from "../icons/PlusIcon"
import { useContent } from "../hooks/useContent"
import { BACKEND_URL } from "../config"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [globalChatOpen, setGlobalChatOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { contents, refresh } = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
  }, [modalOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const handleEdit = (note: any) => {
    setEditData({
      id: note._id,
      title: note.title,
      links: note.links,
      description: note.description,
      tags: note.tags || []
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content`, {
        data: { contentId: id },
        headers: { Authorization: localStorage.getItem("token") }
      });
      refresh();
    } catch {
      alert("Failed to delete note.");
    }
  };

  // Derive all unique tags from loaded notes
  const allTags: string[] = [...new Set(
    contents.flatMap((n: any) => (n.tags as string[]) || [])
  )].sort() as string[];

  // Client-side filter
  const filteredContents = contents.filter((note: any) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      note.title.toLowerCase().includes(q) ||
      (note.description || "").toLowerCase().includes(q) ||
      ((note.tags as string[]) || []).some((t: string) => t.toLowerCase().includes(q));
    const matchesTag = !activeTag || ((note.tags as string[]) || []).includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        <CreateContentModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditData(null);
          }}
          initialData={editData}
        />
        <GlobalChatModal
          open={globalChatOpen}
          onClose={() => setGlobalChatOpen(false)}
        />

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight">
              Memory<span className="text-purple-600">Pal</span>
            </h1>
            <p className="text-gray-400 font-medium mt-2 text-lg">Your minimal second brain.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setGlobalChatOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-50 text-purple-600 font-bold text-sm hover:bg-purple-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Ask AI
            </button>
            <Button
              onClick={() => {
                setEditData(null);
                setModalOpen(true);
              }}
              variant="primary"
              text="New Note"
              startIcon={<PlusIcon />}
            />
            <Button
              onClick={handleLogout}
              variant="secondary"
              text="Logout"
            />
          </div>
        </header>

        {/* Search + Tag Filters */}
        <div className="mb-10 space-y-4">
          {/* Search */}
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes, tags..."
              className="w-full bg-gray-50 rounded-2xl pl-12 pr-5 py-4 text-sm border border-gray-100 focus:ring-2 focus:ring-purple-600/20 focus:border-transparent outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Tag filter chips */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!activeTag ? "bg-purple-600 text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTag === tag ? "bg-purple-600 text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes grid / empty states */}
        {contents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
            <div className="bg-white p-8 rounded-full mb-6 shadow-sm text-purple-600">
              <PlusIcon />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Your brain is empty</h3>
            <p className="text-gray-400 max-w-xs mt-3 font-medium">Capture notes, links, and ideas in one clean place.</p>
            <div className="mt-8">
              <Button
                onClick={() => setModalOpen(true)}
                variant="primary"
                text="Start capturing"
              />
            </div>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700">No notes match</h3>
            <p className="text-gray-400 mt-1 text-sm">Try a different search term or clear the filter.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveTag(null); }}
              className="mt-4 px-5 py-2.5 text-purple-600 bg-purple-50 rounded-xl text-sm font-bold hover:bg-purple-100 transition-all"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContents.map((note: any) => (
              <Card
                key={note._id}
                id={note._id.toString()}
                title={note.title}
                links={note.links}
                description={note.description}
                tags={note.tags || []}
                isShared={note.isShared}
                shareHash={note.shareHash}
                onEdit={() => handleEdit(note)}
                onDelete={() => handleDelete(note._id)}
                onRefresh={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
