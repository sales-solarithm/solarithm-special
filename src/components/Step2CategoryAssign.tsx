import React, { useRef, useState } from 'react';
import {
  GripVertical,
  Upload,
  X,
  Building,
  CheckSquare,
  Square,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import type { CategoryDef } from '../lib/types';
import { SOLARITHM_LOGO_SVG } from '../lib/defaultAssets';

interface Step2CategoryAssignProps {
  categories: CategoryDef[];
  activeCatId: string | null;
  catCounts: Record<string, number>;
  onSelectCategory: (catId: string | null) => void;
  onReorderCategories: (newCategories: CategoryDef[]) => void;
  // Logos
  clientLogoDataUrl: string | null;
  solarithmLogoDataUrl: string | null;
  showClientLogo: boolean;
  showSolarithmBranding: boolean;
  onUploadClientLogo: (file: File) => void;
  onClearClientLogo: () => void;
  onUploadSolarithmLogo: (file: File) => void;
  onClearSolarithmLogo: () => void;
  onToggleShowClientLogo: (val: boolean) => void;
  onToggleShowSolarithmBranding: (val: boolean) => void;
}

export const Step2CategoryAssign: React.FC<Step2CategoryAssignProps> = ({
  categories,
  activeCatId,
  catCounts,
  onSelectCategory,
  onReorderCategories,
  clientLogoDataUrl,
  solarithmLogoDataUrl,
  showClientLogo,
  showSolarithmBranding,
  onUploadClientLogo,
  onClearClientLogo,
  onUploadSolarithmLogo,
  onClearSolarithmLogo,
  onToggleShowClientLogo,
  onToggleShowSolarithmBranding,
}) => {
  const clientLogoInputRef = useRef<HTMLInputElement>(null);
  const solarithmLogoInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state for category reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...categories];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    onReorderCategories(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <section className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-[rgba(212,175,55,0.15)] text-[#D4AF37] font-mono text-xs font-bold flex items-center justify-center border border-[#D4AF37]/30">
            02
          </span>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            Category Matrix &amp; Branding Architecture
          </h2>
        </div>
      </div>

      {/* Instruction Strip */}
      <div className="mb-5 p-3.5 rounded-xl bg-[rgba(212,175,55,0.07)] border border-[#D4AF37]/20 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#D4AF37]">Workflow Instructions: </span>
          Click any category button below to engage <strong>Assign Mode</strong> &rarr; Click images in Step 1 to map them &rarr; Assigned items display a colored badge &rarr; Reorder categories on the left to control exact PDF slide page sequence.
        </div>
      </div>

      {/* Category Buttons Row */}
      <div className="flex flex-wrap gap-2.5 mb-4">
        {categories.map((cat) => {
          const isActive = activeCatId === cat.id;
          const count = catCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer shadow-xs ${
                isActive
                  ? 'ring-2 ring-[#D4AF37] shadow-md scale-102 text-white'
                  : 'text-white hover:-translate-y-0.5'
              }`}
              style={{ backgroundColor: cat.color }}
            >
              <span>{cat.label}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/30 text-white font-bold">
                {count}
              </span>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              )}
            </button>
          );
        })}

        {activeCatId && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#141416] text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Deselect Active Mode</span>
          </button>
        )}
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const count = catCounts[cat.id] || 0;
          if (count === 0) return null;

          return (
            <div
              key={cat.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white shadow-xs"
              style={{ backgroundColor: cat.color }}
            >
              <span>{cat.label}</span>
              <span className="bg-black/30 px-1.5 py-0.2 rounded font-mono font-bold">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Two-Column Layout: Reorder Left (65%) + Logo Right (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {/* Left Column: Reorder Panel (7 cols / ~60-65%) */}
        <div className="lg:col-span-7 bg-zinc-50 dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <span>PDF Category Slide Sequence (Drag to Reorder)</span>
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">
              Top to Bottom
            </span>
          </div>

          <div className="space-y-1.5">
            {categories.map((cat, idx) => {
              const isDragging = draggedIndex === idx;
              const isOver = dragOverIndex === idx;
              const count = catCounts[cat.id] || 0;

              return (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`h-9 px-3 rounded-lg border bg-white dark:bg-[#18181B] flex items-center justify-between gap-3 text-xs transition-all cursor-move select-none ${
                    isDragging
                      ? 'opacity-40 border-dashed border-[#D4AF37]'
                      : isOver
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-400 hover:text-[#D4AF37] shrink-0" />
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {idx + 1}. {cat.label}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                    {count} {count === 1 ? 'drawing' : 'drawings'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Logo & Branding Panel (5 cols / ~35-40%) */}
        <div className="lg:col-span-5 bg-zinc-50 dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Logo &amp; Header Branding</span>
              </h3>
            </div>

            {/* Mini upload zones side by side */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {/* Client Logo Zone */}
              <div
                onClick={() => clientLogoInputRef.current?.click()}
                className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#D4AF37] bg-white dark:bg-[#18181B] rounded-lg p-3 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1"
              >
                <input
                  ref={clientLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      onUploadClientLogo(f);
                      e.target.value = '';
                    }
                  }}
                />
                <Upload className="w-3.5 h-3.5 text-[#D4AF37] mb-0.5" />
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                  Client Logo
                </span>
                <span className="text-[9px] text-zinc-400">
                  Top-Right in PDF
                </span>
              </div>

              {/* Solarithm Logo Zone */}
              <div
                onClick={() => solarithmLogoInputRef.current?.click()}
                className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#D4AF37] bg-white dark:bg-[#18181B] rounded-lg p-3 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1"
              >
                <input
                  ref={solarithmLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      onUploadSolarithmLogo(f);
                      e.target.value = '';
                    }
                  }}
                />
                <Upload className="w-3.5 h-3.5 text-[#D4AF37] mb-0.5" />
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                  Solarithm Logo
                </span>
                <span className="text-[9px] text-zinc-400">
                  Top-Left in PDF
                </span>
              </div>
            </div>

            {/* Previews */}
            <div className="space-y-2 mb-4">
              {clientLogoDataUrl && (
                <div className="p-2 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={clientLogoDataUrl}
                      alt="Client Logo"
                      className="h-7 max-w-[60px] object-contain rounded-sm bg-white"
                    />
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                      Client Logo
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onClearClientLogo}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                    title="Remove client logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {solarithmLogoDataUrl && (
                <div className="p-2 rounded-lg bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={solarithmLogoDataUrl}
                      alt="Solarithm Logo"
                      className="h-7 max-w-[60px] object-contain rounded-sm bg-white"
                    />
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                      Custom Solarithm Logo
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onClearSolarithmLogo}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                    title="Reset to default official Solarithm logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Inclusion Toggles */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showClientLogo}
                onChange={(e) => onToggleShowClientLogo(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37] cursor-pointer"
              />
              <span>Include Client logo in PDF header</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSolarithmBranding}
                onChange={(e) => onToggleShowSolarithmBranding(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37] cursor-pointer"
              />
              <span>Include SOLARITHM logo in PDF header</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};
