import React from 'react';
import { Plus, X, Moon, Clock } from 'lucide-react';

interface Step4ShadowTimesProps {
  shadowTimes: string[];
  onChange: (times: string[]) => void;
}

export const Step4ShadowTimes: React.FC<Step4ShadowTimesProps> = ({
  shadowTimes,
  onChange,
}) => {
  const handleTimeChange = (index: number, val: string) => {
    const updated = [...shadowTimes];
    updated[index] = val;
    onChange(updated);
  };

  const handleAddTime = () => {
    onChange([...shadowTimes, '']);
  };

  const handleRemoveTime = (index: number) => {
    const updated = shadowTimes.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <section className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-[rgba(212,175,55,0.15)] text-[#D4AF37] font-mono text-xs font-bold flex items-center justify-center border border-[#D4AF37]/30">
            04
          </span>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            Shadow Analysis &mdash; Time Markers
          </h2>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
        Assign shadow drawings to the <strong>Shadow Analysis</strong> category. Each assigned image automatically gets its corresponding timestamp badge printed at the bottom-center of its PDF slide.
      </p>

      {/* Time Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {shadowTimes.map((t, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416]"
          >
            <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <input
              type="text"
              value={t}
              placeholder="e.g. 21st JUN 9:30 AM"
              onChange={(e) => handleTimeChange(idx, e.target.value)}
              className="flex-1 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 bg-transparent focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
            <button
              type="button"
              onClick={() => handleRemoveTime(idx)}
              className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
              title="Remove timestamp"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddTime}
        className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Date &amp; Timing Marker</span>
      </button>
    </section>
  );
};
