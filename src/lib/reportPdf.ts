/**
 * Solarithm Design & Engineering - Premium Rooftop Solar Design Report Generator
 * Client-side report generation engine using jsPDF and Canvas.
 * Replicates the executive engineering report styling and design system
 * with 100% dynamic data-binding and rock-solid math guarantees:
 *
 * - A4 Landscape (841.89 pt x 595.28 pt)
 * - Warm Champagne background (CH0: #FBF4E1) without intrusive radiating spokes
 * - Palette: Deep Forest Green (#073D25), Solar Gold (#D9A41E / #FBC419 / #B07F0C), Cream (#FFFCF2)
 * - Page 1: Dual-panel Cover with 6-item dynamic specifications stack (never hardcoded, no blanks, no collision)
 * - Page 2: "About This Report" with dynamic TOC cards and dynamic seasonal shadow legend
 * - Pages 3+: Deliverable Drawing slides with left metallic rail, safe vertical text origin (45pt below green box),
 *   and strictly synchronized right-aligned header (Title, Subtitle, Ornament)
 * - Image Framing: Golden perimeter frame conforms exactly to computed image bounds (zero gaps or clipping)
 * - Shadow Analysis: 2x2 multi-grid with dynamic timestamps & season-colored pills
 * - Discussion: Master notes extraction from libraryNoteState, directives & custom notes, paginated cleanly
 * - Client Logo enforcement: Rendered in top-left chrome and large centered emblem on final discussion page
 */

import { jsPDF } from 'jspdf';
import type { ProjectState, CategoryDef, LibraryCategoryState } from './types';
import { CATEGORIES } from './types';
import { NOTES_LIBRARY, NOTE_LIBRARY } from './notesData';

// --------------------------------------------------------------------------- Palette Tokens
const GREEN = '#073D25';       // Deep Forest Green
const GREEN2 = '#0B5234';      // Mid Forest Green
const GREEN_LINE = '#1F5C42';  // Forest Green Hairline
const GOLD_D = '#B07F0C';      // Deep Gold / Amber
const GOLD = '#D9A41E';        // Solar Gold
const GOLD_L = '#FBC419';      // Bright Solar Gold
const CREAM = '#FFFCF2';       // Card background
const CH0 = '#FBF4E1';         // Warm Champagne Light
const INK = '#0B2A1C';         // Deep Ink
const MUTED = '#7A6F4F';       // Muted Ochre
const EDGE = '#E3D2A0';        // Card border color

const COMPANY = 'Solarithm Design & Engineering';

const INTRO_TEXT =
  'This report documents the proposed rooftop solar PV design, from the site model and dimensions ' +
  'to the panel layout, mounting structure and a seasonal shadow study, so that every placement ' +
  'can be reviewed and confirmed.';

const SECTION_DESCRIPTIONS: Record<string, string> = {
  '3D View': 'Top plan and 3D views of the proposed solar layout.',
  'Site Dimension': 'Roof measurements used as the basis for the design.',
  'Panel Placement': 'Position and grouping of the solar panels on the roof.',
  'Side View': 'Elevation and side profile drawings of the solar array.',
  'Structure Visualization': '3D views of the mounting structure that carries the panels.',
  'Structure Dimension': 'Dimensioned drawings of the mounting structure.',
  'TSM': 'Footing and column marking layout with spacing dimensions.',
  'BOM': 'Bill of materials and structural component quantities.',
  'Shadow Analysis': 'Shadow study of the layout on seasonal solstice dates.',
  'Discussion': 'Final engineering directives, compliance standards, and notes.',
  'Specifications': 'Structural engineering schedules, technical specifications, and project directives.',
};

export interface PDFGenerationResult {
  pdf: jsPDF;
  blob: Blob;
  blobUrl: string;
  filename: string;
  pageCount: number;
}

export interface LoadedDrawing {
  cat: CategoryDef;
  img: HTMLImageElement;
  shadowTimestamp?: string;
  srcId: string;
}

/**
 * Loads an HTMLImageElement asynchronously with dimension validation
 */
export async function loadImageElement(urlOrData: string | null): Promise<HTMLImageElement | null> {
  if (!urlOrData) return null;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
          resolve(img);
        } else {
          console.warn('Image loaded with invalid dimensions (0x0 or non-finite)');
          resolve(null);
        }
      };
      img.onerror = () => {
        console.warn('Failed to load image for PDF report');
        resolve(null);
      };
      img.src = urlOrData;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Extracts Supervising Engineer name from state
 */
export function getPOName(state: ProjectState): string {
  if (state.poValue === '__other__') {
    const v = state.poCustom?.trim();
    return v ? v.toUpperCase() : '—';
  }
  const v = state.poValue?.trim();
  return v ? v.toUpperCase() : '—';
}

/**
 * Formats technical text to clean sentence case while preserving engineering codes and acronyms
 */
export function formatToSentenceCase(text: string): string {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();
  const preserveUpper = new Set([
    'IEC', 'IS', 'AWS', 'RCC', 'HDPE', 'MS', 'PV', 'DC', 'AC', 'KW', 'KWP', 'WP', 'MW',
    'MM', 'M', 'KN/M²', 'NM', 'SS', 'SWH', 'GE', 'TV', 'BOM', 'TSM', 'DCR', 'AL', 'GI',
    'HDG', 'STP', 'M12', 'M16', 'M20', 'M25', 'M30', 'GRADE 8.8', 'SS 304', 'SS 316', 'O&M'
  ]);

  return trimmed
    .split(/(\n+|(?<=[.!?])\s+)/)
    .map((sentence) => {
      if (/^\s*$/.test(sentence)) return sentence;
      const words = sentence.trim().split(/\s+/);
      return words
        .map((w, idx) => {
          const cleanW = w.replace(/[^a-zA-Z0-9²]/g, '').toUpperCase();
          if (
            preserveUpper.has(cleanW) ||
            /\b(IS:[0-9]+|IS\s+[0-9]+|IEC\s*[0-9]+|M[0-9]+|AWS|GRADE\s*8\.8)\b/i.test(w)
          ) {
            return w.toUpperCase();
          }
          if (idx === 0) {
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
          }
          return w.toLowerCase();
        })
        .join(' ');
    })
    .join('');
}

export const toSentenceCaseEngineering = formatToSentenceCase;

export function getCategoryBadge(catKey: string): string {
  const k = catKey.toLowerCase();
  if (k.includes('common')) return 'General Standard';
  if (k.includes('welded') && k.includes('without')) return 'IS:816 / AWS D1.1';
  if (k.includes('welded') && k.includes('with')) return 'M20 Concrete / IS:816';
  if (k.includes('bolted') && k.includes('without')) return 'Grade 8.8 / HDG';
  if (k.includes('bolted') && k.includes('with')) return 'Anchor Bolts / M20';
  if (k.includes('monorail')) return '±2mm Alignment';
  if (k.includes('shed')) return 'SS 304 / Uplift Code';
  if (k.includes('kechi')) return 'Ballast M25 / Zero-Pen';
  if (k.includes('purlin') || k.includes('clamping')) return '13–17 Nm Torque';
  if (k.includes('walkway')) return '3 kN/m² Live Load';
  if (k.includes('railing') || k.includes('safety')) return '1100mm / IS:4759';
  if (k.includes('stair')) return 'IS:3696 / 45° Max';
  return 'Technical Spec';
}

export interface ActiveDepartmentSection {
  id: string;
  title: string;
  cleanTitle: string;
  shortRailLabel: string;
  badge: string;
  notes: string[];
}

