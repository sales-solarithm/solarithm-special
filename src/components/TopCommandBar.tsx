import React, { useRef } from 'react';
import {
  Sun,
  Moon,
  FolderOpen,
  Download,
  Upload,
  FileDown,
  Edit2,
  Check,
  Save,
  Layers,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TopCommandBarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  syncStatus: 'synced' | 'drafting' | 'cloud' | 'saved_now';
  onSaveProject: () => void;
  onOpenProjects: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onGeneratePdf: () => void;
  isGeneratingPdf: boolean;
  assignedCount?: number;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  projectName,
  onProjectNameChange,
  syncStatus,
  onSaveProject,
  onOpenProjects,
  onExportJson,
  onImportJson,
  onGeneratePdf,
  isGeneratingPdf,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const importInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="h-14 sm:h-16 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0E0E10]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-40 select-none">
      {/* 1. Left Zone: Technical Studio Icon Badge & Two-line Title / Subtitle */}
      <div className="flex items-center gap-3 sm:gap-3.5 shrink-0">
        <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-[#D4AF37]/30 bg-zinc-100 dark:bg-[#1A1A1E] flex items-center justify-center shrink-0 shadow-xs">
          <Layers className="w-5 h-5 text-[#D4AF37]" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Solarithm Canvas
          </h1>
          <p className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide leading-tight">
            Executive Engineering Design Submission Console
          </p>
        </div>
      </div>

      {/* 2. Right Zone: Project Name Input + Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Dedicated Styled Project Name Input Box */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B] focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/30 transition-all">
          <Edit2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="Enter Project Name..."
            aria-label="Project Name"
            className="bg-transparent text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden w-32 sm:w-48 md:w-56 font-sans"
          />
          {syncStatus === 'saved_now' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] shrink-0 animate-in fade-in" title="Saved just now">
              <Check className="w-3 h-3 stroke-[3]" />
              <span className="hidden xl:inline">Saved</span>
            </span>
          )}
        </div>

        {/* Light/Dark Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B] text-zinc-700 dark:text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Dedicated Save Project Button */}
        <button
          type="button"
          onClick={onSaveProject}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#D4AF37]/50 bg-[rgba(212,175,55,0.15)] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-zinc-950 text-xs font-bold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          title="Save active project to IndexedDB"
        >
          {syncStatus === 'saved_now' ? (
            <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
          ) : (
            <Save className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{syncStatus === 'saved_now' ? 'Saved' : 'Save'}</span>
        </button>

        {/* Projects Modal Trigger */}
        <button
          type="button"
          onClick={onOpenProjects}
          className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Open saved projects manager"
        >
          <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <span className="hidden sm:inline">Projects</span>
        </button>

        {/* Import JSON */}
        <label
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Import JSON Project File"
        >
          <Upload className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="hidden lg:inline">Import JSON</span>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportJson(file);
                e.target.value = '';
              }
            }}
          />
        </label>

        {/* Export JSON */}
        <button
          type="button"
          onClick={onExportJson}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Export current workspace state as JSON"
        >
          <Download className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="hidden lg:inline">Export JSON</span>
        </button>

        {/* Prominent Solar Gold Primary Action Button */}
        <button
          type="button"
          onClick={onGeneratePdf}
          disabled={isGeneratingPdf}
          className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] hover:from-[#E2C76A] hover:to-[#B89328] active:scale-98 text-zinc-950 font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-[#D4AF37]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <FileDown className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">
            {isGeneratingPdf ? 'Compiling PDF...' : 'Generate Submission PDF'}
          </span>
          <span className="sm:hidden">
            {isGeneratingPdf ? 'PDF...' : 'PDF'}
          </span>
        </button>
      </div>
    </header>
  );
};
