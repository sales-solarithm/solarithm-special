import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  BookOpen,
  Eye,
  Plus,
  Trash2,
  X,
  Check,
  Search,
  UserCheck,
  CheckSquare,
  Square,
  FileCheck,
  FileText,
} from 'lucide-react';
import type { ProjectState, LibraryCategoryState } from '../../lib/types';
import { NOTES_LIBRARY } from '../../lib/notesData';
import { buildNoteLines } from '../../lib/reportPdf';

interface EngineeringNotesTabProps {
  state: ProjectState;
  onChange: (patch: Partial<ProjectState>) => void;
}

export const EngineeringNotesTab: React.FC<EngineeringNotesTabProps> = ({
  state,
  onChange,
}) => {
  // Accordion expansion states
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    welded_structure: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Dedicated Custom Note Creator
  const [customNoteTargetCat, setCustomNoteTargetCat] = useState<string>('welded_structure');
  const [customNoteText, setCustomNoteText] = useState('');

  // Inline note creator inside categories
  const [inlineNoteInputs, setInlineNoteInputs] = useState<Record<string, string>>({});

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Toggle category accordion
  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  // Helper to retrieve category state safely
  const getCatState = (catKey: string): LibraryCategoryState => {
    const existing = state.libraryNoteState?.[catKey];
    if (existing) return existing;
    const def = NOTES_LIBRARY[catKey];
    return {
      predefined: new Array(def ? def.notes.length : 10).fill(false),
      custom: [],
    };
  };

  // Update specific category state
  const updateCatState = (catKey: string, updated: LibraryCategoryState) => {
    const current = { ...(state.libraryNoteState || {}) };
    current[catKey] = updated;
    onChange({ libraryNoteState: current });
  };

  // Toggle all items in a single category
  const handleCategorySelectAll = (catKey: string, checked: boolean) => {
    const def = NOTES_LIBRARY[catKey];
    if (!def) return;
    const catSt = getCatState(catKey);
    updateCatState(catKey, {
      predefined: new Array(def.notes.length).fill(checked),
      custom: catSt.custom.map((c) => ({ ...c, checked })),
    });
    if (checked) {
      setOpenCategories((prev) => ({ ...prev, [catKey]: true }));
    }
  };

  // Toggle single predefined note
  const handleNoteCheckChange = (catKey: string, noteIdx: number, checked: boolean) => {
    const catSt = getCatState(catKey);
    const newPredefined = [...(catSt.predefined || [])];
    newPredefined[noteIdx] = checked;
    updateCatState(catKey, { ...catSt, predefined: newPredefined });
  };

  // Add custom note via dedicated creator or inline
  const handleAddCustomNote = (catKey: string, textToAdd: string) => {
    const text = textToAdd.trim();
    if (!text) return;
    const catSt = getCatState(catKey);
    updateCatState(catKey, {
      ...catSt,
      custom: [...catSt.custom, { text: text.toUpperCase(), checked: true }],
    });
    setOpenCategories((prev) => ({ ...prev, [catKey]: true }));
  };

  // Remove custom note
  const handleRemoveCustomNote = (catKey: string, idx: number) => {
    const catSt = getCatState(catKey);
    updateCatState(catKey, {
      ...catSt,
      custom: catSt.custom.filter((_, i) => i !== idx),
    });
  };

  // Master Global Select All
  const handleGlobalSelectAll = () => {
    const updatedState: Record<string, LibraryCategoryState> = {};
    const expandState: Record<string, boolean> = {};
    Object.entries(NOTES_LIBRARY).forEach(([catKey, def]) => {
      const existing = getCatState(catKey);
      updatedState[catKey] = {
        predefined: new Array(def.notes.length).fill(true),
        custom: existing.custom.map((c) => ({ ...c, checked: true })),
      };
      expandState[catKey] = true;
    });
    onChange({ libraryNoteState: updatedState });
    setOpenCategories(expandState);
  };

  // Master Global Clear All
  const handleGlobalClearAll = () => {
    const updatedState: Record<string, LibraryCategoryState> = {};
    Object.entries(NOTES_LIBRARY).forEach(([catKey, def]) => {
      const existing = getCatState(catKey);
      updatedState[catKey] = {
        predefined: new Array(def.notes.length).fill(false),
        custom: existing.custom.map((c) => ({ ...c, checked: false })),
      };
    });
    onChange({ libraryNoteState: updatedState });
  };

  // Calculate total selected notes
  const totalSelectedNotes = useMemo(() => {
    let count = 0;
    Object.keys(NOTES_LIBRARY).forEach((catKey) => {
      const catSt = getCatState(catKey);
      count += (catSt.predefined || []).filter(Boolean).length;
      count += (catSt.custom || []).filter((c) => c.checked).length;
    });
    return count;
  }, [state.libraryNoteState]);

  // Filtered categories and notes
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return Object.entries(NOTES_LIBRARY);

    return Object.entries(NOTES_LIBRARY).filter(([catKey, def]) => {
      const titleMatches = def.title.toLowerCase().includes(query);
      const noteMatches = def.notes.some((n) => n.toLowerCase().includes(query));
      const customMatches = (state.libraryNoteState?.[catKey]?.custom || []).some((c) =>
        c.text.toLowerCase().includes(query)
      );
      return titleMatches || noteMatches || customMatches;
    });
  }, [searchQuery, state.libraryNoteState]);

  // Preview Lines
  const previewLines = useMemo(() => {
    return buildNoteLines(state);
  }, [state]);

  return (
    <div className="space-y-6 text-xs select-none">
      {/* ── 1. MASTER TOGGLE & SUPERVISING ENGINEER ── */}
      <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#141416] space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                state.noteOn
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
              }`}
            >
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                  Include Discussion &amp; Engineering Notes Slide in PDF
                </span>
                {state.noteOn && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
                    FINAL SLIDE
                  </span>
                )}
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={state.noteOn}
              onChange={(e) => onChange({ noteOn: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5.5 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
          </label>
        </div>

        {/* Supervising Engineer Input Field */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Supervising Engineer (Confirmation Authority)</span>
          </label>
          <input
            type="text"
            placeholder="Enter Engineer Name..."
            value={state.poValue || ''}
            onChange={(e) => onChange({ poValue: e.target.value })}
            className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
          />
        </div>
      </div>

      {/* ── 2. MODAL PREVIEW BUTTON & NOTE STATS TOOLBAR ── */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center font-bold text-xs font-mono">
            {totalSelectedNotes}
          </div>
          <div>
            <span className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200 block">
              Specifications Selected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleGlobalSelectAll}
            className="px-2 py-1 rounded text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Select all notes across all categories"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleGlobalClearAll}
            className="px-2 py-1 rounded text-[10px] font-bold text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
            title="Clear all selected notes"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-2.5 py-1 rounded-md bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Notes Slide</span>
          </button>
        </div>
      </div>

      {/* ── 3. DEDICATED CUSTOM NOTE CREATOR ── */}
      <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#141416] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Custom Specification Creator</span>
          </span>
          <span className="text-[10px] text-zinc-500">Add to Category</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              value={customNoteTargetCat}
              onChange={(e) => setCustomNoteTargetCat(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-hidden focus:border-[#D4AF37]"
            >
              {Object.entries(NOTES_LIBRARY).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.title}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={2}
            value={customNoteText}
            onChange={(e) => setCustomNoteText(e.target.value)}
            placeholder="Type technical requirement (e.g. SPECIAL ANODIZED BOLTS GRADE 316 SS REQUIRED)..."
            className="w-full p-2 text-xs font-mono uppercase rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 placeholder:normal-case focus:outline-hidden focus:border-[#D4AF37]"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (customNoteText.trim()) {
                  handleAddCustomNote(customNoteTargetCat, customNoteText);
                  setCustomNoteText('');
                }
              }}
              disabled={!customNoteText.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B89328] disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. SEARCH & FILTER NOTE SPECIFICATIONS ── */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter notes (e.g. M20, torque, chemical anchor, railing)..."
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#D4AF37]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── 5. NOTE CATEGORIES ACCORDIONS ── */}
      <div className="space-y-2.5">
        {filteredCategories.map(([catKey, catDef]) => {
          const catSt = getCatState(catKey);
          const predefinedChecked = (catSt.predefined || []).filter(Boolean).length;
          const customChecked = (catSt.custom || []).filter((c) => c.checked).length;
          const totalCatChecked = predefinedChecked + customChecked;
          const totalPossible = catDef.notes.length + catSt.custom.length;
          const isAllChecked = totalCatChecked === totalPossible && totalPossible > 0;
          const isOpen = !!openCategories[catKey];

          return (
            <div
              key={catKey}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-[#18181B] transition-all shadow-xs"
            >
              {/* Category Header Bar */}
              <div
                className={`p-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer select-none ${
                  totalCatChecked > 0
                    ? 'bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10'
                    : 'bg-zinc-50 dark:bg-[#141416]'
                }`}
                onClick={() => toggleCategory(catKey)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Master Checkbox for this category */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center"
                  >
                    <input
                      type="checkbox"
                      checked={isAllChecked}
                      onChange={(e) => handleCategorySelectAll(catKey, e.target.checked)}
                      className="accent-[#D4AF37] w-3.5 h-3.5 cursor-pointer"
                      title={isAllChecked ? 'Deselect all in category' : 'Select all in category'}
                    />
                  </div>

                  <span
                    className={`font-bold text-[11px] truncate tracking-wide ${
                      totalCatChecked > 0
                        ? 'text-[#D4AF37]'
                        : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {catDef.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Counter Badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      totalCatChecked > 0
                        ? 'bg-[#D4AF37] text-zinc-950'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {totalCatChecked}/{totalPossible}
                  </span>

                  {/* Micro Actions */}
                  <button
                    type="button"
                    onClick={() => handleCategorySelectAll(catKey, true)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-[#D4AF37] transition-colors"
                    title="Select All"
                  >
                    All
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <button
                    type="button"
                    onClick={() => handleCategorySelectAll(catKey, false)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-red-500 transition-colors"
                    title="Clear All"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCategory(catKey)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Accordion Body */}
              {isOpen && (
                <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 animate-in fade-in duration-100">
                  {/* Predefined Notes */}
                  <div className="space-y-1.5">
                    {catDef.notes.map((noteText, idx) => {
                      const isChecked = !!catSt.predefined?.[idx];
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2.5 p-1.5 rounded-lg text-[10px] transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#D4AF37]/15 text-zinc-900 dark:text-zinc-100 font-medium'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              handleNoteCheckChange(catKey, idx, e.target.checked)
                            }
                            className="accent-[#D4AF37] w-3.5 h-3.5 mt-0.5 shrink-0 cursor-pointer"
                          />
                          <span className="leading-snug select-text">{noteText}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Custom Notes in this category */}
                  {catSt.custom.length > 0 && (
                    <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold block">
                        Custom User Notes ({catSt.custom.length}):
                      </span>
                      {catSt.custom.map((cn, ci) => (
                        <div
                          key={ci}
                          className="flex items-start justify-between gap-2 p-1.5 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[10px]"
                        >
                          <label className="flex items-start gap-2 flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cn.checked}
                              onChange={(e) => {
                                const updated = [...catSt.custom];
                                updated[ci] = { ...cn, checked: e.target.checked };
                                updateCatState(catKey, { ...catSt, custom: updated });
                              }}
                              className="accent-[#D4AF37] w-3.5 h-3.5 mt-0.5 shrink-0"
                            />
                            <span className="text-[#D4AF37] font-mono font-medium leading-snug">
                              {cn.text}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomNote(catKey, ci)}
                            className="text-zinc-400 hover:text-red-500 p-0.5 shrink-0"
                            title="Delete custom note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Inline Note Creator */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <input
                      type="text"
                      placeholder={`Add specification to ${catDef.title}...`}
                      value={inlineNoteInputs[catKey] || ''}
                      onChange={(e) =>
                        setInlineNoteInputs((prev) => ({
                          ...prev,
                          [catKey]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = inlineNoteInputs[catKey]?.trim();
                          if (val) {
                            handleAddCustomNote(catKey, val);
                            setInlineNoteInputs((prev) => ({ ...prev, [catKey]: '' }));
                          }
                        }
                      }}
                      className="flex-1 px-2.5 py-1 text-[10px] font-mono rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = inlineNoteInputs[catKey]?.trim();
                        if (val) {
                          handleAddCustomNote(catKey, val);
                          setInlineNoteInputs((prev) => ({ ...prev, [catKey]: '' }));
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 font-bold text-[10px] cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 6. MODAL PREVIEW DIALOG ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-[#18181B] border border-[#D4AF37]/60 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="font-bold text-[#D4AF37] text-sm uppercase font-mono">
                  Discussion &amp; Notes Slide Preview
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Slide Visual Presentation */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 p-4 rounded-xl bg-zinc-900 border-2 border-[#D4AF37] text-zinc-100 font-sans shadow-inner">
              <div className="text-center pb-2 border-b border-[#D4AF37]/30">
                <span className="font-bold text-[#D4AF37] text-base tracking-wide uppercase font-mono block">
                  Discussion &amp; Engineering Specifications
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  SOLARITHM DESIGN &amp; ENGINEERING SUBMISSION
                </span>
              </div>

              {previewLines.length > 0 ? (
                <div className="space-y-3 text-xs leading-relaxed font-mono">
                  {previewLines.map((line, idx) => {
                    const isCatHeader = line.startsWith('[CATEGORY:');
                    const isPoLine = line.includes('ALL PLACEMENTS AND DECISIONS');

                    if (isCatHeader) {
                      const title = line.replace('[CATEGORY:', '').replace(']', '').trim();
                      return (
                        <div key={idx} className="pt-2">
                          <h5 className="font-bold text-[#D4AF37] text-xs tracking-wider uppercase border-b border-[#D4AF37]/20 pb-0.5">
                            {title}
                          </h5>
                        </div>
                      );
                    }

                    if (isPoLine) {
                      return (
                        <div
                          key={idx}
                          className="mt-4 p-2.5 rounded border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37] font-bold text-[11px] text-center"
                        >
                          {line}
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className="flex items-start gap-2 pl-2">
                        <span className="text-[#D4AF37] select-none">•</span>
                        <span className="text-zinc-300">{line}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500">
                  <p>No specifications currently selected.</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Check items in the Note Library to compose this slide.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="text-zinc-500 font-mono">
                Total Rendered Lines: {previewLines.length}
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
