import React, { useState } from 'react';
import {
  GripVertical,
  Plus,
  X,
  Clock,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import type { CategoryDef } from '../../lib/types';

interface SequenceDeliverablesTabProps {
  categories: CategoryDef[];
  activeCatId: string | null;
  onSelectCategory: (catId: string | null) => void;
  onReorderCategories: (newCats: CategoryDef[]) => void;
  catCounts: Record<string, number>;
  shadowTimes: string[];
  onShadowTimesChange: (times: string[]) => void;
}

export const SequenceDeliverablesTab: React.FC<SequenceDeliverablesTabProps> = ({
  categories,
  activeCatId,
  onSelectCategory,
  onReorderCategories,
  catCounts,
  shadowTimes,
  onShadowTimesChange,
}) => {
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

  const handleTimeChange = (idx: number, val: string) => {
    const updated = [...shadowTimes];
    updated[idx] = val;
    onShadowTimesChange(updated);
  };

  const handleAddTime = () => {
    onShadowTimesChange([...shadowTimes, '']);
  };

  const handleRemoveTime = (idx: number) => {
    onShadowTimesChange(shadowTimes.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 text-xs">
      {/* 1. Quick Category Mapping Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] font-mono">
            Active Category Selector
          </h4>
          {activeCatId && (
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
            >
              <XCircle className="w-3 h-3" />
              <span>Deselect</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => {
            const isActive = activeCatId === cat.id;
            const count = catCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(isActive ? null : cat.id)}
                className={`p-2 rounded-lg text-left transition-all border flex items-center justify-between gap-1.5 cursor-pointer text-white shadow-xs ${
                  isActive
                    ? 'ring-2 ring-[#D4AF37] font-bold scale-[1.02]'
                    : 'hover:opacity-90 font-semibold'
                }`}
                style={{ backgroundColor: cat.color }}
              >
                <span className="truncate text-[11px]">{cat.label}</span>
                <span className="bg-black/35 px-1.5 py-0.5 rounded-full text-[10px] font-mono shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Drag to Reorder Sequence */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] font-mono">
            PDF Slide Sequence (Drag to Reorder)
          </h4>
          <span className="text-[10px] text-zinc-400 font-mono">Top &rarr; Bottom</span>
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
                className={`h-8 px-2.5 rounded-lg border bg-zinc-50 dark:bg-[#141416] flex items-center justify-between gap-2 transition-all cursor-move select-none ${
                  isDragging
                    ? 'opacity-40 border-dashed border-[#D4AF37]'
                    : isOver
                    ? 'border-[#D4AF37] bg-[#D4AF37]/15'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <GripVertical className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate text-[11px]">
                    {idx + 1}. {cat.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                  {count} {count === 1 ? 'drawing' : 'drawings'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Shadow Analysis Timing Markers */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Shadow Time Badges</span>
          </h4>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const presets = [
                  '21st JUN 9:30 AM',
                  '21st JUN 12:00 PM',
                  '21st JUN 3:30 PM',
                  '21st DEC 9:30 AM',
                  '21st DEC 12:00 PM',
                  '21st DEC 3:30 PM',
                ];
                onShadowTimesChange(presets);
              }}
              className="text-[10px] font-bold text-[#D4AF37] hover:underline cursor-pointer"
              title="Apply standard solar solstice timestamps"
            >
              Solstice Presets
            </button>
            <button
              type="button"
              onClick={handleAddTime}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {shadowTimes.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416]"
            >
              <span className="text-[10px] font-mono text-zinc-400 w-4">#{idx + 1}</span>
              <input
                type="text"
                value={t}
                placeholder="e.g. 21st JUN 9:30 AM"
                onChange={(e) => handleTimeChange(idx, e.target.value)}
                className="flex-1 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 bg-transparent focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleRemoveTime(idx)}
                className="text-red-500 hover:text-red-400 p-0.5 cursor-pointer"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
