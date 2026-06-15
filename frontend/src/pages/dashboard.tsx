import { useEffect, useState } from "react"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { CreateContentModal } from "../components/CreateContentModal"
import { PlusIcon } from "../icons/PlusIcon"
import { useContent } from "../hooks/useContent"
import { BACKEND_URL } from "../config"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const {contents, refresh} = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
  }, [modalOpen])

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const handleEdit = (note: any) => {
    setEditData({
        id: note._id,
        title: note.title,
        links: note.links,
        description: note.description
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
        await axios.delete(`${BACKEND_URL}/api/v1/content`, {
            data: { contentId: id },
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });
        refresh();
    } catch (e) {
        alert("Failed to delete note.");
    }
  };

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
        
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight">
                Memory<span className="text-purple-600">Pal</span>
            </h1>
            <p className="text-gray-400 font-medium mt-2 text-lg">Your minimal second brain.</p>
          </div>
          
          <div className="flex gap-4">
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
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {contents.map((note: any) => (
                    <Card 
                        key={note._id}
                        id={note._id.toString()}
                        title={note.title}
                        links={note.links}
                        description={note.description}
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
