import { ReactElement } from "react";

interface ButtonProps {
    variant: "primary" | "secondary";
    text: string;
    startIcon?: ReactElement;
    onClick?: () => void;
    fullWidth?: boolean;
    loading?: boolean;
}

const variantClasses = {
    "primary": "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 active:scale-95",
    "secondary": "bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95",
};

const defaultStyles = "px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 cursor-pointer";


export function Button({variant, text, startIcon, onClick, fullWidth, loading}: ButtonProps) {
    return <button onClick={onClick} className={variantClasses[variant] + " " + defaultStyles + `${fullWidth ? " w-full flex justify-center items-center" : ""} ${loading ? "opacity-45	" : ""}`} disabled={loading}>
        {startIcon && <div className="pr-2">
            {startIcon}
        </div>}
        {text}
    </button>
}