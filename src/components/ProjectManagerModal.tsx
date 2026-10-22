import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Save,
  Download,
  Upload,
  Trash2,
  Edit2,
  FolderOpen,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { SavedProject } from '../lib/types';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  currentProjectId: string | null;
  onNewProject: () => void;
  onSaveCurrent: () => void;
  onSaveAs: (name: string) => void;
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onExportProject: (project: SavedProject) => void;
  onImportProject: (file: File) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onNewProject,
  onSaveCurrent,
  onSaveAs,
  onLoadProject,
  onDeleteProject,
  onRenameProject,
  onExportProject,
  onImportProject,
}) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

  // Mini Modal state
  const [promptState, setPromptState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    initialValue?: string;
    onConfirm: (val: string) => void;
  } | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [promptInput, setPromptInput] = useState('');

  if (!isOpen) return null;

  // Filter and Sort
  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  filtered.sort((a, b) => {
    if (sort === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sort === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    if (sort === 'az') return a.name.localeCompare(b.name);
    if (sort === 'za') return b.name.localeCompare(a.name);
    return 0;
  });

  const handleSaveAsClick = () => {
    setPromptInput('');
    setPromptState({
      isOpen: true,
      title: 'Save Project As',
      message: 'Enter a distinctive name for this solar engineering project:',
      initialValue: '',
      onConfirm: (val) => {
        if (val.trim()) onSaveAs(val.trim());
      },
    });
  };

  const handleRenameClick = (proj: SavedProject) => {
    setPromptInput(proj.name);
    setPromptState({
      isOpen: true,
      title: 'Rename Project',
      message: 'Enter the updated project title:',
      initialValue: proj.name,
      onConfirm: (val) => {
        if (val.trim()) onRenameProject(proj.id, val.trim());
      },
    });
  };

  const handleDeleteClick = (proj: SavedProject) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to permanently delete "${proj.name}"? This action cannot be undone.`,
      onConfirm: () => onDeleteProject(proj.id),
    });
  };

  const handleLoadClick = (proj: SavedProject) => {
    setConfirmState({
      isOpen: true,
      title: 'Load Project',
      message: `Load "${proj.name}" into the active studio workspace? Any unsaved edits in current memory will be overwritten.`,
      onConfirm: () => {
        onLoadProject(proj);
        onClose();
      },
    });
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' ' + d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Project Management Dashboard</span>
                <span className="text-[11px] font-mono font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/25">
                  IndexedDB Persistent
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Organize, backup, and restore solar engineering submission projects.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-[#141416] border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setConfirmState({
                  isOpen: true,
                  title: 'Start New Project',
                  message: 'Start a clean project? Make sure to save your current work if needed.',
                  onConfirm: () => {
                    onNewProject();
                    onClose();
                  },
                });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>

            <button
              onClick={onSaveCurrent}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Current</span>
            </button>

            <button
              onClick={handleSaveAsClick}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save As...</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportProject(file);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-2 flex-1 max-w-sm ml-auto">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37] cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[300px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400">
              <FolderOpen className="w-12 h-12 stroke-[1.2] opacity-40 mb-3 text-[#D4AF37]" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {search ? 'No matching projects found' : 'No saved projects in local storage'}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                {search
                  ? 'Try searching with another keyword or clear the search input.'
                  : 'Click "Save Current" or "New Project" to create your first engineering submission profile.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filtered.map((proj) => {
                const isActive = proj.id === currentProjectId;
                const thumbnailUrl = proj.thumbnail || proj.images?.[0]?.dataUrl || proj.state?.logoDataUrl;
                const drawingCount = proj.images?.length || Object.keys(proj.state?.catAssignData || {}).length;

                return (
                  <div
                    key={proj.id}
                    className={`rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                      isActive
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5 dark:bg-[#D4AF37]/[0.04] shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      {/* Project Thumbnail Snapshot */}
                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-zinc-100 dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 mb-3 flex items-center justify-center">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={proj.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-400">
                            <FolderOpen className="w-8 h-8 stroke-[1.2] text-[#D4AF37]/50 mb-1" />
                            <span className="text-[10px] font-mono text-zinc-500">Solar Engineering Layout</span>
                          </div>
                        )}
                        {isActive && (
                          <span className="absolute top-2 right-2 text-[10px] font-mono uppercase bg-[#D4AF37] text-zinc-950 font-extrabold px-1.5 py-0.5 rounded-sm shadow-xs">
                            Active
                          </span>
                        )}
                        {drawingCount > 0 && (
                          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-zinc-200 border border-white/10">
                            {drawingCount} {drawingCount === 1 ? 'drawing' : 'drawings'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3
                          className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate flex-1"
                          title={proj.name}
                        >
                          {proj.name}
                        </h3>
                      </div>

                      <div className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">Mod: {formatDate(proj.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">Created: {formatDate(proj.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <button
                        onClick={() => handleLoadClick(proj)}
                        className="flex-1 py-1.5 px-2 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-[#D4AF37] hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors text-center cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onExportProject(proj)}
                        title="Export JSON"
                        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRenameClick(proj)}
                        title="Rename Project"
                        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(proj)}
                        title="Delete Project"
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mini Prompt Modal */}
      {promptState && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85">
          <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#D4AF37]/40 rounded-xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-[#D4AF37] mb-2">
              {promptState.title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-4">
              {promptState.message}
            </p>
            <input
              type="text"
              autoFocus
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  promptState.onConfirm(promptInput);
                  setPromptState(null);
                } else if (e.key === 'Escape') {
                  setPromptState(null);
                }
              }}
              placeholder="e.g. 50kW Rooftop Solar - Adani Site"
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#0E0E10] text-zinc-900 dark:text-zinc-100 mb-4 focus:outline-hidden focus:border-[#D4AF37]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPromptState(null)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  promptState.onConfirm(promptInput);
                  setPromptState(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85">
          <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#D4AF37]/40 rounded-xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-[#D4AF37] mb-2">
              {confirmState.title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-5 leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmState(null)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
