/**
 * Official Solarithm Design & Engineering Brand Assets
 */

export const SOLARITHM_BRAND_COLORS = {
  gold: '#D4AF37',
  goldDark: '#C9A84C',
  goldLight: '#F5DE88',
  green: '#005A36',
  greenDark: '#0D472B',
  obsidian950: '#0E0E10',
  obsidian900: '#141416',
  obsidian850: '#18181B',
  obsidian800: '#27272A',
  architectZinc: '#E4E4E7',
  architectWhite: '#FFFFFF',
};

/**
 * Official Solarithm SVG Logo matching the uploaded brand asset:
 * - "solar" in gradient gold with sun-rays & PV panel leaf emblem
 * - "ithm" in deep emerald forest green with leaf dot & wind turbine
 * - "Design & Engineering" text below
 * - Gold flourish divider line
 */
export const SOLARITHM_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE082" />
      <stop offset="40%" stop-color="#D4AF37" />
      <stop offset="80%" stop-color="#C9A84C" />
      <stop offset="100%" stop-color="#8A701E" />
    </linearGradient>
    <linearGradient id="goldLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF2B2" />
      <stop offset="100%" stop-color="#D4AF37" />
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#006A40" />
      <stop offset="50%" stop-color="#005A36" />
      <stop offset="100%" stop-color="#053320" />
    </linearGradient>
  </defs>

  <g transform="translate(40, 110)">
    <!-- 's' -->
    <path d="M 50 170 C 50 145 75 130 115 130 C 150 130 180 142 180 168 C 180 205 100 205 100 230 C 100 242 118 248 135 248 C 158 248 178 238 185 230 L 195 260 C 180 275 155 285 125 285 C 80 285 55 265 55 232 C 55 190 135 188 135 168 C 135 158 122 152 108 152 C 85 152 68 162 60 170 Z" fill="url(#goldGrad)"/>

    <!-- 'o' SOLAR EMBLEM (Sunburst + Ring + PV Grid) -->
    <g transform="translate(230, 205)">
      <!-- Sun Rays -->
      <path d="M 0 -85 L 0 -115 M -28 -80 L -45 -105 M 28 -80 L 45 -105 M -55 -60 L -80 -80 M 55 -60 L 80 -80 M -75 -35 L -105 -45 M 75 -35 L 105 -45" stroke="url(#goldGrad)" stroke-width="7" stroke-linecap="round"/>
      <polygon points="0,-125 -6,-95 6,-95" fill="url(#goldGrad)"/>
      <polygon points="35,-115 22,-90 34,-85" fill="url(#goldGrad)"/>
      <polygon points="-35,-115 -34,-85 -22,-90" fill="url(#goldGrad)"/>
      <polygon points="70,-95 50,-75 62,-70" fill="url(#goldGrad)"/>
      <polygon points="-70,-95 -62,-70 -50,-75" fill="url(#goldGrad)"/>

      <!-- Gold Top Arc / Arch -->
      <path d="M -75 0 A 75 75 0 0 1 75 0" fill="none" stroke="url(#goldGrad)" stroke-width="26" stroke-linecap="round"/>

      <!-- Solar PV Panel Grid inside Lower Half with Leaf Swoosh -->
      <g transform="translate(-50, -5)">
        <path d="M 0 0 L 80 -25 L 105 15 C 85 60 25 70 0 0 Z" fill="url(#greenGrad)" />
        <!-- PV Grid Lines -->
        <path d="M 22 -6 L 85 20 M 42 -13 L 95 10 M 62 -20 L 102 3" stroke="#FCE082" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 30 15 L 75 -23 M 50 25 L 85 -20 M 70 35 L 95 -12" stroke="#FCE082" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Green leaf bottom sweep -->
        <path d="M -15 20 C 15 70 70 65 110 30 C 80 75 20 80 -15 20 Z" fill="#005A36"/>
      </g>
    </g>

    <!-- 'l' -->
    <rect x="345" y="125" width="36" height="155" rx="10" fill="url(#goldGrad)" />

    <!-- 'a' -->
    <path d="M 405 210 C 405 160 450 148 495 148 L 495 280 L 462 280 L 462 260 C 450 275 430 284 408 284 C 375 284 350 265 350 230 C 350 188 395 178 460 178 L 460 174 C 460 162 445 158 430 158 C 412 158 398 165 390 172 Z M 462 205 C 420 205 388 210 388 232 C 388 248 402 258 420 258 C 445 258 462 242 462 225 Z" fill="url(#goldGrad)"/>

    <!-- 'r' -->
    <path d="M 515 152 L 550 152 L 550 180 C 562 160 585 150 610 150 L 610 188 C 575 188 552 205 552 235 L 552 280 L 515 280 Z" fill="url(#goldGrad)"/>

    <!-- 'i' in forest green with leaf dot -->
    <g transform="translate(625, 0)">
      <!-- Leaf Dot -->
      <path d="M 20 105 C 5 125 18 145 35 140 C 45 120 35 95 20 105 Z" fill="url(#greenGrad)"/>
      <rect x="10" y="152" width="34" height="128" rx="8" fill="url(#greenGrad)"/>
    </g>

    <!-- 't' -->
    <path d="M 685 125 L 720 125 L 720 152 L 755 152 L 755 182 L 720 182 L 720 248 C 720 258 726 262 738 262 L 755 262 L 755 282 C 738 284 720 284 702 280 C 690 275 685 262 685 245 L 685 182 L 665 182 L 665 152 L 685 152 Z" fill="url(#greenGrad)"/>

    <!-- 'h' -->
    <path d="M 770 100 L 805 100 L 805 180 C 820 160 840 150 868 150 C 905 150 925 175 925 210 L 925 280 L 890 280 L 890 215 C 890 195 878 182 858 182 C 835 182 805 198 805 228 L 805 280 L 770 280 Z" fill="url(#greenGrad)"/>

    <!-- 'm' with embedded Wind Turbine -->
    <g transform="translate(940, 152)">
      <path d="M 0 0 L 35 0 L 35 30 C 45 10 70 0 95 0 C 122 0 142 12 150 32 C 165 10 190 0 218 0 C 255 0 275 22 275 60 L 275 128 L 240 128 L 240 65 C 240 45 230 32 212 32 C 190 32 170 48 170 78 L 170 128 L 135 128 L 135 65 C 135 45 125 32 108 32 C 85 32 35 48 35 78 L 35 128 L 0 128 Z" fill="url(#greenGrad)"/>

      <!-- Wind Turbine in the right stroke -->
      <g transform="translate(240, 60)">
        <!-- Tower -->
        <polygon points="-4,68 4,68 2,-5 -2,-5" fill="url(#goldGrad)"/>
        <!-- Hub -->
        <circle cx="0" cy="-6" r="6" fill="#FCE082"/>
        <!-- 3 Blades -->
        <path d="M 0 -6 C 5 -25 2 -45 0 -50 C -2 -45 -5 -25 0 -6 Z" fill="url(#goldGrad)"/>
        <path d="M 0 -6 C 22 5 38 18 42 22 C 38 24 18 15 0 -6 Z" fill="url(#goldGrad)"/>
        <path d="M 0 -6 C -22 5 -38 18 -42 22 C -38 24 -18 15 0 -6 Z" fill="url(#goldGrad)"/>
      </g>
    </g>
  </g>

  <!-- Subtitle: Design & Engineering -->
  <text x="500" y="465" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="44" font-weight="800" letter-spacing="4" fill="#005A36" text-anchor="middle">Design &amp; Engineering</text>

  <!-- Gold Flourish Ornament Line -->
  <g transform="translate(500, 498)">
    <line x1="-320" y1="0" x2="-40" y2="0" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round"/>
    <!-- Left Arrow Head -->
    <polygon points="-330,0 -315,-6 -315,6" fill="url(#goldGrad)"/>
    <!-- Center Diamonds -->
    <polygon points="0,-10 10,0 0,10 -10,0" fill="url(#goldGrad)"/>
    <polygon points="-22,-7 -15,0 -22,7 -29,0" fill="url(#goldGrad)"/>
    <polygon points="22,-7 29,0 22,7 15,0" fill="url(#goldGrad)"/>
    <!-- Right Arrow Head -->
    <line x1="40" y1="0" x2="320" y2="0" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round"/>
    <polygon points="330,0 315,-6 315,6" fill="url(#goldGrad)"/>
  </g>
</svg>
`;

let cachedSolarithmDataUrl: string | null = null;

/**
 * Returns a high-resolution PNG data URL of the official Solarithm Logo
 * for use in jsPDF and HTML rendering.
 */
export async function getSolarithmLogoDataUrl(): Promise<string> {
  if (cachedSolarithmDataUrl) return cachedSolarithmDataUrl;

  return new Promise((resolve) => {
    const svgBlob = new Blob([SOLARITHM_LOGO_SVG], { type: 'image/svg+xml;charset=utf-8' });
    const urlHelper = typeof window !== 'undefined' && window.URL ? window.URL : URL;
    const blobUrl = urlHelper.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        cachedSolarithmDataUrl = dataUrl;
        urlHelper.revokeObjectURL(blobUrl);
        resolve(dataUrl);
      } else {
        urlHelper.revokeObjectURL(blobUrl);
        resolve(`data:image/svg+xml;utf8,${encodeURIComponent(SOLARITHM_LOGO_SVG)}`);
      }
    };

    img.onerror = () => {
      urlHelper.revokeObjectURL(blobUrl);
      resolve(`data:image/svg+xml;utf8,${encodeURIComponent(SOLARITHM_LOGO_SVG)}`);
    };

    img.src = blobUrl;
  });
}
