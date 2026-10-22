import React, { useState } from 'react';
import {
  ChevronDown,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Eye,
  Sparkles,
  Zap,
  BookOpen,
  RotateCcw,
  Sliders,
  X,
  Loader2,
} from 'lucide-react';
import type { ProjectState, LibraryCategoryState } from '../lib/types';
import { NOTE_LIBRARY } from '../lib/types';
import { convertNotesRules } from '../lib/reportPdf';

interface Step5NotesLibraryProps {
  state: ProjectState;
  onChange: (patch: Partial<ProjectState>) => void;
}

export const Step5NotesLibrary: React.FC<Step5NotesLibraryProps> = ({
  state,
  onChange,
}) => {
  // Accordion open/close state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    library: true,
    smartConvert: false,
    shadow: false,
    waterfall: false,
    overhang: false,
    designBasis: false,
    shift: false,
    trim: false,
    cleaning: false,
    custom: false,
  });

  // Note categories open/close
  const [openNoteCats, setOpenNoteCats] = useState<Record<string, boolean>>({});

  // Custom note input text per category
  const [customNoteInputs, setCustomNoteInputs] = useState<Record<string, string>>({});

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Gemini loading states
  const [isAiConverting, setIsAiConverting] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNoteCat = (catKey: string) => {
    setOpenNoteCats((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  // Safe getter for library category state
  const getCatState = (catKey: string): LibraryCategoryState => {
    const existing = state.libraryNoteState?.[catKey];
    if (existing) return existing;
    const def = NOTE_LIBRARY[catKey];
    return {
      predefined: new Array(def ? def.notes.length : 10).fill(false),
      custom: [],
    };
  };

  // Update a single category state
  const updateCatState = (catKey: string, updated: LibraryCategoryState) => {
    const current = { ...(state.libraryNoteState || {}) };
    current[catKey] = updated;
    onChange({ libraryNoteState: current });
  };

  // Master Category Checkbox
  const handleMasterCategoryToggle = (catKey: string, checked: boolean) => {
    const def = NOTE_LIBRARY[catKey];
    if (!def) return;
    const catSt = getCatState(catKey);

    // Set all predefined to checked
    const newPredefined = new Array(def.notes.length).fill(checked);
    // Set all custom to checked
    const newCustom = catSt.custom.map((c) => ({ ...c, checked }));

    updateCatState(catKey, {
      predefined: newPredefined,
      custom: newCustom,
    });

    if (checked) {
      setOpenNoteCats((prev) => ({ ...prev, [catKey]: true }));
    }
  };

  // Single note checkbox toggle
  const handleNoteCheckChange = (catKey: string, noteIndex: number, checked: boolean) => {
    const catSt = getCatState(catKey);
    const newPredefined = [...catSt.predefined];
    newPredefined[noteIndex] = checked;
    updateCatState(catKey, {
      ...catSt,
      predefined: newPredefined,
    });
  };

  // Add custom note to category
  const handleAddCustomNote = (catKey: string) => {
    const text = customNoteInputs[catKey]?.trim();
    if (!text) return;

    const catSt = getCatState(catKey);
    const updatedCustom = [
      ...catSt.custom,
      { text: text.toUpperCase(), checked: true },
    ];

    updateCatState(catKey, {
      ...catSt,
      custom: updatedCustom,
    });

    setCustomNoteInputs((prev) => ({ ...prev, [catKey]: '' }));
    setOpenNoteCats((prev) => ({ ...prev, [catKey]: true }));
  };

  // Remove custom note
  const handleRemoveCustomNote = (catKey: string, index: number) => {
    const catSt = getCatState(catKey);
    const updatedCustom = catSt.custom.filter((_, i) => i !== index);
    updateCatState(catKey, {
      ...catSt,
      custom: updatedCustom,
    });
  };

  // Select all notes across all categories
  const handleSelectAllNotes = () => {
    const updatedState: Record<string, LibraryCategoryState> = {};
    const expandState: Record<string, boolean> = {};

    Object.entries(NOTE_LIBRARY).forEach(([catKey, def]) => {
      const existing = getCatState(catKey);
      updatedState[catKey] = {
        predefined: new Array(def.notes.length).fill(true),
        custom: existing.custom.map((c) => ({ ...c, checked: true })),
      };
      expandState[catKey] = true;
    });

    onChange({ libraryNoteState: updatedState });
    setOpenNoteCats(expandState);
  };

  // Clear all notes across all categories
  const handleClearAllNotes = () => {
    const updatedState: Record<string, LibraryCategoryState> = {};

    Object.entries(NOTE_LIBRARY).forEach(([catKey, def]) => {
      const existing = getCatState(catKey);
      updatedState[catKey] = {
        predefined: new Array(def.notes.length).fill(false),
        custom: existing.custom.map((c) => ({ ...c, checked: false })),
      };
    });

    onChange({ libraryNoteState: updatedState });
  };

  // Count total selected notes
  let totalSelectedNotes = 0;
  Object.keys(NOTE_LIBRARY).forEach((catKey) => {
    const catSt = getCatState(catKey);
    totalSelectedNotes += (catSt.predefined || []).filter(Boolean).length;
    totalSelectedNotes += (catSt.custom || []).filter((c) => c.checked).length;
  });

  // Rule-based Convert
  const handleRuleConvert = () => {
    const raw = state.rawNotes.trim();
    if (!raw) return;
    const lines = convertNotesRules(raw);
    if (lines.length > 0) {
      onChange({ convertedNotes: lines.join('\n\n') });
    }
  };

  // AI Convert with Gemini
  const handleAiConvert = async () => {
    const raw = state.rawNotes.trim();
    if (!raw) return;

    setIsAiConverting(true);
    setAiError(null);

    try {
      const res = await fetch('/api/gemini/convert-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes: raw,
          projectContext: {
            clientName: state.introClientName,
            plantCapacity: state.introPlantCapacity,
            panelBrand: state.introPanelBrand,
            panelWp: state.introPanelWp,
            inverter: state.introInverter,
            inverterBrand: state.introInverterBrand,
            tiltAngle: state.introTiltAngle,
            poName: state.poValue === '__other__' ? state.poCustom : state.poValue,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error calling Gemini');
      }

      const data = await res.json();
      if (data.convertedNotes) {
        onChange({ convertedNotes: data.convertedNotes });
      }
    } catch (err: unknown) {
      console.warn('Gemini convert failed, falling back to rule engine:', err);
      // Fallback seamlessly to rule-based engine
      handleRuleConvert();
      setAiError(err instanceof Error ? err.message : 'AI service unavailable, converted with local rule engine.');
    } finally {
      setIsAiConverting(false);
    }
  };

  // AI Suggest Technical Notes
  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    setAiError(null);

    try {
      const res = await fetch('/api/gemini/suggest-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectContext: {
            plantCapacity: state.introPlantCapacity,
            tiltAngle: state.introTiltAngle,
            numPanels: state.introNumPanels,
            panelBrand: state.introPanelBrand,
            panelWp: state.introPanelWp,
            inverter: state.introInverter,
            inverterBrand: state.introInverterBrand,
            epcCompany: state.introEPCCompany,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI suggestions');
      }

      const data = await res.json();
      if (data.suggestions) {
        const existing = state.convertedNotes ? `${state.convertedNotes}\n\n` : '';
        onChange({ convertedNotes: existing + data.suggestions });
      }
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Unable to generate technical suggestions');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <section className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-[rgba(212,175,55,0.15)] text-[#D4AF37] font-mono text-xs font-bold flex items-center justify-center border border-[#D4AF37]/30">
            05
          </span>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
            Engineering Discussion &amp; Standard Notes
          </h2>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={state.noteOn}
            onChange={(e) => onChange({ noteOn: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#D4AF37] focus:ring-[#D4AF37] accent-[#D4AF37] cursor-pointer"
          />
          <span>Include Discussion Slide</span>
        </label>
      </div>

      {/* Supervising Engineer Input Field */}
      <div className="flex items-center gap-3 flex-wrap mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          Supervising Engineer (Confirmation Authority):
        </label>
        <input
          type="text"
          placeholder="Enter Engineer Name..."
          value={state.poValue || ''}
          onChange={(e) => onChange({ poValue: e.target.value })}
          className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#D4AF37] font-semibold w-64"
        />
      </div>

      <div className="space-y-3">
        {/* ── 1. NOTE LIBRARY ── */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-[#141416]">
          <button
            type="button"
            onClick={() => toggleAccordion('library')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-zinc-100/70 dark:bg-[#18181B] hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Standard Note Library ({totalSelectedNotes} selected)</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordions.library ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openAccordions.library && (
            <div className="p-4 space-y-3">
              {/* Library Toolbar */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllNotes}
                    className="px-2.5 py-1 rounded-md bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllNotes}
                    className="px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-[#D4AF37] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[#D4AF37] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Note Output</span>
                  </button>
                </div>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <span className="text-[#D4AF37] font-bold">{totalSelectedNotes}</span> active notes for PDF
                </span>
              </div>

              {/* Note Categories */}
              <div className="space-y-2">
                {Object.entries(NOTE_LIBRARY).map(([catKey, catDef]) => {
                  const catSt = getCatState(catKey);
                  const predefinedChecked = (catSt.predefined || []).filter(Boolean).length;
                  const customChecked = (catSt.custom || []).filter((c) => c.checked).length;
                  const totalChecked = predefinedChecked + customChecked;
                  const totalPossible = catDef.notes.length + catSt.custom.length;
                  const isAllChecked = totalChecked === totalPossible && totalPossible > 0;
                  const isOpen = !!openNoteCats[catKey];

                  return (
                    <div
                      key={catKey}
                      className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-[#18181B]"
                    >
                      {/* Category Header */}
                      <div className="px-3 py-2.5 flex items-center justify-between gap-3 bg-zinc-50 dark:bg-[#141416] hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors select-none">
                        <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={() => toggleNoteCat(catKey)}>
                          <input
                            type="checkbox"
                            checked={isAllChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleMasterCategoryToggle(catKey, e.target.checked);
                            }}
                            className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                          />
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                            {catDef.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(212,175,55,0.15)] text-[#D4AF37] font-bold">
                            {totalChecked} / {totalPossible}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleNoteCat(catKey)}
                            className="p-1 text-zinc-400 hover:text-[#D4AF37] cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Category Body */}
                      {isOpen && (
                        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                          {/* Predefined notes */}
                          {catDef.notes.map((noteText, idx) => {
                            const isChecked = !!catSt.predefined?.[idx];
                            return (
                              <label
                                key={idx}
                                className="flex items-start gap-2 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed hover:text-[#D4AF37] cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    handleNoteCheckChange(catKey, idx, e.target.checked)
                                  }
                                  className="w-3.5 h-3.5 mt-0.5 accent-[#D4AF37] cursor-pointer shrink-0"
                                />
                                <span>{noteText}</span>
                              </label>
                            );
                          })}

                          {/* Custom notes */}
                          {catSt.custom.map((customNote, cIdx) => (
                            <div
                              key={cIdx}
                              className="flex items-start justify-between gap-2 text-[11px] text-[#D4AF37] dark:text-[#D4AF37] leading-relaxed bg-[rgba(212,175,55,0.05)] p-1.5 rounded-md"
                            >
                              <label className="flex items-start gap-2 cursor-pointer flex-1 select-none">
                                <input
                                  type="checkbox"
                                  checked={customNote.checked}
                                  onChange={(e) => {
                                    const updated = [...catSt.custom];
                                    updated[cIdx] = { ...customNote, checked: e.target.checked };
                                    updateCatState(catKey, { ...catSt, custom: updated });
                                  }}
                                  className="w-3.5 h-3.5 mt-0.5 accent-[#D4AF37] cursor-pointer shrink-0"
                                />
                                <span className="font-medium italic">{customNote.text}</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomNote(catKey, cIdx)}
                                className="text-red-500 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                                title="Remove note"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          {/* Add Custom Note Input */}
                          <div className="pt-2 flex items-center gap-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                            <input
                              type="text"
                              placeholder={`Add custom engineering note to ${catDef.title}...`}
                              value={customNoteInputs[catKey] || ''}
                              onChange={(e) =>
                                setCustomNoteInputs((prev) => ({
                                  ...prev,
                                  [catKey]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomNote(catKey);
                                }
                              }}
                              className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#141416] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomNote(catKey)}
                              className="px-3 py-1.5 rounded-md bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold cursor-pointer"
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
            </div>
          )}
        </div>

        {/* ── 2. SMART CONVERT (Dual Mode: Rule Engine + Gemini AI) ── */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-[#141416]">
          <button
            type="button"
            onClick={() => toggleAccordion('smartConvert')}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-zinc-100/70 dark:bg-[#18181B] hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Smart Notes &mdash; Shorthand Converter &amp; AI Intelligence</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openAccordions.smartConvert ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openAccordions.smartConvert && (
            <div className="p-4 space-y-3">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Type quick site shorthand (e.g. <code>shadow free | 3% shadow | vinay | google earth | waterfalling maybe | north 200mm | shift tanks north to south | trim east | cleaning</code>) or let Gemini convert and enrich your notes.
              </p>

              <textarea
                rows={3}
                placeholder="Type shorthand notes here..."
                value={state.rawNotes}
                onChange={(e) => onChange({ rawNotes: e.target.value })}
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />

              <div className="flex items-center gap-2 flex-wrap">
                {/* Rule-Based Convert */}
                <button
                  type="button"
                  onClick={handleRuleConvert}
                  className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Convert Shorthand</span>
                </button>

                {/* Gemini AI Convert */}
                <button
                  type="button"
                  onClick={handleAiConvert}
                  disabled={isAiConverting}
                  className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 bg-[rgba(212,175,55,0.15)] hover:bg-[rgba(212,175,55,0.2)] text-[#D4AF37] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAiConverting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>AI Polish (Gemini)</span>
                </button>

                {/* Gemini AI Suggest Technical Notes */}
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiSuggesting}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#18181B] hover:border-[#D4AF37] text-zinc-700 dark:text-zinc-300 hover:text-[#D4AF37] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAiSuggesting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                  <span>Suggest Technical Precautions</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ rawNotes: '', convertedNotes: '' })}
                  className="px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-red-500 text-xs font-semibold transition-colors cursor-pointer ml-auto"
                >
                  Clear Notes
                </button>
              </div>

              {aiError && (
                <div className="p-2 rounded-md bg-[rgba(212,175,55,0.15)] border border-[#D4AF37]/30 text-[11px] text-[#D4AF37]">
                  {aiError}
                </div>
              )}

              {/* Converted Notes Output */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                  Converted Output (Included in PDF Discussion):
                </label>
                <textarea
                  rows={4}
                  placeholder="Standardized technical notes appear here..."
                  value={state.convertedNotes}
                  onChange={(e) => onChange({ convertedNotes: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── 3. SHADOW ANALYSIS ── */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-[#141416]">
          <button
            type="button"
            onClick={() => toggleAccordion('shadow')}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-zinc-100/70 dark:bg-[#18181B] hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Shadow Loss Parameter</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordions.shadow ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openAccordions.shadow && (
            <div className="p-4 space-y-2.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-800 dark:text-zinc-200">
                <input
                  type="radio"
                  name="shadowType"
                  value="free"
                  checked={state.shadowType === 'free'}
                  onChange={() => onChange({ shadowType: 'free' })}
                  className="accent-[#D4AF37] cursor-pointer"
                />
                <span>SHADOW FREE (Currently shadow-free with object height disclaimer)</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-800 dark:text-zinc-200">
                  <input
                    type="radio"
                    name="shadowType"
                    value="percent"
                    checked={state.shadowType === 'percent'}
                    onChange={() => onChange({ shadowType: 'percent' })}
                    className="accent-[#D4AF37] cursor-pointer"
                  />
                  <span>SHADOW LOSS %:</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3"
                  value={state.shadowPct}
                  onChange={(e) =>
                    onChange({ shadowType: 'percent', shadowPct: e.target.value })
                  }
                  className="w-20 px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 font-mono"
                />
                <span className="text-zinc-400 font-mono">%</span>
              </div>
            </div>
          )}
        </div>



        {/* ── 6. DESIGN BASIS ── */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-[#141416]">
          <button
            type="button"
            onClick={() => toggleAccordion('designBasis')}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-zinc-100/70 dark:bg-[#18181B] hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Design Basis &amp; Verification Status</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordions.designBasis ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openAccordions.designBasis && (
            <div className="p-4 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={state.tentative}
                  onChange={(e) => onChange({ tentative: e.target.checked })}
                  className="accent-[#D4AF37]"
                />
                <span>DESIGN IS TENTATIVE (Dimensions estimated and subject to physical verification)</span>
              </label>
              <div className="pl-6 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={state.ge}
                    onChange={(e) => onChange({ ge: e.target.checked })}
                    className="accent-[#D4AF37]"
                  />
                  <span>Based on Google Earth Satellite Imagery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={state.video}
                    onChange={(e) => onChange({ video: e.target.checked })}
                    className="accent-[#D4AF37]"
                  />
                  <span>Based on Video Reference</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ── 7. SHIFT COMMENT ── */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-[#141416]">
          <button
            type="button"
            onClick={() => toggleAccordion('shift')}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-zinc-100/70 dark:bg-[#18181B] hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Obstacle Shift Comment</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordions.shift ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openAccordions.shift && (
            <div className="p-4 flex items-center gap-3 flex-wrap text-xs">
              <span className="text-zinc-500">Shift</span>
              <select
                value={state.shiftItem}
                onChange={(e) => onChange({ shiftItem: e.target.value })}
                className="px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B]"
              >
                <option>TANKS AND PIPES</option>
                <option>SWH</option>
                <option>AC DUCT</option>
                <option>DISH TV</option>
              </select>
              <span className="text-zinc-500">From</span>
              <select
                value={state.shiftFrom}
                onChange={(e) => onChange({ shiftFrom: e.target.value })}
                className="px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B]"
              >
                <option>NORTH</option>
                <option>EAST</option>
                <option>WEST</option>
                <option>SOUTH</option>
              </select>
              <span className="text-zinc-500">To</span>
              <select
                value={state.shiftTo}
                onChange={(e) => onChange({ shiftTo: e.target.value })}
                className="px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B]"
              >
                <option>NORTH</option>
                <option>EAST</option>
                <option>WEST</option>
                <option>SOUTH</option>
              </select>
              <label className="flex items-center gap-1.5 font-bold cursor-pointer text-[#D4AF37] ml-2">
                <input
                  type="checkbox"
                  checked={state.shiftOn}
                  onChange={(e) => onChange({ shiftOn: e.target.checked })}
                  className="accent-[#D4AF37]"
                />
                <span>Include in Report</span>
              </label>
            </div>
          )}
        </div>

        {/* ── 8. TRIM / CUT ── */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-[#141416]">
          <button
            type="button"
            onClick={() => toggleAccordion('trim')}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-zinc-100/70 dark:bg-[#18181B] hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Trimming / Cutting Requirement</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordions.trim ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openAccordions.trim && (
            <div className="p-4 flex items-center gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#D4AF37]">
                <input
                  type="checkbox"
                  checked={state.trimOn}
                  onChange={(e) => onChange({ trimOn: e.target.checked })}
                  className="accent-[#D4AF37]"
                />
                <span>Panel trimming or cutting required on:</span>
              </label>
              <select
                value={state.trimDir}
                onChange={(e) => onChange({ trimDir: e.target.value })}
                className="px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B]"
              >
                <option>NORTH</option>
                <option>EAST</option>
                <option>WEST</option>
                <option>SOUTH</option>
              </select>
              <span className="text-zinc-500">side</span>
            </div>
          )}
        </div>



        {/* ── 10. CUSTOM NOTE ── */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-[#141416]">
          <button
            type="button"
            onClick={() => toggleAccordion('custom')}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-zinc-100/70 dark:bg-[#18181B] hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span>Additional Freeform Engineer Note</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordions.custom ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openAccordions.custom && (
            <div className="p-4">
              <textarea
                rows={3}
                placeholder="Additional specific note or instruction for the client / contractor..."
                value={state.customNote}
                onChange={(e) => onChange({ customNote: e.target.value })}
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Note Preview Overlay Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="w-full max-w-2xl bg-white dark:bg-[#18181B] border border-[#D4AF37]/50 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>Notes Output &mdash; Discussion Slide Preview</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-4">
              {Object.entries(NOTE_LIBRARY).map(([catKey, def]) => {
                const catSt = getCatState(catKey);
                const selectedPredefined = (catSt.predefined || [])
                  .map((chk, i) => (chk ? def.notes[i] : null))
                  .filter(Boolean);
                const selectedCustom = (catSt.custom || [])
                  .filter((c) => c.checked)
                  .map((c) => c.text);
                const allSelected = [...selectedPredefined, ...selectedCustom];

                if (allSelected.length === 0) return null;

                return (
                  <div key={catKey} className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#D4AF37] border-b border-[#D4AF37]/30 pb-1 uppercase tracking-wide">
                      {def.title}
                    </h4>
                    <ul className="space-y-1 pl-3">
                      {allSelected.map((note, nIdx) => (
                        <li
                          key={nIdx}
                          className="text-xs font-mono text-zinc-700 dark:text-zinc-300 leading-relaxed list-disc"
                        >
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {totalSelectedNotes === 0 && (
                <p className="text-xs text-zinc-400 text-center py-8">
                  No notes currently selected in the library. Tick checkboxes above to include them in the PDF output.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#B89328] text-zinc-950 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
