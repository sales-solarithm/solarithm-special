import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobUrl: string | null;
  filename: string;
  pageCount: number;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  blobUrl,
  filename,
  pageCount,
}) => {
  if (!isOpen || !blobUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-6xl h-[92vh] bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.15)] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {filename}
              </h3>
              <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                A4 Landscape Presentation &bull; {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} Compiled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <a
              href={blobUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#D4AF37] transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Embedded Viewport */}
        <div className="flex-1 bg-zinc-900 relative">
          <object
            data={blobUrl}
            type="application/pdf"
            className="w-full h-full rounded-b-2xl"
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400 space-y-3">
              <p className="text-sm font-semibold text-zinc-300">PDF preview could not be rendered inline.</p>
              <a
                href={blobUrl}
                download={filename || 'Design_Submission.pdf'}
                className="mt-3 px-4 py-2 bg-[#D4AF37] hover:bg-[#B89328] text-black font-semibold rounded-md text-xs uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Directly</span>
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};
