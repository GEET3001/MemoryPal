interface InputProps { 
    placeholder: string; 
    reference?: any;
    type?: string;
    textarea?: boolean;
}

export function Input({placeholder, reference, type, textarea}: InputProps) {
    const className = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 m-1";
    
    return (
        <div className="w-full">
            {textarea ? (
                <textarea 
                    ref={reference} 
                    placeholder={placeholder} 
                    className={`${className} min-h-[100px] resize-none`}
                />
            ) : (
                <input 
                    ref={reference} 
                    placeholder={placeholder} 
                    type={type || "text"} 
                    className={className} 
                />
            )}
        </div>
    );
}