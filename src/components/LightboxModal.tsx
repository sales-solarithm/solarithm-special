import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-150"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
        title="Close (ESC)"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-[95vw] max-h-[92vh] flex items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Technical Drawing Zoom"
          className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-zinc-800"
        />
      </div>
    </div>
  );
};
