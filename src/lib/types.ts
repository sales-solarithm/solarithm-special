/**
 * Core types for Solarithm Engineering Submission Studio
 */

export interface CategoryDef {
  id: string;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'cat_3d',           label: '3D VIEW',                 color: '#1a5fb4' },
  { id: 'cat_site_dim',     label: 'SITE DIMENSION',          color: '#0284c7' },
  { id: 'cat_panel',        label: 'PANEL PLACEMENT',         color: '#3b82f6' },
  { id: 'cat_side',         label: 'SIDE VIEW',               color: '#C9A84C' },
  { id: 'cat_structure',    label: 'STRUCTURE VISUALIZATION', color: '#7b3fa0' },
  { id: 'cat_struct_dim',   label: 'STRUCTURE DIMENSION',     color: '#D4AF37' },
  { id: 'cat_tsm',          label: 'TSM',                     color: '#b03030' },
  { id: 'cat_shadow',       label: 'SHADOW ANALYSIS',         color: '#1c1c8a' },
  { id: 'cat_bom',          label: 'BOM',                     color: '#475569' },
];

export interface NoteCategory {
  title: string;
  notes: string[];
}

export { NOTES_LIBRARY, NOTE_LIBRARY, type NoteCategoryDef } from './notesData';

export interface StoredImageItem {
  id: string; // unique ID or objectURL
  name: string;
  blob?: Blob;
  dataUrl: string; // base64 representation for persistence and jsPDF
  size: number;
  mimeType: string;
}

export interface LibraryCategoryState {
  predefined: boolean[];
  custom: { text: string; checked: boolean }[];
}

export interface ProjectState {
  fileName: string;
  // Logos
  logoDataUrl: string | null;
  solarithmLogoDataUrl: string | null;
  showLogo: boolean;
  showSolarithmBranding: boolean;

  // Project intro
  showIntroPage: boolean;
  introClientName: string;
  introDate: string;
  introNumPanels: string;
  introPanelBrand: string;
  introPanelWp: string;
  introInverter: string;
  introInverterBrand: string;
  introPlantCapacity: string;
  introTiltAngle: string;
  introEPCCompany: string;
  showClientName: boolean;
  showDate: boolean;
  showNumPanels: boolean;
  showPanelBrand: boolean;
  showPanelWp: boolean;
  showInverter: boolean;
  showInverterBrand: boolean;
  showPlantCapacity: boolean;
  showTiltAngle: boolean;
  showEPCCompany: boolean;

  // Shadow analysis
  shadowType: 'free' | 'percent' | null;
  shadowPct: string;
  shadowTimes: string[];

  // Waterfall
  waterfall: 'no' | 'yes' | 'maybe';

  // Overhang (MM)
  nOn: boolean; nMM: string;
  eOn: boolean; eMM: string;
  wOn: boolean; wMM: string;
  sOn: boolean; sMM: string;

  // Design basis
  tentative: boolean;
  ge: boolean;
  video: boolean;

  // Shift
  shiftOn: boolean;
  shiftItem: string;
  shiftFrom: string;
  shiftTo: string;

  // Trim
  trimOn: boolean;
  trimDir: string;

  // Cleaning
  cleaning: boolean;

  // Notes
  noteOn: boolean;
  poValue: string;
  poCustom: string;
  rawNotes: string;
  convertedNotes: string;
  customNote: string;

  // Note Library selections
  libraryNoteState: Record<string, LibraryCategoryState>;

  // Category Ordering and assignments
  categoryOrder: string[]; // List of category IDs
  catAssignData: Record<string, string>; // imageId -> categoryId
  catOrderData: Record<string, string[]>; // categoryId -> array of imageIds
  imgNameMap: Record<string, string>; // imageId -> filename
}

export interface SavedProject {
  id: string;
  name: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  images?: StoredImageItem[];
  thumbnail?: string;
  state: ProjectState;
}
