import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  LayoutGrid,
  ListFilter,
  Eye,
  X,
  Tag,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  XCircle,
} from 'lucide-react';
import type { CategoryDef } from '../lib/types';

interface ImageItemData {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
}

interface DeliverablesCanvasProps {
  images: ImageItemData[];
  catAssign: Record<string, string>;
  catOrder: Record<string, string[]>;
  categories: CategoryDef[];
  activeCatId: string | null;
  onUploadFiles: (files: FileList | File[]) => void;
  onClearAll: () => void;
  onAssignImage: (id: string) => void;
  onUnassignImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onPreviewImage: (dataUrl: string) => void;
  onStopAssign: () => void;
}

export const DeliverablesCanvas: React.FC<DeliverablesCanvasProps> = ({
  images,
  catAssign,
  catOrder,
  categories,
  activeCatId,
  onUploadFiles,
  onClearAll,
  onAssignImage,
  onUnassignImage,
  onRemoveImage,
  onPreviewImage,
  onStopAssign,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'dense'>('grid');
  const [filterCatId, setFilterCatId] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCategory = categories.find((c) => c.id === activeCatId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  // Order badges lookup
  const orderBadges: Record<string, number> = {};
  categories.forEach((cat) => {
    const list = catOrder[cat.id] || [];
    list.forEach((id, idx) => {
      if (catAssign[id] === cat.id) {
        orderBadges[id] = idx + 1;
      }
    });
  });

  // Filtered list
  const filteredImages = images.filter((img) => {
    if (filterCatId === 'all') return true;
    if (filterCatId === 'unassigned') return !catAssign[img.id];
    return catAssign[img.id] === filterCatId;
  });

  const assignedCount = Object.keys(catAssign).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-100/70 dark:bg-[#0E0E10]">
      {/* Hidden File Input for dropzone and toolbar triggers */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            onUploadFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* 1. Sleek Top Toolbar (only shown when drawings exist in pool) */}
      {images.length > 0 && (
        <div className="h-13 px-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#141416]/90 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B] hover:border-[#D4AF37] hover:text-[#D4AF37] text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Add more drawings to pool"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Add More</span>
            </button>

            <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 hidden sm:flex items-center gap-1.5">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{images.length}</span>
              <span>Drawings</span>
              <span>&bull;</span>
              <span className="text-[#D4AF37] font-semibold">{assignedCount} Mapped</span>
            </div>

            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2 cursor-pointer"
            >
              Clear Pool
            </button>
          </div>

          {/* View Controls & Filter */}
          <div className="flex items-center gap-2">
            {/* Quick Filter Selector */}
            <select
              value={filterCatId}
              onChange={(e) => setFilterCatId(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
            >
              <option value="all">All Drawings ({images.length})</option>
              <option value="unassigned">Unassigned ({images.length - assignedCount})</option>
              {categories.map((c) => {
                const cnt = (catOrder[c.id] || []).filter((id) => catAssign[id] === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.label} ({cnt})
                  </option>
                );
              })}
            </select>

            {/* View Toggle */}
            <div className="flex items-center p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-[#18181B]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#27272A] text-[#D4AF37] shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
                title="16:9 Card Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('dense')}
                className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'dense'
                    ? 'bg-white dark:bg-[#27272A] text-[#D4AF37] shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
                title="Dense Tile View"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Assign Mode Banner */}
      {activeCategory && (
        <div className="px-4 sm:px-6 py-2.5 bg-[#D4AF37]/15 border-b border-[#D4AF37]/30 flex items-center justify-between gap-3 text-xs shrink-0 select-none animate-in fade-in">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="font-semibold text-[#D4AF37] uppercase font-mono tracking-wider">
              ASSIGN MODE ACTIVE:
            </span>
            <span>Click any layout drawing below to bind it to</span>
            <span
              className="font-bold uppercase px-2 py-0.5 rounded-sm text-white shadow-xs"
              style={{ backgroundColor: activeCategory.color }}
            >
              {activeCategory.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onStopAssign}
            className="px-2.5 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Finish Assigning</span>
          </button>
        </div>
      )}

      {/* 2. Scrollable Canvas Body */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
      >
        {/* Modern Hairline Dropzone */}
        {images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-[#D4AF37] dark:hover:border-[#D4AF37] bg-white/60 dark:bg-[#141416]/60 hover:bg-[#D4AF37]/[0.03] rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 my-auto min-h-[360px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Drop Solar Engineering Drawings &amp; 3D Visualizations
              </h3>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                PNG
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                JPG
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                WEBP
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                CAD EXPORTS
              </span>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            }`}
          >
            {filteredImages.map((img) => {
              const assignedCatId = catAssign[img.id];
              const assignedCat = categories.find((c) => c.id === assignedCatId);
              const orderNum = orderBadges[img.id];

              return (
                <div
                  key={img.id}
                  onClick={() => {
                    if (activeCatId) {
                      onAssignImage(img.id);
                    } else {
                      onPreviewImage(img.dataUrl);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (assignedCatId) {
                      onUnassignImage(img.id);
                    }
                  }}
                  className={`group relative rounded-xl overflow-hidden border-2 bg-white dark:bg-[#18181B] transition-all cursor-pointer flex flex-col select-none ${
                    assignedCat
                      ? 'shadow-md scale-[1.01]'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                  style={{
                    borderColor: assignedCat ? assignedCat.color : undefined,
                  }}
                  title={
                    activeCatId
                      ? `Click to assign to ${activeCategory?.label}`
                      : assignedCat
                      ? `${assignedCat.label} (Right click to unassign)`
                      : 'Click to zoom in preview'
                  }
                >
                  {/* Thumbnail Container (16:9 Aspect Ratio) */}
                  <div className="relative aspect-16/9 w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-103 pointer-events-none"
                      loading="lazy"
                    />

                    {/* Category Label Chip */}
                    {assignedCat ? (
                      <div
                        className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-md text-white pointer-events-none"
                        style={{ backgroundColor: assignedCat.color }}
                      >
                        {assignedCat.label}
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-black/60 text-zinc-300 backdrop-blur-xs pointer-events-none">
                        Unassigned
                      </div>
                    )}

                    {/* Numerical Order Badge */}
                    {orderNum !== undefined && (
                      <div className="absolute bottom-2 right-2 bg-black/85 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm pointer-events-none shadow-xs">
                        Slide #{orderNum}
                      </div>
                    )}

                    {/* Hover Actions Bar */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewImage(img.dataUrl);
                        }}
                        className="p-1 rounded-md bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
                        title="Zoom Drawing"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {assignedCat && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnassignImage(img.id);
                          }}
                          className="p-1 rounded-md bg-black/70 hover:bg-[#D4AF37] text-white hover:text-zinc-950 transition-colors cursor-pointer"
                          title="Unassign from category"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveImage(img.id);
                        }}
                        className="p-1 rounded-md bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                        title="Delete render"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Footer / Filename */}
                  <div className="p-2.5 bg-white dark:bg-[#18181B] border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <p
                      className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 truncate flex-1"
                      title={img.name}
                    >
                      {img.name}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {(img.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
