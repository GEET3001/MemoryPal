import { ReactElement } from "react";

export function SidebarItem({text, icon}: {
    text: string;
    icon: ReactElement;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 text-gray-600 cursor-pointer hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200 font-medium group">
            <div className="text-gray-400 group-hover:text-purple-600 transition-colors">
                {icon}
            </div>
            <div>
                {text}
            </div>
        </div>
    );
}