import { Logo } from "../icons/Logo";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SidebarItem } from "./SidebarItem";

export function Sidebar() {
    return (
        <div className="h-screen bg-white/50 backdrop-blur-lg border-r border-gray-100 w-72 fixed left-0 top-0 p-6 flex flex-col shadow-sm">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="text-purple-600 transform transition-transform hover:rotate-12">
                    <Logo />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    MemoryPal
                </h1>
            </div>
            
            <div className="flex-1 space-y-2">
                <SidebarItem text="All Notes" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                } />
                <SidebarItem text="Twitter" icon={<TwitterIcon />} />
                <SidebarItem text="YouTube" icon={<YoutubeIcon />} />
            </div>

            <div className="pt-4 border-t border-gray-100">
                <button 
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/signin";
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    );
}