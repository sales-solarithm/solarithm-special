import React from 'react';
import { FolderOpen, Save, FileDown, Loader2 } from 'lucide-react';

interface StickyActionBarProps {
  fileName: string;
  onFileNameChange: (val: string) => void;
  currentProjectName: string | null;
  onOpenProjects: () => void;
  onSaveProject: () => void;
  onGeneratePdf: () => void;
  isGeneratingPdf: boolean;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  fileName,
  onFileNameChange,
  currentProjectName,
  onOpenProjects,
  onSaveProject,
  onGeneratePdf,
  isGeneratingPdf,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 py-3 px-4 sm:px-8 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Brand & Filename Input */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 font-bold tracking-widest text-sm text-[#D4AF37]">
            <span>SOLARITHM</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0">
              PDF File Name:
            </label>
            <input
              type="text"
              placeholder="e.g. SOLARITHM_REPORT"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0E0E10] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] w-48 sm:w-64"
            />
          </div>

          {currentProjectName && (
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-[#D4AF37] bg-[rgba(212,175,55,0.15)] px-2.5 py-1 rounded-md border border-[#D4AF37]/30 truncate max-w-xs">
              <span>&#128193;</span>
              <span className="truncate">{currentProjectName}</span>
            </div>
          )}
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button
            type="button"
            onClick={onOpenProjects}
            className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141416] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Projects</span>
          </button>

          <button
            type="button"
            onClick={onSaveProject}
            className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141416] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={onGeneratePdf}
            disabled={isGeneratingPdf}
            className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B89328] active:scale-98 text-zinc-950 font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'GENERATE PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
