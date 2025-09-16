import React, { useEffect, useState } from 'react';

interface ToastProps {
  toast: { id: number; message: string; type: 'success' | 'error' } | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        const exitTimer = setTimeout(onClose, 300); // Corresponds to animation duration
        return () => clearTimeout(exitTimer);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }
  
  const baseClasses = "fixed top-5 right-5 max-w-sm w-full p-4 rounded-lg shadow-lg flex items-center justify-between z-[100]";
  const typeClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };
  
  const animationClass = isExiting ? 'animate-toast-out' : 'animate-toast-in';

  return (
    <div className={`${baseClasses} ${typeClasses[toast.type]} ${animationClass}`} role="alert" aria-live="assertive">
      <span>{toast.message}</span>
      <button onClick={onClose} aria-label="Close notification" className="ml-4 p-1 rounded-full hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white">
        &times;
      </button>
    </div>
  );
};

export default Toast;
