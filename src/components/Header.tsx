import React from 'react';
import { Sun, Moon, FolderOpen, Save, FileDown, Cloud } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SOLARITHM_LOGO_SVG } from '../lib/defaultAssets';

interface HeaderProps {
  currentProjectName: string | null;
  onOpenProjects: () => void;
  onSaveProject: () => void;
  onGeneratePdf: () => void;
  isGeneratingPdf?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProjectName,
  onOpenProjects,
  onSaveProject,
  onGeneratePdf,
  isGeneratingPdf = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#0E0E10]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-0.5 flex items-center justify-center shadow-xs">
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: SOLARITHM_LOGO_SVG }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>SOLARITHM</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-[rgba(212,175,55,0.15)] text-[#D4AF37] border border-[#D4AF37]/30 font-semibold tracking-wider">
                STUDIO V8
              </span>
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 -mt-0.5 font-medium hidden sm:inline">
              Design &amp; Engineering Submission Engine
            </span>
          </div>
        </div>

        {/* Center: Cloud Sync + Active Project Badge */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-[#18181B] px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
            <Cloud className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Hybrid Sync (Firestore &bull; IndexedDB)</span>
          </div>

          {currentProjectName && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-[#18181B] px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 truncate max-w-xs">
              <span className="text-[#D4AF37] dark:text-[#D4AF37] font-semibold">Active:</span>
              <span className="truncate">{currentProjectName}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#18181B] text-zinc-700 dark:text-zinc-300 hover:text-[#D4AF37] dark:hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Projects Drawer */}
          <button
            type="button"
            onClick={onOpenProjects}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-bold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Projects</span>
          </button>

          {/* Quick Save */}
          <button
            type="button"
            onClick={onSaveProject}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-bold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Generate PDF Button */}
          <button
            type="button"
            onClick={onGeneratePdf}
            disabled={isGeneratingPdf}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C9A84C] hover:bg-[#B89328] active:scale-98 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-all shadow-sm shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Compiling...' : 'Generate PDF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
