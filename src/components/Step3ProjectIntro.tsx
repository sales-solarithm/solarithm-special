import React from 'react';
import { FileText, CheckSquare, Square, Building2 } from 'lucide-react';
import type { ProjectState } from '../lib/types';

interface Step3ProjectIntroProps {
  state: ProjectState;
  onChange: (patch: Partial<ProjectState>) => void;
}

export const Step3ProjectIntro: React.FC<Step3ProjectIntroProps> = ({
  state,
  onChange,
}) => {
  return (
    <section className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-[rgba(212,175,55,0.15)] text-[#D4AF37] font-mono text-xs font-bold flex items-center justify-center border border-[#D4AF37]/30">
            03
          </span>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            Project Introduction Page
          </h2>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={state.showIntroPage}
            onChange={(e) => onChange({ showIntroPage: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37] cursor-pointer"
          />
          <span>Include Cover / Introduction Slide</span>
        </label>
      </div>

      {state.showIntroPage ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Client Name */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Client Name:
              </label>
              <input
                type="text"
                placeholder="Enter client name..."
                value={state.introClientName}
                onChange={(e) => onChange({ introClientName: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showClientName}
                  onChange={(e) => onChange({ showClientName: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Date:
              </label>
              <input
                type="text"
                placeholder="e.g., October 12, 2026"
                value={state.introDate}
                onChange={(e) => onChange({ introDate: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showDate}
                  onChange={(e) => onChange({ showDate: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>

            {/* Number of Panels */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Number of Panels:
              </label>
              <input
                type="text"
                placeholder="e.g., 100"
                value={state.introNumPanels}
                onChange={(e) => onChange({ introNumPanels: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showNumPanels}
                  onChange={(e) => onChange({ showNumPanels: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>

            {/* Brand Of Panel */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Brand Of Panel:
              </label>
              <input
                type="text"
                placeholder="e.g., Tata, Adani, Waaree"
                value={state.introPanelBrand}
                onChange={(e) => onChange({ introPanelBrand: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showPanelBrand}
                  onChange={(e) => onChange({ showPanelBrand: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>

            {/* Panel Wp */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Panel Wp:
              </label>
              <input
                type="text"
                placeholder="e.g., 540W"
                value={state.introPanelWp}
                onChange={(e) => onChange({ introPanelWp: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showPanelWp}
                  onChange={(e) => onChange({ showPanelWp: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>

            {/* Inverter to be Used (KW) */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Inverter (KW):
              </label>
              <input
                type="text"
                placeholder="e.g., 50 KW"
                value={state.introInverter}
                onChange={(e) => onChange({ introInverter: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showInverter}
                  onChange={(e) => onChange({ showInverter: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>

            {/* Inverter Brand */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Inverter Brand:
              </label>
              <input
                type="text"
                placeholder="e.g., SolarEdge, Sungrow, Growatt"
                value={state.introInverterBrand}
                onChange={(e) => onChange({ introInverterBrand: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showInverterBrand}
                  onChange={(e) => onChange({ showInverterBrand: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>

            {/* Plant capacity (KW) */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Plant Capacity:
              </label>
              <input
                type="text"
                placeholder="e.g., 54.0 KWp"
                value={state.introPlantCapacity}
                onChange={(e) => onChange({ introPlantCapacity: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showPlantCapacity}
                  onChange={(e) => onChange({ showPlantCapacity: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>

            {/* Tilt Angle */}
            <div className="flex items-center gap-2">
              <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
                Tilt Angle:
              </label>
              <input
                type="text"
                placeholder="e.g., 15° True South"
                value={state.introTiltAngle}
                onChange={(e) => onChange({ introTiltAngle: e.target.value })}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={state.showTiltAngle}
                  onChange={(e) => onChange({ showTiltAngle: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
                />
                <span>Show</span>
              </label>
            </div>
          </div>

          {/* EPC Company Name Row */}
          <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <label className="w-36 text-xs font-semibold text-zinc-600 dark:text-zinc-400 shrink-0">
              EPC Company:
            </label>
            <input
              type="text"
              placeholder="e.g., SOLARITHM Design & Engineering Consultancy"
              value={state.introEPCCompany}
              onChange={(e) => onChange({ introEPCCompany: e.target.value })}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
            />
            <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={state.showEPCCompany}
                onChange={(e) => onChange({ showEPCCompany: e.target.checked })}
                className="w-3.5 h-3.5 accent-[#D4AF37] cursor-pointer"
              />
              <span>Show</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-zinc-400">
          Cover / Introduction slide is currently disabled. Toggle checkbox above to configure.
        </div>
      )}
    </section>
  );
};