export function formatCategoryTitle(title: string): string {
  if (!title) return '';
  const clean = title.replace(/\s*NOTES\s*$/i, ' Notes');
  return clean
    .split(/(\s+|[()/-])/)
    .map((token, idx, arr) => {
      if (!token || /^[\s()/-]+$/.test(token)) return token;
      const lower = token.toLowerCase();
      const prevToken = idx > 0 ? arr[idx - 1] : '';
      const isStart = idx === 0 || prevToken === '(' || prevToken === '/' || prevToken === '-';
      if (!isStart && ['with', 'without', 'and', 'to', 'for', 'of', 'in', 'on', 'at'].includes(lower)) {
        return lower;
      }
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join('');
}

export function getShortRailLabel(catKey: string, title: string): string {
  const map: Record<string, string> = {
    welded_structure: 'WELDED STRUCTURE',
    welded_with_foundation: 'WELDED FOUNDATION',
    bolted_without_foundation: 'BOLTED STRUCTURE',
    bolted_with_foundation: 'BOLTED FOUNDATION',
    monorail_structure: 'MONORAIL STRUCTURE',
    shed_mounted_angular: 'SHED MOUNTED',
    kechi_structure: 'KECHI STRUCTURE',
    module_purlin_connection: 'MODULE CONNECTION',
    walkway_notes: 'WALKWAY SYSTEM',
    safety_railing: 'SAFETY RAILING',
    maintenance_stair: 'MAINTENANCE STAIR',
    site_directives: 'SITE DIRECTIVES',
    general_specifications: 'SPECIFICATIONS',
  };
  if (map[catKey]) return map[catKey];
  const clean = title.replace(/\s*\([^)]*\)/g, '').trim().toUpperCase();
  return clean.length <= 18 ? clean : 'SPECIFICATIONS';
}

export function convertNotesRules(raw: string): string[] {
  const text = raw.trim().toUpperCase();
  if (!text) return [];
  const lines: string[] = [];

  if (/SHADOW[\s-]*FREE|NO SHADOW|0\s*%/.test(text)) {
    lines.push('Currently shadow-free; however, any subsequent modification in surrounding object height or roof perimeter structures may result in shadow loss.');
  } else {
    const sm = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (sm) {
      lines.push(`This site is projected with an estimated ${sm[1]}% annual shadow loss; any height change in adjacent structures will directly influence generation yield.`);
    }
  }

  const hasGE = /GOOGLE\s*EARTH|\bGE\b/.test(text);
  const hasVid = /\bVIDEO\b/.test(text);
  if (hasGE || hasVid) {
    const refs = [hasGE && 'Google Earth satellite imagery', hasVid && 'on-site video survey'].filter(Boolean);
    lines.push(`Layout dimensions are tentative based on ${refs.join(' and ')}; final structural anchoring must be verified against on-site civil roof survey.`);
  }

  return lines;
}

export function buildNoteLines(state: ProjectState): string[] {
  const lines: string[] = [];
  if (state.libraryNoteState) {
    Object.entries(state.libraryNoteState).forEach(([catKey, catState]) => {
      const def = NOTES_LIBRARY[catKey] || NOTE_LIBRARY[catKey];
      if (!def) return;
      const selectedNotes: string[] = [];
      if (Array.isArray(catState.predefined)) {
        catState.predefined.forEach((checked, idx) => {
          if (checked && def.notes[idx]) selectedNotes.push(def.notes[idx]);
        });
      }
      if (Array.isArray(catState.custom)) {
        catState.custom.forEach((c) => {
          if (c && c.checked && c.text) selectedNotes.push(c.text.toUpperCase());
        });
      }
      if (selectedNotes.length > 0) {
        lines.push(`[CATEGORY: ${def.title}]`);
        selectedNotes.forEach((note) => lines.push(note));
      }
    });
  }
  const conv = state.convertedNotes?.trim();
  if (conv) {
    conv.split('\n\n').forEach((block) => {
      const b = block.trim();
      if (b) lines.push(b);
    });
  }
  return lines;
}

// --------------------------------------------------------------------------- Graphic Primitives
function drawDiamond(pdf: jsPDF, cx: number, cy: number, r: number, color: string) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r)) return;
  pdf.setFillColor(color);
  pdf.triangle(cx - r, cy, cx, cy - r * 0.75, cx + r, cy, 'F');
  pdf.triangle(cx - r, cy, cx, cy + r * 0.75, cx + r, cy, 'F');
}

/**
 * Signature divider flourish echoing the reference Solarithm ornament
 */
function drawOrnament(pdf: jsPDF, cx: number, cy: number, w: number, color = GOLD) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(w) || w <= 0) return;
  pdf.setDrawColor(color);
  pdf.setLineWidth(0.9);
  pdf.line(cx - w / 2 + 6, cy, cx - 11, cy);
  pdf.line(cx + 11, cy, cx + w / 2 - 6, cy);
  drawDiamond(pdf, cx, cy, 6, color);
  drawDiamond(pdf, cx - 8.5, cy, 2.6, color);
  drawDiamond(pdf, cx + 8.5, cy, 2.6, color);
  pdf.setFillColor(color);
  pdf.circle(cx - w / 2 + 3, cy, 2.4, 'F');
  pdf.circle(cx + w / 2 - 3, cy, 2.4, 'F');
}

/**
 * Flush right-aligned header divider flourish.
 * The right tip terminates PRECISELY at rightX (forming an exact vertical boundary with text above).
 * Removes all center-biasing and horizontal offsets.
 */
function drawRightAlignedHeaderOrnament(
  pdf: jsPDF,
  rightX: number,
  cy: number,
  w = 156,
  color = GOLD
) {
  if (!Number.isFinite(rightX) || !Number.isFinite(cy) || !Number.isFinite(w) || w <= 0) return;
  const leftX = rightX - w;
  const cx = rightX - 68; // Motif positioned proportionally along the span

  pdf.setDrawColor(color);
  pdf.setLineWidth(0.9);

  // Left flourish: terminating circle at left end
  pdf.setFillColor(color);
  pdf.circle(leftX + 2.5, cy, 2.2, 'F');

  // Left line segment
  pdf.line(leftX + 5, cy, cx - 11, cy);

  // Central decorative diamond motif
  drawDiamond(pdf, cx, cy, 5.5, color);
  drawDiamond(pdf, cx - 8.5, cy, 2.5, color);
  drawDiamond(pdf, cx + 8.5, cy, 2.5, color);

  // Right line segment running straight to rightX
  pdf.line(cx + 11, cy, rightX, cy);

  // Sleek decorative arrowhead / diamond tip terminating PRECISELY at rightX
  // Forms a crisp flush-right vertical boundary with the title and subtitle above
  pdf.setFillColor(color);
  pdf.triangle(rightX, cy, rightX - 5.5, cy - 2.6, rightX - 3.5, cy, 'F');
  pdf.triangle(rightX, cy, rightX - 3.5, cy, rightX - 5.5, cy + 2.6, 'F');
}

/**
 * Renders logo with strict proportional contain fit
 */
function drawLogo(
  pdf: jsPDF,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
  align: 'left' | 'center' | 'right' = 'left'
): number {
  if (!img || !img.width || !img.height || !Number.isFinite(img.width) || !Number.isFinite(img.height) || img.width <= 0 || img.height <= 0) {
    return 0;
  }
  const ratio = Math.min(maxW / img.width, maxH / img.height);
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;

  const lw = img.width * ratio;
  const lh = img.height * ratio;
  let lx = x;
  if (align === 'center') {
    lx = x + (maxW - lw) / 2;
  } else if (align === 'right') {
    lx = x + maxW - lw;
  }
  const ly = y + (maxH - lh) / 2;

  if (!Number.isFinite(lx) || !Number.isFinite(ly) || !Number.isFinite(lw) || !Number.isFinite(lh)) {
    return 0;
  }

  const isPng = img.src.startsWith('data:image/png');
  try {
    pdf.addImage(img, isPng ? 'PNG' : 'JPEG', lx, ly, lw, lh, undefined, 'FAST');
  } catch (err) {
    console.warn('Failed to draw logo:', err);
  }
  return lh;
}

/**
 * Renders logo in the top-right corner of the drawing canvas with transparency directly over
 * the drawing, without any white container, fill, or outer border, expanded to prominent executive scale.
 */
function drawDrawingCornerLogo(
  pdf: jsPDF,
  logoImg: HTMLImageElement | null,
  drawX: number,
  drawY: number,
  drawW: number,
  drawH: number,
  inset = 12
) {
  if (
    !logoImg ||
    !logoImg.width ||
    !logoImg.height ||
    !Number.isFinite(logoImg.width) ||
    !Number.isFinite(logoImg.height) ||
    logoImg.width <= 0 ||
    logoImg.height <= 0
  ) {
    return;
  }

  // Substantially enlarged bounding box (~2.2x to 2.5x larger than previous)
  const maxLogoW = 300;
  const maxLogoH = 95;

  const ratio = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height);
  if (!Number.isFinite(ratio) || ratio <= 0) return;

  const logoW = logoImg.width * ratio;
  const logoH = logoImg.height * ratio;

  // Anchor inside the drawing frame with clean inset from top and right boundaries
  const logoX = drawX + drawW - inset - logoW;
  const logoY = drawY + inset;

  if (
    !Number.isFinite(logoX) ||
    !Number.isFinite(logoY) ||
    !Number.isFinite(logoW) ||
    !Number.isFinite(logoH)
  ) {
    return;
  }

  // Render transparently directly over the drawing corner with contain fit (no white container, fill, or border)
  const isPng = logoImg.src.startsWith('data:image/png');
  try {
    pdf.addImage(logoImg, isPng ? 'PNG' : 'JPEG', logoX, logoY, logoW, logoH, undefined, 'FAST');
  } catch (err) {
    console.warn('Failed to render corner logo in drawing:', err);
  }
}

/**
 * Renders deliverable drawing with synchronized golden/green perimeter frame
 * conformed EXACTLY to computed image bounds (zero gaps, zero distortion).
 */
