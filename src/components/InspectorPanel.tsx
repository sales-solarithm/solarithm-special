import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  SlidersHorizontal,
  Building,
  FileText,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  Layers,
} from 'lucide-react';
import type { ProjectState, CategoryDef, StoredImageItem } from '../lib/types';
import { SequenceDeliverablesTab } from './tabs/SequenceDeliverablesTab';
import { ProjectSpecsTab } from './tabs/ProjectSpecsTab';
import { BrandingTab } from './tabs/BrandingTab';
import { EngineeringNotesTab } from './tabs/EngineeringNotesTab';

interface InspectorPanelProps {
  state: ProjectState;
  onChange: (patch: Partial<ProjectState>) => void;
  categories: CategoryDef[];
  activeCatId: string | null;
  onSelectCategory: (catId: string | null) => void;
  onReorderCategories: (newCats: CategoryDef[]) => void;
  catCounts: Record<string, number>;
  images?: StoredImageItem[];
  onUploadClientLogo: (file: File) => void;
  onClearClientLogo: () => void;
  onUploadSolarithmLogo: (file: File) => void;
  onClearSolarithmLogo: () => void;
}

export type InspectorTab = 'sequence' | 'specs' | 'branding' | 'notes';

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  state,
  onChange,
  categories,
  activeCatId,
  onSelectCategory,
  onReorderCategories,
  catCounts,
  images = [],
  onUploadClientLogo,
  onClearClientLogo,
  onUploadSolarithmLogo,
  onClearSolarithmLogo,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('sequence');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize width from localStorage or default to 420px
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('solarithm_inspector_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 360 && parsed <= 650) {
          return parsed;
        }
      }
    }
    return 420;
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const maxAllowed = Math.min(650, window.innerWidth * 0.45);
      const newWidth = Math.max(360, Math.min(maxAllowed, startWidth + delta));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      const delta = startX - upEvent.clientX;
      const maxAllowed = Math.min(650, window.innerWidth * 0.45);
      const finalWidth = Math.max(360, Math.min(maxAllowed, startWidth + delta));
      localStorage.setItem('solarithm_inspector_width', String(Math.round(finalWidth)));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const tabs: { id: InspectorTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'sequence', label: 'Sequence', icon: ListOrdered },
    { id: 'specs', label: 'Specs', icon: SlidersHorizontal },
    { id: 'branding', label: 'Branding', icon: Building },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  if (isCollapsed) {
    return (
      <div className="w-12 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] flex flex-col items-center py-3 shrink-0 select-none shadow-sm">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg text-zinc-500 hover:text-[#D4AF37] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Expand Specifications Drawer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-4 mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsCollapsed(false);
                }}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#D4AF37] bg-[#D4AF37]/15'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside
      style={{ width: `${panelWidth}px` }}
      className="relative border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] flex flex-col h-full shrink-0 shadow-lg z-20 select-none"
    >
      {/* Draggable Vertical Divider (Left Drag Handle) */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 -left-1.5 w-3 h-full cursor-col-resize z-30 flex items-center justify-center group ${
          isDragging ? 'bg-[#D4AF37]/25' : 'hover:bg-[#D4AF37]/15'
        }`}
        title="Drag to resize inspector panel (360px - 650px)"
      >
        <div
          className={`w-1 h-8 rounded-full transition-colors ${
            isDragging
              ? 'bg-[#D4AF37]'
              : 'bg-zinc-300 dark:bg-zinc-700 group-hover:bg-[#D4AF37]'
          }`}
        />
      </div>
      {/* Drawer Header & Tabs Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-3 pt-3 bg-zinc-50/70 dark:bg-[#141416]/90 shrink-0">
        <div className="flex items-center justify-between pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
              Submission Inspector
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Collapse Drawer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 border-t border-zinc-200/70 dark:border-zinc-800/80 pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-1 text-[11px] font-bold tracking-wide uppercase transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-white dark:bg-[#18181B]'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {activeTab === 'sequence' && (
          <SequenceDeliverablesTab
            categories={categories}
            activeCatId={activeCatId}
            onSelectCategory={onSelectCategory}
            onReorderCategories={onReorderCategories}
            catCounts={catCounts}
            shadowTimes={state.shadowTimes}
            onShadowTimesChange={(times) => onChange({ shadowTimes: times })}
          />
        )}

        {activeTab === 'specs' && (
          <ProjectSpecsTab
            state={state}
            onChange={onChange}
            images={images}
          />
        )}

        {activeTab === 'branding' && (
          <BrandingTab
            clientLogoDataUrl={state.logoDataUrl}
            solarithmLogoDataUrl={state.solarithmLogoDataUrl}
            showClientLogo={state.showLogo}
            showSolarithmBranding={state.showSolarithmBranding}
            onUploadClientLogo={onUploadClientLogo}
            onClearClientLogo={onClearClientLogo}
            onUploadSolarithmLogo={onUploadSolarithmLogo}
            onClearSolarithmLogo={onClearSolarithmLogo}
            onToggleShowClientLogo={(val) => onChange({ showLogo: val })}
            onToggleShowSolarithmBranding={(val) => onChange({ showSolarithmBranding: val })}
          />
        )}

        {activeTab === 'notes' && (
          <EngineeringNotesTab
            state={state}
            onChange={onChange}
          />
        )}
      </div>
    </aside>
  );
};
