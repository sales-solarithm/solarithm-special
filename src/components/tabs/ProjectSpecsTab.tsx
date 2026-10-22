import React from 'react';
import {
  FileText,
  Eye,
  EyeOff,
  Calculator,
} from 'lucide-react';
import type { ProjectState, StoredImageItem } from '../../lib/types';

interface ProjectSpecsTabProps {
  state: ProjectState;
  onChange: (patch: Partial<ProjectState>) => void;
  images?: StoredImageItem[];
}

export const ProjectSpecsTab: React.FC<ProjectSpecsTabProps> = ({
  state,
  onChange,
}) => {
  // Auto-calculate capacity from modules count * wattage
  const handleAutoCalculateCapacity = () => {
    const count = parseFloat(state.introNumPanels.replace(/[^\d.]/g, ''));
    const wp = parseFloat(state.introPanelWp.replace(/[^\d.]/g, ''));
    if (!isNaN(count) && !isNaN(wp) && count > 0 && wp > 0) {
      const kw = ((count * wp) / 1000).toFixed(2);
      onChange({ introPlantCapacity: `${kw} KWp` });
    }
  };

  // Specs Rows Definition (Clean labels without text clutter)
  const specRows = [
    {
      id: 'client',
      label: 'Client Name',
      value: state.introClientName,
      show: state.showClientName,
      onValueChange: (val: string) => onChange({ introClientName: val }),
      onToggleShow: (show: boolean) => onChange({ showClientName: show }),
      placeholder: 'e.g. ADANI SOLAR RESIDENCE',
      type: 'text',
    },
    {
      id: 'date',
      label: 'Date of Submission',
      value: state.introDate,
      show: state.showDate,
      onValueChange: (val: string) => onChange({ introDate: val }),
      onToggleShow: (show: boolean) => onChange({ showDate: show }),
      placeholder: 'e.g. October 12, 2026',
      type: 'text',
    },
    {
      id: 'epc',
      label: 'EPC / Engineering Partner',
      value: state.introEPCCompany,
      show: state.showEPCCompany,
      onValueChange: (val: string) => onChange({ introEPCCompany: val }),
      onToggleShow: (show: boolean) => onChange({ showEPCCompany: show }),
      placeholder: 'e.g. Tirupati Sunmart & CO.',
      type: 'text',
    },
    {
      id: 'panels',
      label: 'Total Module Count',
      value: state.introNumPanels,
      show: state.showNumPanels,
      onValueChange: (val: string) => onChange({ introNumPanels: val }),
      onToggleShow: (show: boolean) => onChange({ showNumPanels: show }),
      placeholder: 'e.g. 100',
      type: 'text',
    },
    {
      id: 'brand',
      label: 'Panel Brand',
      value: state.introPanelBrand,
      show: state.showPanelBrand,
      onValueChange: (val: string) => onChange({ introPanelBrand: val }),
      onToggleShow: (show: boolean) => onChange({ showPanelBrand: show }),
      placeholder: 'e.g. Waaree / Tata Power Solar',
      type: 'text',
    },
    {
      id: 'wp',
      label: 'Rated Wattage (Wp)',
      value: state.introPanelWp,
      show: state.showPanelWp,
      onValueChange: (val: string) => onChange({ introPanelWp: val }),
      onToggleShow: (show: boolean) => onChange({ showPanelWp: show }),
      placeholder: 'e.g. 545W Mono PERC',
      type: 'text',
    },
    {
      id: 'capacity',
      label: 'Total DC Capacity (kW)',
      value: state.introPlantCapacity,
      show: state.showPlantCapacity,
      onValueChange: (val: string) => onChange({ introPlantCapacity: val }),
      onToggleShow: (show: boolean) => onChange({ showPlantCapacity: show }),
      placeholder: 'e.g. 54.5 KWp',
      type: 'text',
      hasCalc: true,
    },
    {
      id: 'inv_brand',
      label: 'Inverter Brand & Model',
      value: state.introInverterBrand,
      show: state.showInverterBrand,
      onValueChange: (val: string) => onChange({ introInverterBrand: val }),
      onToggleShow: (show: boolean) => onChange({ showInverterBrand: show }),
      placeholder: 'e.g. SolarEdge / Sungrow SG50CX',
      type: 'text',
    },
    {
      id: 'inv_rating',
      label: 'Inverter Rating (kW)',
      value: state.introInverter,
      show: state.showInverter,
      onValueChange: (val: string) => onChange({ introInverter: val }),
      onToggleShow: (show: boolean) => onChange({ showInverter: show }),
      placeholder: 'e.g. 50 KW',
      type: 'text',
    },
    {
      id: 'tilt',
      label: 'Array Tilt Angle',
      value: state.introTiltAngle,
      show: state.showTiltAngle,
      onValueChange: (val: string) => onChange({ introTiltAngle: val }),
      onToggleShow: (show: boolean) => onChange({ showTiltAngle: show }),
      placeholder: 'e.g. 15° True South',
      type: 'text',
    },
  ];

  return (
    <div className="space-y-6 text-xs select-none">
      {/* ── 1. MASTER TOGGLE SWITCH ── */}
      <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#141416] transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                state.showIntroPage
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
              }`}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                Include Project Introduction Slide in PDF
              </span>
              {state.showIntroPage && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
                  SLIDE #1
                </span>
              )}
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={state.showIntroPage}
              onChange={(e) => onChange({ showIntroPage: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5.5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
          </label>
        </div>
      </div>

      {/* ── 2. PROJECT SPECIFICATIONS SCHEDULE (2-COLUMN TABULAR FORM) ── */}
      {state.showIntroPage ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-[#D4AF37] font-mono">
              Project Parameters Schedule
            </h3>
            <button
              type="button"
              onClick={() =>
                onChange({
                  showClientName: true,
                  showDate: true,
                  showEPCCompany: true,
                  showNumPanels: true,
                  showPanelBrand: true,
                  showPanelWp: true,
                  showPlantCapacity: true,
                  showInverterBrand: true,
                  showInverter: true,
                  showTiltAngle: true,
                })
              }
              className="px-2 py-0.5 rounded text-[10px] font-bold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
              title="Show all rows"
            >
              Show All
            </button>
          </div>

          {/* 2-Column Tabular Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {specRows.map((row) => (
              <div
                key={row.id}
                className={`p-2.5 rounded-lg border transition-all ${
                  row.show
                    ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B]'
                    : 'border-zinc-200/60 dark:border-zinc-800/40 bg-zinc-100/50 dark:bg-zinc-900/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`font-semibold text-[11px] truncate ${
                        row.show
                          ? 'text-zinc-800 dark:text-zinc-200'
                          : 'text-zinc-400 dark:text-zinc-500 line-through'
                      }`}
                    >
                      {row.label}
                    </span>
                    {!row.show && (
                      <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-1 py-0.2 rounded">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {row.hasCalc && (
                      <button
                        type="button"
                        onClick={handleAutoCalculateCapacity}
                        className="p-1 rounded text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center gap-0.5 text-[10px] font-mono cursor-pointer"
                        title="Auto-calculate capacity from Panels × Wp / 1000"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Calc</span>
                      </button>
                    )}

                    {/* Visibility Eye Toggle */}
                    <button
                      type="button"
                      onClick={() => row.onToggleShow(!row.show)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        row.show
                          ? 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
                          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                      }`}
                      title={row.show ? 'Included in PDF (Click to hide)' : 'Hidden from PDF (Click to show)'}
                    >
                      {row.show ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={row.type}
                    value={row.value}
                    onChange={(e) => row.onValueChange(e.target.value)}
                    placeholder={row.placeholder}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#D4AF37] font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#141416]/50 text-center">
          <p className="text-zinc-400 text-xs">
            Project Introduction Slide is currently disabled. Toggle switch above to include in PDF.
          </p>
        </div>
      )}
    </div>
  );
};