function drawFramedDrawing(
  pdf: jsPDF,
  img: HTMLImageElement,
  availX: number,
  availY: number,
  availW: number,
  availH: number,
  isGreen = false,
  r = 6,
  overlayLogoImg: HTMLImageElement | null = null
) {
  if (
    !img ||
    !img.width ||
    !img.height ||
    !Number.isFinite(img.width) ||
    !Number.isFinite(img.height) ||
    img.width <= 0 ||
    img.height <= 0
  ) {
    return;
  }

  // 1. Calculate actual render dimensions and position using strict aspect-ratio containment (contain fit)
  const ratio = Math.min(availW / img.width, availH / img.height);
  if (!Number.isFinite(ratio) || ratio <= 0) return;

  const drawW = img.width * ratio;
  const drawH = img.height * ratio;
  const drawX = availX + (availW - drawW) / 2;
  const drawY = availY + (availH - drawH) / 2;

  if (
    !Number.isFinite(drawW) ||
    !Number.isFinite(drawH) ||
    !Number.isFinite(drawX) ||
    !Number.isFinite(drawY)
  ) {
    return;
  }

  // 2. Compute exact synchronized frame coordinates around the image perimeter
  const borderPadding = 3.5;
  const frameX = drawX - borderPadding;
  const frameY = drawY - borderPadding;
  const frameW = drawW + borderPadding * 2;
  const frameH = drawH + borderPadding * 2;
  const cornerRadius = r;

  // Soft drop shadow tightly conforming to frame
  pdf.setFillColor(210, 195, 160);
  pdf.roundedRect(frameX + 3.5, frameY + 3.5, frameW, frameH, cornerRadius, cornerRadius, 'F');

  // Synchronized golden/green perimeter frame
  pdf.setFillColor(isGreen ? GREEN : GOLD);
  pdf.roundedRect(frameX, frameY, frameW, frameH, cornerRadius, cornerRadius, 'F');

  // Crisp white bed directly under image
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(drawX, drawY, drawW, drawH, Math.max(1, cornerRadius - 2), Math.max(1, cornerRadius - 2), 'F');

  // Draw image
  const isPng = img.src.startsWith('data:image/png');
  try {
    pdf.addImage(img, isPng ? 'PNG' : 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');
  } catch (err) {
    console.warn('Failed to render drawing in PDF:', err);
  }

  // Draw corner logo inside drawing frame at top-right corner if provided
  if (overlayLogoImg) {
    drawDrawingCornerLogo(pdf, overlayLogoImg, drawX, drawY, drawW, drawH, 10);
  }
}

/**
 * Standard slide background (warm champagne / cream)
 */
function drawBackground(pdf: jsPDF, W: number, H: number) {
  pdf.setFillColor(CH0);
  pdf.rect(0, 0, W, H, 'F');
}

/**
 * Draws left metallic gold rail with dark green category block, vertical name, and running page indicator.
 * - Vertical category name rotation is reversed by 180 degrees (angle 90 instead of 270) to read naturally
 *   from top to bottom in standard presentation orientation.
 * - Safely cleared below the top green category box (ends at 64pt) and centered horizontally on X = RAIL / 2.
 */
function drawLeftRail(
  pdf: jsPDF,
  categoryNumber: string,
  categoryName: string,
  pageNo: number,
  totalCount: number
) {
  const RAIL = 58;
  const H = 595.28;

  // Rail background (metallic gold)
  pdf.setFillColor(GOLD);
  pdf.rect(0, 0, RAIL, H, 'F');

  // Subtle metallic highlight line
  pdf.setDrawColor(GOLD_L);
  pdf.setLineWidth(0.8);
  pdf.line(RAIL - 2, 0, RAIL - 2, H);

  // Top Dark Green Block (0 to 64 pt)
  pdf.setFillColor(GREEN);
  pdf.rect(0, 0, RAIL, 64, 'F');

  // Section number in top block
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(GOLD_L);
  pdf.text(categoryNumber, RAIL / 2, 42, { align: 'center' });

  // Rotated vertical category name:
  // Rotation reversed by 180 degrees (angle 90) so text reads naturally from top to bottom
  const rotText = categoryName.toUpperCase();
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setCharSpace(3.2);
  pdf.setTextColor(GREEN);

  const rawW = pdf.getTextWidth(rotText);
  const textW = rawW + (rotText.length - 1) * 3.2;

  // Safe clearance below dark green box: green box ends at 64pt.
  // With angle 90, jsPDF draws from yOrigin upward by textW to (yOrigin - textW).
  // Keeping top of text at Y = 106 ensures 42pt of clear buffer below the 64pt box.
  const topClearanceY = 106;
  const yOrigin = topClearanceY + textW;

  // Horizontal centering: RAIL width is 58 (center line = 29).
  // For 11pt bold text, cap height is ~7.6pt with ascenders extending leftward (-X).
  // Baseline at RAIL / 2 + 3.8 = 32.8 centers the glyphs cleanly on X = 29.
  pdf.text(rotText, RAIL / 2 + 3.8, yOrigin, { angle: 90 });
  pdf.setCharSpace(0);

  // Bottom Running Counter
  const pStr = String(pageNo).padStart(2, '0');
  const tStr = `/ ${String(totalCount).padStart(2, '0')}`;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(GREEN);
  pdf.text(pStr, RAIL / 2, 545, { align: 'center' });

  pdf.setFontSize(10.5);
  pdf.setTextColor(GREEN2);
  pdf.text(tStr, RAIL / 2, 563, { align: 'center' });
}

/**
 * Slide Header: Client Logo on Left (contain fit), Section Title, Subtitle, and Divider Rule
 * strictly flush right-aligned to the exact same margin (headerRightX = W - 38 = 803.89 pt).
 * - Category Title: Right-aligned flush at headerRightX (Font: 30pt, Deep Green)
 * - Subtitle: Right-aligned flush at headerRightX with charSpace compensation (Font: 9.5pt, Gold #B07F0C)
 * - Decorative Line & Diamond Ornament: Right tip terminates PRECISELY at headerRightX with zero offsets
 */
function drawSlideHeader(
  pdf: jsPDF,
  clientLogoImg: HTMLImageElement | null,
  title: string,
  subtext?: string,
  hasRail = true,
  showBranding = true,
  companyLogoImg: HTMLImageElement | null = null,
  epcCompanyName?: string
) {
  const W = 841.89;
  const x0 = hasRail ? 88 : 44;
  const headerRightX = W - 38; // 803.89 pt: strict right margin for title, subtitle, and ornament tip

  // Top-left header logo:
  // Strictly display Client Logo if provided.
  // Strictly do NOT render any company emblem unless showBranding is true AND an explicit company logo URL is provided in state
  const logoToDraw = clientLogoImg || (showBranding && companyLogoImg ? companyLogoImg : null);
  if (logoToDraw) {
    drawLogo(pdf, logoToDraw, x0, 13, 145, 46, 'left');
  }

  // Section Title on right: Right-aligned flush at headerRightX
  pdf.setFont('helvetica', 'bold');
  const titleFontSize = title.length > 34 ? 20 : (title.length > 25 ? 23 : 30);
  pdf.setFontSize(titleFontSize);
  pdf.setTextColor(GREEN);
  pdf.text(title, headerRightX, 46, { align: 'right' });

  // Subtitle: Right-aligned flush at headerRightX (compensating for charSpace)
  if (subtext) {
    const subtextUpper = subtext.toUpperCase();
    const charSpacing = 1.6;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setCharSpace(charSpacing);
    pdf.setTextColor(GOLD_D);
    const rawW = pdf.getTextWidth(subtextUpper);
    const totalSubtextW = rawW + (subtextUpper.length - 1) * charSpacing;
    pdf.text(subtextUpper, headerRightX - totalSubtextW, 64);
    pdf.setCharSpace(0);
  }

  // Decorative divider rule & ornament line: right tip terminates PRECISELY at headerRightX
  drawRightAlignedHeaderOrnament(pdf, headerRightX, 74, 156, GOLD);

  // Clean Architectural Running Footer: Displays dynamic EPC Company Name
  const cleanEpc = epcCompanyName?.trim() ? epcCompanyName.trim().toUpperCase() : '';
  if (cleanEpc) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setCharSpace(1.8);
    pdf.setTextColor(MUTED);
    pdf.text(cleanEpc, x0, 568);
    pdf.setCharSpace(0);
  }
}

/**
 * Extracts unique date strings from the shadowTimes array
 */
function extractUniqueShadowDates(shadowTimes: string[] | undefined): string[] {
  const dates: string[] = [];
  const seen = new Set<string>();

  (shadowTimes || []).forEach((st) => {
    if (!st || !st.trim()) return;
    const trimmed = st.trim();
    const parts = trimmed.split(/\s*·\s*|\s*-\s*|\s*,\s*/);
    let d = parts[0]?.trim() || '';
    const dateMatch = d.match(/\b\d+(?:st|nd|rd|th)?\s+[A-Za-z]+|\b[A-Za-z]+\s+\d+(?:st|nd|rd|th)?/);
    if (dateMatch) {
      d = dateMatch[0].toUpperCase();
    } else {
      d = d.toUpperCase();
    }
    if (d && !seen.has(d)) {
      seen.add(d);
      dates.push(d);
    }
  });

  if (dates.length === 0) {
    return ['21 JUN', '21 DEC'];
  }
  return dates;
}

