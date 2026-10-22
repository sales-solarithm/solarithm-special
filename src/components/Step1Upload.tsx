import React, { useRef } from 'react';
import { UploadCloud, Trash2, X, Eye, Image as ImageIcon } from 'lucide-react';
import type { CategoryDef } from '../lib/types';

interface ImageItemData {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
}

interface Step1UploadProps {
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

export const Step1Upload: React.FC<Step1UploadProps> = ({
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

  // Build order badge lookup (category -> id -> index)
  const orderBadges: Record<string, number> = {};
  categories.forEach((cat) => {
    const list = catOrder[cat.id] || [];
    list.forEach((id, idx) => {
      if (catAssign[id] === cat.id) {
        orderBadges[id] = idx + 1;
      }
    });
  });

  return (
    <section className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] font-mono text-xs font-bold flex items-center justify-center border border-[#D4AF37]/30">
            01
          </span>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            Upload &amp; Image Repository
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {images.length} {images.length === 1 ? 'image' : 'images'} loaded
          </span>
          {images.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="group border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#D4AF37] dark:hover:border-[#D4AF37] bg-zinc-50/70 dark:bg-[#141416] hover:bg-[#D4AF37]/[0.03] transition-all rounded-xl p-8 text-center cursor-pointer relative"
      >
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
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 group-hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] transition-colors">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
            Click or drag &amp; drop engineering drawings, 3D renders, and site photos
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
            All images are securely indexed in your browser's IndexedDB storage without quota limitations. Assign them to report categories in Step 2.
          </div>
        </div>
      </div>

      {/* Active Assignment Banner */}
      {activeCategory && (
        <div className="mt-4 p-3 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/15 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-medium text-[#D4AF37]">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
            <span>
              <strong>ASSIGN MODE ACTIVE:</strong> Click any image below to assign it to{' '}
              <span
                className="font-bold underline uppercase px-1 rounded-sm"
                style={{ color: activeCategory.color }}
              >
                {activeCategory.label}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onStopAssign}
            className="px-2 py-1 rounded-md bg-zinc-900 dark:bg-zinc-800 text-zinc-100 hover:bg-zinc-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Stop Assigning</span>
          </button>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {images.map((img) => {
            const assignedCatId = catAssign[img.id];
            const assignedCat = categories.find((c) => c.id === assignedCatId);
            const orderNum = orderBadges[img.id];

            return (
              <div
                key={img.id}
                onClick={(e) => {
                  e.stopPropagation();
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
                className={`group relative rounded-xl overflow-hidden border-2 bg-zinc-100 dark:bg-[#141416] transition-all select-none cursor-pointer flex flex-col ${
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
                    : 'Click to zoom, or select category below to assign'
                }
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 pointer-events-none"
                    loading="lazy"
                  />

                  {/* Category Tag */}
                  {assignedCat && (
                    <div
                      className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm shadow-xs text-white pointer-events-none"
                      style={{ backgroundColor: assignedCat.color }}
                    >
                      {assignedCat.label}
                    </div>
                  )}

                  {/* Order Badge */}
                  {orderNum !== undefined && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm pointer-events-none">
                      #{orderNum}
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(img.id);
                    }}
                    title="Remove image"
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Zoom Overlay on Hover if not in assign mode */}
                  {!activeCatId && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <Eye className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Caption / Filename */}
                <div className="px-2 py-1.5 bg-white dark:bg-[#18181B] border-t border-zinc-200 dark:border-zinc-800/60">
                  <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate text-center" title={img.name}>
                    {img.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