/**
 * Tests whether a date or timestamp belongs to the winter/autumn cycle
 */
function isWinterDate(dateStr: string): boolean {
  return /\b(NOV|DEC|JAN|FEB|WINTER|AUTUMN|FALL)\b/i.test(dateStr);
}

// --------------------------------------------------------------------------- Main Generator
export async function generateReportPDF(
  state: ProjectState,
  imageResolver: (idOrSrc: string) => Promise<string | null>,
  options?: { returnOnly?: boolean }
): Promise<PDFGenerationResult> {
  try {
    // Exact A4 Landscape in Points (841.89 pt x 595.28 pt)
    const W = 841.89;
    const H = 595.28;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    // Section 1: Client Company Logo (strictly for drawing slides, top-right in canvas)
    const rawClientLogo = state.showLogo !== false && state.logoDataUrl?.trim() ? state.logoDataUrl.trim() : null;
    const clientLogoImg = rawClientLogo ? await loadImageElement(rawClientLogo) : null;
    const drawingLogo = clientLogoImg; // Strictly Section 1 only, never falls back to Section 2

    // Section 2: Closing / Sign-off Page Logo (strictly for final closure slide, centered)
    const rawClosingLogo =
      state.showSolarithmBranding && state.solarithmLogoDataUrl?.trim()
        ? state.solarithmLogoDataUrl.trim()
        : null;
    const closingLogoImg = rawClosingLogo ? await loadImageElement(rawClosingLogo) : null;

    // Dynamic EPC Company name for running footer across deliverable pages
    const epcFooterName = state.introEPCCompany?.trim() ? state.introEPCCompany.trim().toUpperCase() : '';

    // ── 1. DYNAMIC SECTION LINKING & DRAWINGS EXTRACTION ──
    const categoryOrderIds =
      state.categoryOrder && state.categoryOrder.length > 0
        ? state.categoryOrder
        : CATEGORIES.map((c) => c.id);

    const orderedCategories: CategoryDef[] = [];
    categoryOrderIds.forEach((cid) => {
      const match = CATEGORIES.find((c) => c.id === cid);
      if (match) orderedCategories.push(match);
    });
    CATEGORIES.forEach((c) => {
      if (!orderedCategories.some((oc) => oc.id === c.id)) {
        orderedCategories.push(c);
      }
    });

    // Collect active drawings per category dynamically (strictly omit categories with 0 assigned images)
    const activeDrawingsMap: Record<string, LoadedDrawing[]> = {};
    for (const cat of orderedCategories) {
      const rawList = state.catOrderData?.[cat.id] || [];
      const validSrcs = rawList.filter((src) => state.catAssignData?.[src] === cat.id);
      if (!validSrcs.length) continue;

      for (let i = 0; i < validSrcs.length; i++) {
        const srcId = validSrcs[i];
        const resolvedDataUrl = await imageResolver(srcId);
        if (resolvedDataUrl) {
          const imgEl = await loadImageElement(resolvedDataUrl);
          if (imgEl && imgEl.width > 0 && imgEl.height > 0) {
            if (!activeDrawingsMap[cat.id]) activeDrawingsMap[cat.id] = [];
            const isShadow = cat.id === 'cat_shadow' || cat.id === 'shadow';
            activeDrawingsMap[cat.id].push({
              cat,
              img: imgEl,
              shadowTimestamp: isShadow && state.shadowTimes?.[i] ? state.shadowTimes[i].trim() : undefined,
              srcId,
            });
          }
        }
      }
    }

    // ── 2. DEPARTMENT & CATEGORY-BASED SPECIFICATIONS EXTRACTION ──
    const NOTES_PER_SLIDE = 10;
    const activeDepartments: ActiveDepartmentSection[] = [];

    if (state.noteOn) {
      // A. Extract Notes from libraryNoteState by Category / Department
      Object.entries(NOTES_LIBRARY).forEach(([catKey, def]) => {
        const catState = state.libraryNoteState?.[catKey];
        if (!catState) return;

        const deptNotes: string[] = [];
        if (Array.isArray(catState.predefined)) {
          catState.predefined.forEach((checked, idx) => {
            if (checked && def.notes[idx]) {
              deptNotes.push(def.notes[idx]);
            }
          });
        }
        if (Array.isArray(catState.custom)) {
          catState.custom.forEach((c) => {
            if (c && c.checked && c.text?.trim()) {
              deptNotes.push(c.text.trim());
            }
          });
        }

        if (deptNotes.length > 0) {
          activeDepartments.push({
            id: catKey,
            title: def.title,
            cleanTitle: formatCategoryTitle(def.title),
            shortRailLabel: getShortRailLabel(catKey, def.title),
            badge: getCategoryBadge(catKey),
            notes: deptNotes,
          });
        }
      });

      // B. General Directives & Site Observations
      const generalDirectives: string[] = [];

      // Cleaning Directive
      if (state.cleaning) {
        generalDirectives.push('This site will require periodic cleaning to maintain optimal system performance.');
      }

      // Shadow Analysis Directive
      if (state.shadowType) {
        if (state.shadowType === 'free') {
          generalDirectives.push(
            'Currently shadow-free; however, any subsequent modification in surrounding object height or roof perimeter structures may result in shadow loss.'
          );
        } else if (state.shadowPct?.trim()) {
          generalDirectives.push(
            `This site is projected with an estimated ${state.shadowPct.trim()}% annual shadow loss; any height change in adjacent structures will directly influence generation yield.`
          );
        }
      }

      // Waterfalling Directive
      if (state.waterfall && state.waterfall !== 'no') {
        generalDirectives.push(
          state.waterfall === 'maybe'
            ? 'Waterfalling may occur depending on peak rainfall velocity and roof drainage channels. On-site gutter alignment is advised.'
            : 'Waterfalling is anticipated at this installation. Dedicated rainwater catchment and peripheral drainage channels are strongly recommended.'
        );
      }

      // Roof Overhang Clearances
      const overhangParts = [
        state.nOn && state.nMM?.trim() && `North: ${state.nMM.trim()}mm`,
        state.eOn && state.eMM?.trim() && `East: ${state.eMM.trim()}mm`,
        state.wOn && state.wMM?.trim() && `West: ${state.wMM.trim()}mm`,
        state.sOn && state.sMM?.trim() && `South: ${state.sMM.trim()}mm`,
      ].filter(Boolean);
      if (overhangParts.length > 0) {
        generalDirectives.push(`Roof overhang clearances must be maintained as specified: ${overhangParts.join(', ')}.`);
      }

      // Tentative Survey Basis
      if (state.tentative) {
        const refs = [
          state.ge && 'Google Earth satellite imagery',
          state.video && 'on-site video survey',
        ].filter(Boolean);
        const by = refs.length ? ` based on ${refs.join(' and ')}` : '';
        generalDirectives.push(
          `Layout dimensions are tentative${by}; final structural anchoring must be verified against on-site civil roof survey.`
        );
      }

      // Converted / Raw Notes
      if (state.convertedNotes?.trim()) {
        state.convertedNotes.split(/\n\n+/).forEach((p) => {
          const t = p.trim();
          if (t) generalDirectives.push(t);
        });
      }

      // Custom Note
      if (state.customNote?.trim()) {
        generalDirectives.push(state.customNote.trim());
      }

      if (generalDirectives.length > 0) {
        activeDepartments.push({
          id: 'site_directives',
          title: 'SITE OBSERVATIONS & DIRECTIVES',
          cleanTitle: 'Site Observations & Directives',
          shortRailLabel: 'SITE DIRECTIVES',
          badge: 'Project Directives',
          notes: generalDirectives,
        });
      }

      // C. Fallback default if noteOn is checked but absolutely zero notes were selected or entered
      if (activeDepartments.length === 0) {
        activeDepartments.push({
          id: 'general_specifications',
          title: 'GENERAL SPECIFICATIONS & DIRECTIVES',
          cleanTitle: 'General Specifications & Directives',
          shortRailLabel: 'SPECIFICATIONS',
          badge: 'Compliance Standard',
          notes: [
            'This site will require periodic cleaning to maintain optimal system performance.',
            'All structural anchoring and module placement must adhere to approved site layout and engineering regulations.'
          ],
        });
      }
    }

    // ── 3. DYNAMIC TOC ENTRIES & EXACT TOTAL PAGES CALCULATION ──
    interface ActiveTocEntry {
      catId: string;
      num: string;
      title: string;
      info: string;
      drawings: LoadedDrawing[];
      pageStart: number;
      pagesCount: number;
    }

    const tocEntries: ActiveTocEntry[] = [];
    const introPageCount = state.showIntroPage ? 1 : 0;
    let simulatedPage = introPageCount + 2; // Slide 1: Cover (if enabled), Slide 2: About This Report
    let sectionCounter = 1;

    for (const cat of orderedCategories) {
      const list = activeDrawingsMap[cat.id] || [];
      if (!list.length) continue;

      const pagesForCat = list.length;
      const catTitle = cat.label
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      tocEntries.push({
        catId: cat.id,
        num: String(sectionCounter).padStart(2, '0'),
        title: catTitle,
        info: SECTION_DESCRIPTIONS[catTitle] || SECTION_DESCRIPTIONS[cat.label] || 'Engineering layout drawings.',
        drawings: list,
        pageStart: simulatedPage,
        pagesCount: pagesForCat,
      });

      simulatedPage += pagesForCat;
      sectionCounter++;
    }

    // Discussion / Engineering Specifications TOC Entry
    let totalDiscussionPages = 0;
    if (state.noteOn && activeDepartments.length > 0) {
      const totalDeptPages = activeDepartments.reduce(
        (sum, dept) => sum + Math.max(1, Math.ceil(dept.notes.length / NOTES_PER_SLIDE)),
        0
      );
      // Dedicated closing / wrap-up slide adds exactly 1 page
      totalDiscussionPages = totalDeptPages + 1;

      tocEntries.push({
        catId: 'discussion',
        num: String(sectionCounter).padStart(2, '0'),
        title: 'Specifications',
        info: SECTION_DESCRIPTIONS['Specifications'] || SECTION_DESCRIPTIONS['Discussion'] || 'Structural engineering schedules, technical specifications, and project directives.',
        drawings: [],
        pageStart: simulatedPage,
        pagesCount: totalDiscussionPages,
      });
      simulatedPage += totalDiscussionPages;
      sectionCounter++;
    }

    const TOTAL_PAGES = Math.max(1, simulatedPage - 1);
    let currentPage = 1;

    /* ──────────────────────────────────────────────────────────
       PAGE 1: COVER PAGE (CLEAN BACKGROUND, NO RADIATING RAYS)
    ────────────────────────────────────────────────────────── */
    if (state.showIntroPage) {
      drawBackground(pdf, W, H);

      // Slanted Gold Panel on Right (hero_x = 430)
      const hero_x = 430;
      pdf.setFillColor(GOLD);
      pdf.triangle(hero_x + 62, 0, W, 0, W, H, 'F');
      pdf.triangle(hero_x + 62, 0, W, H, hero_x, H, 'F');

      // Concentric geometric arcs inside gold panel (clean, no radial lines)
      const ox_ = W + 40;
      const oy_ = 625;
      pdf.setDrawColor('#FEE898');
      pdf.setLineWidth(0.9);
      for (let r = 110; r < 1000; r += 58) {
        pdf.circle(ox_, oy_, r, 'S');
      }

      // Dividing Stripes between panels
      // Green stripe
      pdf.setFillColor(GREEN);
      pdf.triangle(hero_x + 62, 0, hero_x + 68, 0, hero_x + 6, H, 'F');
      pdf.triangle(hero_x + 62, 0, hero_x + 6, H, hero_x, H, 'F');

      // Metallic gold accent stripe
      pdf.setFillColor(GOLD_D);
      pdf.triangle(hero_x + 45, 0, hero_x + 51, 0, hero_x - 11, H, 'F');
      pdf.triangle(hero_x + 45, 0, hero_x - 11, H, hero_x - 17, H, 'F');

      // ── DYNAMIC SPECIFICATIONS COMPUTATION & RESOLUTION ──
      const rawCap = state.introPlantCapacity?.trim();
      const rawPanels = state.introNumPanels?.trim();
      const rawWp = state.introPanelWp?.trim();
      const rawBrand = state.introPanelBrand?.trim();
      const rawInv = state.introInverter?.trim();
      const rawInvBrand = state.introInverterBrand?.trim();
      const rawTilt = state.introTiltAngle?.trim();

      // Calculate kWp if capacity not explicitly given but panels & Wp exist
      let calculatedKw = '';
      const pCountNum = parseFloat((rawPanels || '').replace(/[^0-9.]/g, ''));
      const wpNum = parseFloat((rawWp || '').replace(/[^0-9.]/g, ''));
      if (Number.isFinite(pCountNum) && Number.isFinite(wpNum) && pCountNum > 0 && wpNum > 0) {
        calculatedKw = ((pCountNum * wpNum) / 1000).toFixed(2);
      }

      // 1. Plant Capacity
      let plantCapVal = '—';
      let plantCapUnit = '';
      if (rawCap) {
        plantCapVal = rawCap.replace(/\s*(?:kWp|kW)\b/i, '').trim();
        plantCapUnit = /kWp/i.test(rawCap) ? 'kWp' : 'kW';
      } else if (calculatedKw) {
        plantCapVal = calculatedKw;
        plantCapUnit = 'kWp';
      }

      // 2. Number of Panels
      const panelsVal = rawPanels || '—';
      const panelsUnit = rawPanels ? 'Nos.' : '';

      // 3. Panel Rating & Brand
      let panelRatingVal = '—';
      if (rawWp && rawBrand) {
        const cleanWp = rawWp.replace(/[^0-9.]/g, '');
        panelRatingVal = `${cleanWp} Wp - ${rawBrand}`;
      } else if (rawWp) {
        const cleanWp = rawWp.replace(/[^0-9.]/g, '');
        panelRatingVal = `${cleanWp} Wp`;
      } else if (rawBrand) {
        panelRatingVal = rawBrand;
      }

      // 4. Inverter Rating
      let invRatingVal = '—';
      let invRatingUnit = '';
      if (rawInv) {
        const numOnly = rawInv.replace(/[^0-9.]/g, '');
        if (numOnly) {
          invRatingVal = numOnly;
          invRatingUnit = /kVA/i.test(rawInv) ? 'kVA' : 'kW';
        } else {
          invRatingVal = rawInv;
        }
      }

      // 5. Inverter Brand & Model
      const invBrandVal = rawInvBrand || '—';

      // 6. Tilt Angle
      let tiltVal = '—';
      let tiltUnit = '';
      if (rawTilt) {
        if (rawTilt.includes('°')) {
          tiltVal = rawTilt;
        } else if (/^[0-9.]+$/.test(rawTilt)) {
          tiltVal = `${rawTilt}°`;
        } else {
          tiltVal = rawTilt;
        }
      }

      // ── LEFT COVER PANEL CONTENT ──
      // Top-left logo completely removed to keep the upper region clean

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.setCharSpace(2.6);
      pdf.setTextColor(GREEN);
      pdf.text('SOLAR PV DESIGN REPORT', 48, 126);
      pdf.setCharSpace(0);

      const leftCapDisplay = plantCapVal !== '—'
        ? (plantCapUnit ? `${plantCapVal} ${plantCapUnit}` : plantCapVal)
        : (calculatedKw ? `${calculatedKw} kW` : 'Solar PV');

      pdf.setFont('helvetica', 'bold');
      const capFontSize = leftCapDisplay.length > 8 ? 52 : 62;
      pdf.setFontSize(capFontSize);
      pdf.setTextColor(GOLD_D);
      pdf.text(leftCapDisplay, 46, 202);

      // Decorative divider rule cleanly positioned below plant capacity
      drawOrnament(pdf, 155, 244, 215);

      // Client section with enlarged executive presence
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11.5);
      pdf.setTextColor(MUTED);
      pdf.text('Prepared for', 48, 290);

      const clientName = state.introClientName?.trim() || '—';
      pdf.setFont('helvetica', 'bold');
      let clientFontSize = 27;
      pdf.setFontSize(clientFontSize);
      while (pdf.getTextWidth(clientName) > 340 && clientFontSize > 18) {
        clientFontSize -= 1;
        pdf.setFontSize(clientFontSize);
      }
      pdf.setTextColor(INK);
      pdf.text(clientName, 48, 330);

      // Clean horizontal hairline beneath client name block
      pdf.setDrawColor(EDGE);
      pdf.setLineWidth(0.8);
      pdf.line(48, 372, 388, 372);

      // Enlarged Date & EPC Company metadata
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(MUTED);
      pdf.text('Date', 48, 410);
      pdf.text('EPC COMPANY', 205, 410);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14.5);
      pdf.setTextColor(INK);
      pdf.text(state.introDate?.trim() || '—', 48, 436);

      const epcVal = state.introEPCCompany?.trim() || '—';
      let epcFontSize = 14.5;
      pdf.setFontSize(epcFontSize);
      while (pdf.getTextWidth(epcVal) > 182 && epcFontSize > 10.5) {
        epcFontSize -= 0.5;
        pdf.setFontSize(epcFontSize);
      }
      pdf.text(epcVal, 205, 436);

      // ── RIGHT SPECIFICATIONS STACK (6 ITEMS WITH NO COLLISION) ──
      const xt = 538;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13.5);
      pdf.setCharSpace(2.2);
      pdf.setTextColor(GREEN);
      pdf.text('PROJECT SPECIFICATIONS', xt, 68);
      pdf.setCharSpace(0);

      interface SpecItem {
        val: string;
        unit: string;
        label: string;
        isText?: boolean;
      }

      const specs: SpecItem[] = [
        {
          val: plantCapVal,
          unit: plantCapUnit,
          label: 'PLANT CAPACITY',
        },
        {
          val: panelsVal,
          unit: panelsUnit,
          label: 'NUMBER OF PANELS',
        },
        {
          val: panelRatingVal,
          unit: '',
          label: 'PANEL RATING & BRAND',
          isText: true,
        },
        {
          val: invRatingVal,
          unit: invRatingUnit,
          label: 'INVERTER RATING',
        },
        {
          val: invBrandVal,
          unit: '',
          label: 'INVERTER BRAND & MODEL',
          isText: true,
        },
        {
          val: tiltVal,
          unit: tiltUnit,
          label: 'ARRAY TILT ANGLE',
        },
      ];

      const yStart = 114;
      const yStep = 67;

      specs.forEach((item, i) => {
        const yPos = yStart + i * yStep;

        pdf.setFont('helvetica', 'bold');
        if (item.isText) {
          let fSize = 25;
          pdf.setFontSize(fSize);
          while (pdf.getTextWidth(item.val) > 240 && fSize > 12) {
            fSize -= 1;
            pdf.setFontSize(fSize);
          }
          pdf.setTextColor(GREEN);
          pdf.text(item.val, xt, yPos);
        } else {
          pdf.setFontSize(30);
          pdf.setTextColor(GREEN);
          pdf.text(item.val, xt, yPos);

          const vw = pdf.getTextWidth(item.val);
          if (item.unit && item.val !== '—') {
            pdf.setFontSize(14);
            pdf.text(item.unit, xt + vw + (item.unit === '°' ? 3 : 6), yPos - 8);
          }
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setCharSpace(2.0);
        pdf.setTextColor(GREEN);
        const cleanLabel = pdf.splitTextToSize(item.label, W - 46 - xt);
        pdf.text(cleanLabel[0] || '', xt, yPos + 18);
        pdf.setCharSpace(0);

        if (i < specs.length - 1) {
          pdf.setDrawColor(GREEN_LINE);
          pdf.setLineWidth(0.8);
          pdf.line(xt, yPos + 28, W - 46, yPos + 28);
        }
      });

      currentPage++;
    }

    /* ──────────────────────────────────────────────────────────
       PAGE 2: ABOUT THIS REPORT (DYNAMIC TOC & SEASONAL SHADOW LEGEND)
    ────────────────────────────────────────────────────────── */
    if (currentPage > 1) {
      pdf.addPage([841.89, 595.28], 'landscape');
    }
    drawBackground(pdf, W, H);
    drawSlideHeader(pdf, null, 'About This Report', undefined, false, false, null, epcFooterName);

    const x0 = 44;
    const full_w = W - 88; // 753.89 pt

    // Intro paragraph
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11.2);
    pdf.setTextColor(INK);
    const introLines = pdf.splitTextToSize(INTRO_TEXT, full_w * 0.88);
    let paraY = 105;
    introLines.forEach((l: string) => {
      pdf.text(l, x0, paraY);
      paraY += 17;
    });

    // What's Inside section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setCharSpace(2.4);
    pdf.setTextColor(GOLD_D);
    pdf.text("WHAT'S INSIDE", x0, 160);
    pdf.setCharSpace(0);

    // Dynamic 2-column TOC index grid
    const gapx = 18;
    const chh = 54;
    const gapy = 8;
    const cw = (full_w - gapx) / 2;
    const gtop = 175;

    tocEntries.forEach((entry, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const cx = x0 + col * (cw + gapx);
      const cy = gtop + row * (chh + gapy);

      // Subtle card drop shadow
      pdf.setFillColor(210, 195, 160);
      pdf.roundedRect(cx + 3, cy + 3, cw, chh, 10, 10, 'F');

      // Card background & edge
      pdf.setFillColor(CREAM);
      pdf.roundedRect(cx, cy, cw, chh, 10, 10, 'F');
      pdf.setDrawColor(EDGE);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(cx, cy, cw, chh, 10, 10, 'S');

      // Left metallic gold accent bar
      pdf.setFillColor(GOLD);
      pdf.roundedRect(cx, cy + 12, 5, chh - 24, 2.5, 2.5, 'F');

      // Section 2-digit number
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(GOLD_D);
      pdf.text(entry.num, cx + 22, cy + 34);

      // Section Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(GREEN);
      pdf.text(entry.title, cx + 64, cy + 22);

      // Section description
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(MUTED);
      const dlines = pdf.splitTextToSize(entry.info, cw - 78);
      let dy = cy + 36;
      dlines.slice(0, 2).forEach((dl: string) => {
        pdf.text(dl, cx + 64, dy);
        dy += 11;
      });
    });

    // Dynamic Reading the Shadow Analysis legend box
    const hasShadowSection = tocEntries.some((e) => e.catId === 'cat_shadow' || e.catId === 'shadow');
    if (hasShadowSection) {
      const sy = 465;
      const sh_ = 50;

      pdf.setFillColor(210, 195, 160);
      pdf.roundedRect(x0 + 3, sy + 3, full_w, sh_, 10, 10, 'F');

      pdf.setFillColor(CREAM);
      pdf.roundedRect(x0, sy, full_w, sh_, 10, 10, 'F');
      pdf.setDrawColor(EDGE);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(x0, sy, full_w, sh_, 10, 10, 'S');

      pdf.setFillColor(GOLD);
      pdf.roundedRect(x0, sy + 11, 5, sh_ - 22, 2.5, 2.5, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.8);
      pdf.setCharSpace(2.2);
      pdf.setTextColor(GOLD_D);
      pdf.text('READING THE SHADOW ANALYSIS', x0 + 26, sy + 18);
      pdf.setCharSpace(0);

      const uniqueDates = extractUniqueShadowDates(state.shadowTimes);
      const pillW = 66;
      const pillH = 20;

      uniqueDates.forEach((dateLabel, k) => {
        const isWinter = isWinterDate(dateLabel);
        const px = x0 + 26 + k * 185;
        if (px + 170 > x0 + full_w) return;

        if (!isWinter) {
          // Gold pill (Summer study)
          pdf.setFillColor(GOLD);
          pdf.roundedRect(px, sy + 25, pillW, pillH, pillH / 2, pillH / 2, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(GREEN);
          pdf.text(dateLabel, px + pillW / 2, sy + 38, { align: 'center' });

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.setTextColor(INK);
          pdf.text(dateLabel.includes('JUN') ? 'Summer solstice' : 'Summer study', px + pillW + 10, sy + 38);
        } else {
          // Green pill (Winter study)
          pdf.setFillColor(GREEN);
          pdf.roundedRect(px, sy + 25, pillW, pillH, pillH / 2, pillH / 2, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(GOLD_L);
          pdf.text(dateLabel, px + pillW / 2, sy + 38, { align: 'center' });

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          pdf.setTextColor(INK);
          pdf.text(dateLabel.includes('DEC') ? 'Winter solstice' : 'Winter study', px + pillW + 10, sy + 38);
        }
      });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(MUTED);
      pdf.text('Each date is shown in the morning and afternoon.', x0 + full_w - 24, sy + 38, { align: 'right' });
    }

    // Page 2 Running Counter on right
    const totStr = String(TOTAL_PAGES).padStart(2, '0');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(MUTED);
    pdf.text(totStr, W - 44, 568, { align: 'right' });
    const totW = pdf.getTextWidth(totStr);
    pdf.text('/', W - 44 - totW - 4, 568, { align: 'right' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(17);
    pdf.setTextColor(GREEN);
    pdf.text('02', W - 44 - totW - 16, 568, { align: 'right' });

    currentPage++;

    /* ──────────────────────────────────────────────────────────
       PAGES 3+: DELIVERABLE DRAWINGS & 4-QUADRANT SHADOW ANALYSIS
    ────────────────────────────────────────────────────────── */
    for (const entry of tocEntries) {
      if (entry.catId === 'discussion') continue;

      const isShadow = catIsShadow(entry.catId);

      if (!isShadow) {
        // Standard Deliverable Drawing Pages
        const n = entry.drawings.length;
        for (let k = 0; k < n; k++) {
          pdf.addPage([841.89, 595.28], 'landscape');
          drawBackground(pdf, W, H);

          const subtext = n > 1 ? `VIEW ${k + 1} OF ${n}` : undefined;
          drawLeftRail(pdf, entry.num, entry.title, currentPage, TOTAL_PAGES);
          // Top-left header area left clean above the drawing frame
          drawSlideHeader(pdf, null, entry.title, subtext, true, state.showSolarithmBranding, null, epcFooterName);

          // Drawing Viewport bounds (golden perimeter frame conforms exactly to computed image bounds)
          const x0 = 88;
          const iw = W - 38 - x0 - 6; // 709.89 pt
          const ih = (iw * 9) / 16;   // 399.31 pt
          const iy = 98;

          drawFramedDrawing(pdf, entry.drawings[k].img, x0, iy, iw, ih, false, 6, drawingLogo);
          currentPage++;
        }
      } else {
        // Single-Drawing Seasonal Shadow Analysis Pages (Strictly ONE drawing per page with full viewport dimensions)
        const shadowImgs = entry.drawings;
        const totalDrawings = shadowImgs.length;
        const DEFAULT_SLOT_TIMES = ['21 JUN · 9:00 AM', '21 JUN · 4:00 PM', '21 DEC · 9:00 AM', '21 DEC · 4:00 PM'];

        for (let k = 0; k < totalDrawings; k++) {
          pdf.addPage([841.89, 595.28], 'landscape');
          drawBackground(pdf, W, H);

          const subtext = totalDrawings > 1 ? `VIEW ${k + 1} OF ${totalDrawings}` : undefined;
          drawLeftRail(pdf, entry.num, entry.title, currentPage, TOTAL_PAGES);
          // Top-left header area left clean above the drawing frame
          drawSlideHeader(pdf, null, entry.title, subtext, true, state.showSolarithmBranding, null, epcFooterName);

          const drawing = shadowImgs[k];
          const slotTime =
            drawing.shadowTimestamp ||
            state.shadowTimes?.[k] ||
            DEFAULT_SLOT_TIMES[k] ||
            `STUDY ${k + 1}`;

          const isWinter = isWinterDate(slotTime);

          // Content area geometry
          const x0 = 88;
          const availW = W - 38 - x0; // 715.89 pt
          const contentCenterX = x0 + availW / 2; // 445.945 pt

          // Centered Date & Time Badge (Pill Container)
          const pillText = slotTime.toUpperCase();
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10.5);
          const rawTextW = pdf.getTextWidth(pillText);
          const pillW = Math.max(160, rawTextW + 36);
          const pillH = 26;
          const pillRadius = pillH / 2;
          const pillX = contentCenterX - pillW / 2;
          const pillY = 92;

          // Soft drop shadow tightly conforming to pill
          pdf.setFillColor(210, 195, 160);
          pdf.roundedRect(pillX + 2, pillY + 2, pillW, pillH, pillRadius, pillRadius, 'F');

          // Rounded pill badge container
          pdf.setFillColor(isWinter ? GREEN : GOLD);
          pdf.roundedRect(pillX, pillY, pillW, pillH, pillRadius, pillRadius, 'F');

          // Strict horizontal and vertical text centering inside pill container
          // Zero top displacement: capHeight for 10.5pt bold is 7.54pt. Center of caps is at baseline - 3.77pt.
          // Setting baseline = (pillY + pillH / 2) + 3.75 gives exact vertical symmetry.
          // Zero left displacement: align: 'center' with charSpace = 0 gives exact horizontal symmetry.
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10.5);
          pdf.setTextColor(isWinter ? GOLD_L : GREEN);
          const textBaselineY = pillY + pillH / 2 + 3.75;
          pdf.text(pillText, contentCenterX, textBaselineY, { align: 'center' });

          // Full Viewport Drawing below the centered pill badge
          const drawY = pillY + pillH + 12; // 130 pt
          const availH = 416; // 130 to 546 pt
          drawFramedDrawing(pdf, drawing.img, x0, drawY, availW, availH, isWinter, 6, drawingLogo);

          currentPage++;
        }
      }
    }

    /* ──────────────────────────────────────────────────────────
       FINAL PAGES: DEPARTMENT-BASED ENGINEERING SPECIFICATIONS
       & DEDICATED CLOSING / SIGN-OFF SLIDE
    ────────────────────────────────────────────────────────── */
    if (state.noteOn && activeDepartments.length > 0) {
      const dEntry = tocEntries.find((e) => e.catId === 'discussion');
      const dNum = dEntry ? dEntry.num : '08';

      // 1. Render One Dedicated Slide per Active Department (8-10 points per slide)
      activeDepartments.forEach((dept) => {
        const chunks: string[][] = [];
        for (let i = 0; i < dept.notes.length; i += NOTES_PER_SLIDE) {
          chunks.push(dept.notes.slice(i, i + NOTES_PER_SLIDE));
        }

        chunks.forEach((chunk, pageIdx) => {
          pdf.addPage([841.89, 595.28], 'landscape');
          drawBackground(pdf, W, H);

          // Left Rail with department label and accurate counter
          drawLeftRail(pdf, dNum, dept.shortRailLabel, currentPage, TOTAL_PAGES);

          // Top Header: Primary Department Name & Flush Right Alignment
          const isMultiPage = chunks.length > 1;
          const slideTitle = isMultiPage && pageIdx > 0 ? `${dept.cleanTitle} (Cont.)` : dept.cleanTitle;
          const slideSubtitle = isMultiPage
            ? `ENGINEERING SPECIFICATIONS · PART ${pageIdx + 1} OF ${chunks.length}`
            : 'ENGINEERING SPECIFICATIONS & DIRECTIVES';

          drawSlideHeader(pdf, null, slideTitle, slideSubtitle, true, false, null, epcFooterName);

          const x0 = 88;
          const cwid = W - 38 - x0; // 715.89 pt
          const yStart = 98;

          // Precompute row heights and line wrapping with full available width
          const commentWidth = cwid - 76; // 639.89 pt available text width
          const rowData = chunk.map((noteText, idx) => {
            const sentence = formatToSentenceCase(noteText);
            const wrapped = pdf.splitTextToSize(sentence, commentWidth);
            const minRowH = chunk.length <= 6 ? 40 : (chunk.length <= 8 ? 36 : 33);
            const lineH = 13.5;
            const contentH = Math.max(minRowH, wrapped.length * lineH + 16);
            return {
              indexNum: pageIdx * NOTES_PER_SLIDE + idx + 1,
              sentence,
              wrapped,
              lineH,
              h: contentH,
            };
          });

          const tableHeaderH = 24;
          const totalRowsH = rowData.reduce((sum, r) => sum + r.h, 0);
          const tableTotalH = tableHeaderH + totalRowsH;

          // Schedule container card drop shadow
          pdf.setFillColor(216, 206, 186);
          pdf.roundedRect(x0 + 2.5, yStart + 2.5, cwid, tableTotalH, 8, 8, 'F');

          // Schedule container background
          pdf.setFillColor(CREAM);
          pdf.roundedRect(x0, yStart, cwid, tableTotalH, 8, 8, 'F');
          pdf.setDrawColor(EDGE);
          pdf.setLineWidth(0.8);
          pdf.roundedRect(x0, yStart, cwid, tableTotalH, 8, 8, 'S');

          // Top metallic gold accent bar
          pdf.setFillColor(GOLD);
          pdf.roundedRect(x0, yStart, cwid, 3, 1.5, 1.5, 'F');

          // Table header strip (removed Standard/Code column)
          pdf.setFillColor('#F3EDE0');
          pdf.rect(x0, yStart + 3, cwid, tableHeaderH, 'F');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setCharSpace(2.0);
          pdf.setTextColor(GOLD_D);
          pdf.text('ITEM', x0 + 22, yStart + 18);
          pdf.text('ENGINEERING SPECIFICATION & DIRECTIVES', x0 + 56, yStart + 18);
          pdf.setCharSpace(0);

          pdf.setDrawColor(EDGE);
          pdf.setLineWidth(0.6);
          pdf.line(x0, yStart + 3 + tableHeaderH, x0 + cwid, yStart + 3 + tableHeaderH);

          // Render rows: only numerical index followed by full-width specification comment text
          let currentY = yStart + 3 + tableHeaderH;
          rowData.forEach((row, rIdx) => {
            const rowH = row.h;
            const isEven = rIdx % 2 === 0;

            if (!isEven) {
              pdf.setFillColor('#FAF6EE');
              pdf.rect(x0, currentY, cwid, rowH, 'F');
            }

            // Small bold gold numbering index badge
            const badgeW = 28;
            const badgeH = 18;
            const badgeX = x0 + 16;
            const badgeY = currentY + (rowH - badgeH) / 2;

            pdf.setFillColor('#F6EED8');
            pdf.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, 'F');
            pdf.setDrawColor('#DFCEAB');
            pdf.setLineWidth(0.5);
            pdf.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, 'S');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9.5);
            pdf.setTextColor(GOLD_D);
            const idxStr = String(row.indexNum).padStart(2, '0');
            pdf.text(idxStr, badgeX + badgeW / 2, badgeY + 12.5, { align: 'center' });

            // Note Text: Full available width with clean line wrapping
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9.8);
            pdf.setTextColor(INK);
            const textStartY = currentY + (rowH - (row.wrapped.length - 1) * row.lineH) / 2 + 3.2;
            row.wrapped.forEach((lineText: string, lIdx: number) => {
              pdf.text(lineText, x0 + 56, textStartY + lIdx * row.lineH);
            });

            // Hairline divider
            if (rIdx < rowData.length - 1) {
              pdf.setDrawColor('#ECE4D4');
              pdf.setLineWidth(0.4);
              pdf.line(x0 + 12, currentY + rowH, x0 + cwid - 12, currentY + rowH);
            }

            currentY += rowH;
          });

          currentPage++;
        });
      });

      // 2. Dedicated Final Closing / Sign-off / Wrap-up Slide
      pdf.addPage([841.89, 595.28], 'landscape');
      drawBackground(pdf, W, H);

      drawLeftRail(pdf, dNum, 'CLOSING', currentPage, TOTAL_PAGES);
      // Remove top-left logo on final closing page (leave top-left area completely clean)
      drawSlideHeader(pdf, null, 'Project Closure', 'FINAL SUBMISSION & SIGN-OFF', true, state.showSolarithmBranding, null, epcFooterName);

      const x0 = 88;
      const cwid = W - 38 - x0; // 715.89 pt
      const mid = x0 + cwid / 2;
      const cardY = 100;
      const cardH = 445;

      // Outer presentation card for closure
      pdf.setFillColor(216, 206, 186);
      pdf.roundedRect(x0 + 3, cardY + 3, cwid, cardH, 10, 10, 'F');

      pdf.setFillColor(CREAM);
      pdf.roundedRect(x0, cardY, cwid, cardH, 10, 10, 'F');
      pdf.setDrawColor(EDGE);
      pdf.setLineWidth(0.8);
      pdf.roundedRect(x0, cardY, cwid, cardH, 10, 10, 'S');

      // Top metallic gold bar
      pdf.setFillColor(GOLD);
      pdf.roundedRect(x0, cardY, cwid, 3, 1.5, 1.5, 'F');

      // ── UPPER SECTION: CLIENT TITLE BLOCK ──
      const clientName = state.introClientName?.trim() || 'PROJECT SUBMISSION';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(23);
      pdf.setTextColor(GREEN);
      pdf.text(clientName, mid, cardY + 48, { align: 'center' });

      // Decorative Rule directly beneath Client Name (space below it left clean, subtitle deleted)
      drawOrnament(pdf, mid, cardY + 70, 260);

      // ── MIDDLE SECTION: ENLARGED CENTERED CLOSING / SIGN-OFF PAGE LOGO ──
      // Strictly render the Section 2 Closing Page Logo (closingLogoImg) if enabled and uploaded
      // Client Logo (Section 1) is explicitly excluded from this final closure slide
      if (closingLogoImg) {
        const centerLogoMaxW = 480;
        const centerLogoMaxH = 210;
        const centerLogoBoxX = mid - centerLogoMaxW / 2;
        const centerLogoBoxY = 195;
        drawLogo(pdf, closingLogoImg, centerLogoBoxX, centerLogoBoxY, centerLogoMaxW, centerLogoMaxH, 'center');
      }

      // ── LOWER SECTION: HORIZONTALLY CENTERED SUPERVISING ENGINEERS CARD ──
      const boxW = 440;
      const boxH = 78;
      const boxX = mid - boxW / 2;
      const signBoxY = cardY + cardH - 96;

      pdf.setFillColor('#FAF6EE');
      pdf.roundedRect(boxX, signBoxY, boxW, boxH, 6, 6, 'F');
      pdf.setDrawColor(EDGE);
      pdf.setLineWidth(0.6);
      pdf.roundedRect(boxX, signBoxY, boxW, boxH, 6, 6, 'S');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setCharSpace(2.0);
      pdf.setTextColor(GOLD_D);
      pdf.text('SUPERVISING ENGINEERS', mid, signBoxY + 22, { align: 'center' });
      pdf.setCharSpace(0);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(INK);
      const engineerName = getPOName(state);
      pdf.text(engineerName, mid, signBoxY + 44, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(MUTED);
      pdf.text(`Design Submission Date: ${state.introDate?.trim() || '—'}`, mid, signBoxY + 63, { align: 'center' });

      currentPage++;
    }

    const cleanProj = (state.fileName?.trim() || state.introClientName?.trim() || 'SOLAR_DESIGN').replace(
      /[^a-zA-Z0-9_-]/g,
      '_'
    );
    const filename = `${cleanProj}_Solar_Design_Report.pdf`;

    const blob = pdf.output('blob');
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);
    const pageCount = TOTAL_PAGES;

    if (!options?.returnOnly) {
      pdf.save(filename);
    }

    return {
      pdf,
      blob: pdfBlob,
      blobUrl,
      filename,
      pageCount,
    };
  } catch (err) {
    console.error('Fatal error during PDF generation:', err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}

function catIsShadow(catId: string): boolean {
  return catId === 'cat_shadow' || catId === 'shadow';
}

/**
 * Direct options interface for standalone callers
 */
export interface GeneratePdfOptions {
  fileName: string;
  logoDataUrl: string | null;
  solarithmLogoDataUrl: string | null;
  showLogo: boolean;
  showSolarithmBranding: boolean;
  intro: {
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
  };
  shadowType: 'free' | 'percent' | null;
  shadowPct: string;
  shadowTimes: string[];
  waterfall: 'no' | 'yes' | 'maybe';
  overhang: {
    nOn: boolean; nMM: string;
    eOn: boolean; eMM: string;
    wOn: boolean; wMM: string;
    sOn: boolean; sMM: string;
  };
  tentative: boolean;
  ge: boolean;
  video: boolean;
  shift: {
    shiftOn: boolean;
    shiftItem: string;
    shiftFrom: string;
    shiftTo: string;
  };
  trim: {
    trimOn: boolean;
    trimDir: string;
  };
  cleaning: boolean;
  noteOn: boolean;
  poName: string;
  convertedNotes: string;
  customNote: string;
  libraryNoteState: Record<string, LibraryCategoryState>;
  orderedCategories: CategoryDef[];
  catOrder: Record<string, string[]>;
  imagesMap: Record<string, { id: string; dataUrl: string; assignedCategory?: string }>;
}

/**
 * Backward-compatible standalone wrapper
 */
export async function generateEngineeringReportPdf(opts: GeneratePdfOptions): Promise<void> {
  const syntheticState: ProjectState = {
    fileName: opts.fileName,
    logoDataUrl: opts.logoDataUrl,
    solarithmLogoDataUrl: opts.solarithmLogoDataUrl,
    showLogo: opts.showLogo,
    showSolarithmBranding: opts.showSolarithmBranding,
    showIntroPage: opts.intro.showIntroPage,
    introClientName: opts.intro.introClientName,
    introDate: opts.intro.introDate,
    introNumPanels: opts.intro.introNumPanels,
    introPanelBrand: opts.intro.introPanelBrand,
    introPanelWp: opts.intro.introPanelWp,
    introInverter: opts.intro.introInverter,
    introInverterBrand: opts.intro.introInverterBrand,
    introPlantCapacity: opts.intro.introPlantCapacity,
    introTiltAngle: opts.intro.introTiltAngle,
    introEPCCompany: opts.intro.introEPCCompany,
    showClientName: true,
    showDate: true,
    showNumPanels: true,
    showPanelBrand: true,
    showPanelWp: true,
    showInverter: true,
    showInverterBrand: true,
    showPlantCapacity: true,
    showTiltAngle: true,
    showEPCCompany: true,
    shadowType: opts.shadowType,
    shadowPct: opts.shadowPct,
    shadowTimes: opts.shadowTimes,
    waterfall: opts.waterfall,
    nOn: opts.overhang.nOn, nMM: opts.overhang.nMM,
    eOn: opts.overhang.eOn, eMM: opts.overhang.eMM,
    wOn: opts.overhang.wOn, wMM: opts.overhang.wMM,
    sOn: opts.overhang.sOn, sMM: opts.overhang.sMM,
    tentative: opts.tentative,
    ge: opts.ge,
    video: opts.video,
    shiftOn: opts.shift.shiftOn,
    shiftItem: opts.shift.shiftItem,
    shiftFrom: opts.shift.shiftFrom,
    shiftTo: opts.shift.shiftTo,
    trimOn: opts.trim.trimOn,
    trimDir: opts.trim.trimDir,
    cleaning: opts.cleaning,
    noteOn: opts.noteOn,
    poValue: opts.poName,
    poCustom: '',
    rawNotes: '',
    convertedNotes: opts.convertedNotes,
    customNote: opts.customNote,
    libraryNoteState: opts.libraryNoteState,
    categoryOrder: opts.orderedCategories.map((c) => c.id),
    catAssignData: Object.fromEntries(
      Object.entries(opts.imagesMap).map(([id, img]) => [id, img.assignedCategory || ''])
    ),
    catOrderData: opts.catOrder,
    imgNameMap: {},
  };

  await generateReportPDF(syntheticState, async (id) => opts.imagesMap[id]?.dataUrl || null, {
    returnOnly: false,
  });
}
