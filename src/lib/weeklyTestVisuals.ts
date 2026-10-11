/**
 * Weekly Test Visual & Diagram Generator Engine
 * Generates instructional, curriculum-aligned, high-resolution vector (SVG) diagrams,
 * charts, fraction models, maps, sequences, and observation graphics for weekly assessments.
 */

import { QuestionVisual, VisualQuestionType, VisualType, VisualLabel } from '../types';

/**
 * Escapes text for safe SVG text embedding
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ---------------------------------------------------------------------------
// 1. SCIENCE DIAGRAM BUILDERS
// ---------------------------------------------------------------------------

/**
 * Water cycle diagram with numbered stages:
 * 1: Evaporation, 2: Condensation, 3: Precipitation, 4: Collection
 */
export function buildWaterCycleSvg(): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const labels: VisualLabel[] = [
    { id: 1, text: 'Stage 1 (Evaporation)', target: 'Evaporation' },
    { id: 2, text: 'Stage 2 (Condensation)', target: 'Condensation' },
    { id: 3, text: 'Stage 3 (Precipitation)', target: 'Precipitation' },
    { id: 4, text: 'Stage 4 (Collection / Runoff)', target: 'Collection' }
  ];
  const key = {
    '1': 'Evaporation (liquid water absorbs heat and turns into water vapor)',
    '2': 'Condensation (water vapor cools and forms clouds)',
    '3': 'Precipitation (water falls as rain, sleet, snow, or hail)',
    '4': 'Collection / Runoff (water collects in rivers, lakes, and oceans)'
  };

  const svg = `<svg viewBox="0 0 540 280" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="60%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,6 L3,0 L6,6 Z" fill="#0284c7" />
    </marker>
    <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L3,6 L6,0 Z" fill="#2563eb" />
    </marker>
    <marker id="arrowRight" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
    </marker>
  </defs>

  <!-- Sky -->
  <rect x="0" y="0" width="540" height="280" fill="url(#skyGrad)" rx="8"/>

  <!-- Mountain / Land -->
  <path d="M 0,280 L 0,180 Q 90,130 180,170 T 360,200 L 360,280 Z" fill="#15803d" opacity="0.85"/>
  <path d="M 0,280 L 0,210 Q 70,165 140,200 T 280,240 L 280,280 Z" fill="#166534" opacity="0.95"/>
  <path d="M 50,150 L 110,80 L 160,155 Z" fill="#64748b"/>
  <polygon points="110,80 92,106 102,112 110,102 118,110 128,104" fill="#f8fafc"/>

  <!-- Sea / Ocean / Collection -->
  <rect x="330" y="215" width="210" height="65" fill="url(#seaGrad)" rx="2"/>
  <path d="M 330,220 Q 380,212 435,220 T 540,218 L 540,280 L 330,280 Z" fill="#0284c7" opacity="0.6"/>

  <!-- Sun -->
  <circle cx="475" cy="55" r="28" fill="#facc15" stroke="#eab308" stroke-width="3"/>
  <g stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round">
    <line x1="475" y1="18" x2="475" y2="8"/>
    <line x1="475" y1="92" x2="475" y2="102"/>
    <line x1="438" y1="55" x2="428" y2="55"/>
    <line x1="512" y1="55" x2="522" y2="55"/>
    <line x1="449" y1="29" x2="442" y2="22"/>
    <line x1="501" y1="81" x2="508" y2="88"/>
    <line x1="449" y1="81" x2="442" y2="88"/>
    <line x1="501" y1="29" x2="508" y2="22"/>
  </g>

  <!-- Clouds (Condensation) -->
  <g fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5">
    <!-- Cloud 1 -->
    <path d="M 230,70 Q 230,45 255,45 Q 275,30 300,50 Q 325,40 335,65 Q 345,90 320,95 L 245,95 Q 230,95 230,70 Z" fill="#e2e8f0"/>
    <!-- Cloud 2 over mountain (Darker Rain Cloud) -->
    <path d="M 80,65 Q 80,45 100,45 Q 115,30 135,45 Q 155,38 165,60 Q 175,80 155,85 L 95,85 Q 80,85 80,65 Z" fill="#94a3b8"/>
  </g>

  <!-- Stage 1: Evaporation wavy arrows rising from sea -->
  <g stroke="#0284c7" stroke-width="2.5" fill="none">
    <path d="M 400,210 Q 395,175 405,150 T 400,115" marker-end="url(#arrowUp)"/>
    <path d="M 440,210 Q 435,175 445,150 T 440,120" marker-end="url(#arrowUp)"/>
  </g>

  <!-- Stage 2: Wind carrying cloud toward land -->
  <path d="M 230,68 L 180,68" stroke="#475569" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowRight)"/>

  <!-- Stage 3: Precipitation (Rain drops) falling on mountain -->
  <g stroke="#2563eb" stroke-width="2" stroke-linecap="round">
    <line x1="95" y1="95" x2="85" y2="120"/>
    <line x1="115" y1="95" x2="105" y2="120"/>
    <line x1="135" y1="95" x2="125" y2="120"/>
    <line x1="155" y1="95" x2="145" y2="120"/>
    <line x1="105" y1="125" x2="95" y2="150"/>
    <line x1="125" y1="125" x2="115" y2="150"/>
    <line x1="145" y1="125" x2="135" y2="150"/>
  </g>

  <!-- Stage 4: River runoff into ocean -->
  <path d="M 120,200 Q 200,210 260,240 T 340,245" stroke="#38bdf8" stroke-width="6" fill="none" stroke-linecap="round"/>

  <!-- Numbered Badges [1], [2], [3], [4] -->
  <!-- Badge 1: Evaporation -->
  <g transform="translate(445, 155)">
    <circle cx="0" cy="0" r="16" fill="#1e3a8a" stroke="#ffffff" stroke-width="2.5" />
    <text x="0" y="5" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">1</text>
  </g>

  <!-- Badge 2: Condensation -->
  <g transform="translate(285, 68)">
    <circle cx="0" cy="0" r="16" fill="#1e3a8a" stroke="#ffffff" stroke-width="2.5" />
    <text x="0" y="5" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">2</text>
  </g>

  <!-- Badge 3: Precipitation -->
  <g transform="translate(60, 115)">
    <circle cx="0" cy="0" r="16" fill="#1e3a8a" stroke="#ffffff" stroke-width="2.5" />
    <text x="0" y="5" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">3</text>
  </g>

  <!-- Badge 4: Collection -->
  <g transform="translate(390, 250)">
    <circle cx="0" cy="0" r="16" fill="#1e3a8a" stroke="#ffffff" stroke-width="2.5" />
    <text x="0" y="5" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">4</text>
  </g>

  <!-- Diagram Title Banner -->
  <rect x="10" y="10" width="165" height="24" rx="4" fill="#0f172a" opacity="0.85"/>
  <text x="18" y="26" font-size="11" font-weight="700" fill="#ffffff">THE WATER CYCLE</text>
</svg>`;

  return { svg, labels, key };
}

/**
 * Plant / Flower Anatomy diagram with numbered parts:
 * 1: Flower / Petal, 2: Leaf, 3: Stem, 4: Roots
 */
export function buildPlantAnatomySvg(): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const labels: VisualLabel[] = [
    { id: 1, text: 'Part 1 (Flower)', target: 'Flower' },
    { id: 2, text: 'Part 2 (Leaf)', target: 'Leaf' },
    { id: 3, text: 'Part 3 (Stem)', target: 'Stem' },
    { id: 4, text: 'Part 4 (Roots)', target: 'Roots' }
  ];
  const key = {
    '1': 'Flower (produces seeds for reproduction)',
    '2': 'Leaf (makes food through photosynthesis)',
    '3': 'Stem (transports water and supports the plant)',
    '4': 'Roots (absorb water and minerals from soil and anchor the plant)'
  };

  const svg = `<svg viewBox="0 0 460 300" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Soil Line & Ground -->
  <rect x="0" y="210" width="460" height="90" fill="#78350f" opacity="0.15" />
  <line x1="0" y1="210" x2="460" y2="210" stroke="#92400e" stroke-width="2.5" stroke-dasharray="6,4" />
  <text x="20" y="235" font-size="11" font-weight="700" fill="#78350f">SOIL LEVEL</text>

  <!-- Stem [Part 3] -->
  <path d="M 215,210 Q 220,130 220,70" stroke="#15803d" stroke-width="8" stroke-linecap="round" fill="none" />

  <!-- Roots [Part 4] -->
  <g stroke="#92400e" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M 215,210 Q 200,240 180,270" />
    <path d="M 215,210 Q 220,245 220,285" />
    <path d="M 215,210 Q 235,240 255,270" />
    <path d="M 195,235 Q 170,250 155,260" stroke-width="2"/>
    <path d="M 230,235 Q 260,250 280,260" stroke-width="2"/>
  </g>

  <!-- Leaves [Part 2] -->
  <!-- Left Leaf -->
  <path d="M 218,150 C 170,140 140,165 145,180 C 175,185 205,165 218,155 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
  <path d="M 218,150 Q 180,160 155,175" stroke="#15803d" stroke-width="1.5" fill="none"/>
  <!-- Right Leaf -->
  <path d="M 220,120 C 270,110 300,135 295,150 C 265,155 235,135 220,125 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
  <path d="M 220,120 Q 260,130 285,145" stroke="#15803d" stroke-width="1.5" fill="none"/>

  <!-- Flower [Part 1] -->
  <g transform="translate(220, 65)">
    <!-- Petals -->
    <ellipse cx="0" cy="-22" rx="14" ry="18" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
    <ellipse cx="22" cy="0" rx="18" ry="14" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
    <ellipse cx="0" cy="22" rx="14" ry="18" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
    <ellipse cx="-22" cy="0" rx="18" ry="14" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
    <ellipse cx="16" cy="-16" rx="15" ry="15" fill="#fb7185" stroke="#e11d48" stroke-width="1.5"/>
    <ellipse cx="-16" cy="-16" rx="15" ry="15" fill="#fb7185" stroke="#e11d48" stroke-width="1.5"/>
    <ellipse cx="16" cy="16" rx="15" ry="15" fill="#fb7185" stroke="#e11d48" stroke-width="1.5"/>
    <ellipse cx="-16" cy="16" rx="15" ry="15" fill="#fb7185" stroke="#e11d48" stroke-width="1.5"/>
    <!-- Flower Center -->
    <circle cx="0" cy="0" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  </g>

  <!-- Callout line & Badge 1: Flower -->
  <line x1="250" y1="50" x2="350" y2="40" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3,2"/>
  <g transform="translate(370, 40)">
    <circle cx="0" cy="0" r="15" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
    <text x="0" y="5" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">1</text>
  </g>

  <!-- Callout line & Badge 2: Leaf -->
  <line x1="140" y1="170" x2="70" y2="160" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3,2"/>
  <g transform="translate(50, 160)">
    <circle cx="0" cy="0" r="15" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
    <text x="0" y="5" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">2</text>
  </g>

  <!-- Callout line & Badge 3: Stem -->
  <line x1="225" y1="140" x2="350" y2="140" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3,2"/>
  <g transform="translate(370, 140)">
    <circle cx="0" cy="0" r="15" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
    <text x="0" y="5" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">3</text>
  </g>

  <!-- Callout line & Badge 4: Roots -->
  <line x1="240" y1="250" x2="350" y2="250" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3,2"/>
  <g transform="translate(370, 250)">
    <circle cx="0" cy="0" r="15" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
    <text x="0" y="5" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">4</text>
  </g>

  <!-- Title -->
  <rect x="15" y="15" width="170" height="24" rx="4" fill="#065f46"/>
  <text x="24" y="31" font-size="11" font-weight="700" fill="#ffffff">PARTS OF A PLANT</text>
</svg>`;

  return { svg, labels, key };
}

/**
 * Electric Circuit Diagram:
 * 1: Battery / Cell, 2: Switch, 3: Connecting Wire, 4: Light Bulb
 */
export function buildCircuitSvg(isClosed: boolean = true): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const labels: VisualLabel[] = [
    { id: 1, text: 'Component 1 (Battery / Cell)', target: 'Battery' },
    { id: 2, text: 'Component 2 (Switch)', target: 'Switch' },
    { id: 3, text: 'Component 3 (Connecting Wire)', target: 'Wire' },
    { id: 4, text: 'Component 4 (Light Bulb)', target: 'Light Bulb' }
  ];
  const key = {
    '1': 'Battery / Cell (provides the electrical energy/voltage)',
    '2': `Switch (${isClosed ? 'Closed: completes circuit allowing current to flow' : 'Open: breaks circuit stopping current'})`,
    '3': 'Connecting Wire (conducts electrical current made of copper/metal)',
    '4': `Light Bulb (${isClosed ? 'Converts electrical energy to light and heat' : 'Does not light up when circuit is open'})`
  };

  const svg = `<svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Circuit Wires [Component 3] -->
  <path d="M 120,60 L 380,60 L 380,200 L 120,200 Z" fill="none" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" />

  <!-- Battery / Cell [Component 1] on top wire -->
  <rect x="210" y="44" width="70" height="32" rx="4" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
  <rect x="210" y="44" width="22" height="32" rx="2" fill="#ef4444"/>
  <rect x="280" y="54" width="6" height="12" rx="1" fill="#94a3b8"/>
  <text x="218" y="65" font-size="14" font-weight="900" fill="#ffffff">+</text>
  <text x="260" y="65" font-size="14" font-weight="900" fill="#0f172a">-</text>

  <!-- Switch [Component 2] on left wire -->
  <circle cx="120" cy="110" r="5" fill="#0f172a"/>
  <circle cx="120" cy="150" r="5" fill="#0f172a"/>
  ${isClosed
    ? `<line x1="120" y1="110" x2="120" y2="150" stroke="#0f172a" stroke-width="4"/>`
    : `<line x1="120" y1="150" x2="100" y2="115" stroke="#ef4444" stroke-width="4"/>`
  }

  <!-- Light Bulb [Component 4] on bottom wire -->
  <g transform="translate(250, 200)">
    ${isClosed ? `
      <!-- Glow rays -->
      <circle cx="0" cy="0" r="28" fill="#fef08a" opacity="0.6"/>
      <circle cx="0" cy="0" r="18" fill="#fef9c3" opacity="0.9"/>
    ` : ''}
    <circle cx="0" cy="0" r="14" fill="${isClosed ? '#facc15' : '#e2e8f0'}" stroke="#0f172a" stroke-width="2"/>
    <!-- Filament -->
    <path d="M -6,6 Q 0,-8 6,6" stroke="#ca8a04" stroke-width="2" fill="none"/>
  </g>

  <!-- Badges [1], [2], [3], [4] -->
  <!-- Badge 1: Battery -->
  <g transform="translate(245, 25)">
    <circle cx="0" cy="0" r="14" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
    <text x="0" y="5" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">1</text>
  </g>

  <!-- Badge 2: Switch -->
  <g transform="translate(70, 130)">
    <circle cx="0" cy="0" r="14" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
    <text x="0" y="5" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">2</text>
  </g>

  <!-- Badge 3: Wire -->
  <g transform="translate(420, 130)">
    <circle cx="0" cy="0" r="14" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
    <text x="0" y="5" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">3</text>
  </g>

  <!-- Badge 4: Light Bulb -->
  <g transform="translate(250, 242)">
    <circle cx="0" cy="0" r="14" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
    <text x="0" y="5" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">4</text>
  </g>

  <!-- Status indicator -->
  <rect x="15" y="15" width="195" height="24" rx="4" fill="#1e293b"/>
  <text x="24" y="31" font-size="11" font-weight="700" fill="#ffffff">SIMPLE ELECTRICAL CIRCUIT</text>
</svg>`;

  return { svg, labels, key };
}

/**
 * States of Matter comparison: Solid, Liquid, Gas
 */
export function buildStatesOfMatterSvg(): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const labels: VisualLabel[] = [
    { id: 'A', text: 'State A (Solid)' },
    { id: 'B', text: 'State B (Liquid)' },
    { id: 'C', text: 'State C (Gas)' }
  ];
  const key = {
    'A': 'Solid (particles packed closely in a fixed pattern, vibrating in place)',
    'B': 'Liquid (particles close together but free to slide past one another)',
    'C': 'Gas (particles far apart, moving rapidly and freely in all directions)'
  };

  const svg = `<svg viewBox="0 0 540 210" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Solid Container A -->
  <g transform="translate(40, 30)">
    <rect x="0" y="0" width="130" height="130" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
    <!-- 16 Tightly packed particles in a grid -->
    <g fill="#2563eb" stroke="#1d4ed8" stroke-width="1">
      <circle cx="35" cy="50" r="11"/><circle cx="60" cy="50" r="11"/><circle cx="85" cy="50" r="11"/><circle cx="110" cy="50" r="11"/>
      <circle cx="35" cy="74" r="11"/><circle cx="60" cy="74" r="11"/><circle cx="85" cy="74" r="11"/><circle cx="110" cy="74" r="11"/>
      <circle cx="35" cy="98" r="11"/><circle cx="60" cy="98" r="11"/><circle cx="85" cy="98" r="11"/><circle cx="110" cy="98" r="11"/>
      <circle cx="35" cy="122" r="11"/><circle cx="60" cy="122" r="11"/><circle cx="85" cy="122" r="11"/><circle cx="110" cy="122" r="11"/>
    </g>
    <rect x="35" y="142" width="60" height="24" rx="4" fill="#1e3a8a"/>
    <text x="65" y="158" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">STATE A</text>
  </g>

  <!-- Liquid Container B -->
  <g transform="translate(205, 30)">
    <rect x="0" y="0" width="130" height="130" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
    <!-- Fluid particles at the bottom loosely touching -->
    <g fill="#0284c7" stroke="#0369a1" stroke-width="1">
      <circle cx="30" cy="85" r="11"/><circle cx="55" cy="95" r="11"/><circle cx="80" cy="88" r="11"/><circle cx="108" cy="92" r="11"/>
      <circle cx="42" cy="115" r="11"/><circle cx="68" cy="118" r="11"/><circle cx="95" cy="114" r="11"/><circle cx="22" cy="116" r="11"/>
      <circle cx="45" cy="68" r="11"/><circle cx="90" cy="65" r="11"/>
    </g>
    <rect x="35" y="142" width="60" height="24" rx="4" fill="#1e3a8a"/>
    <text x="65" y="158" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">STATE B</text>
  </g>

  <!-- Gas Container C -->
  <g transform="translate(370, 30)">
    <rect x="0" y="0" width="130" height="130" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
    <!-- Dispersed particles with motion vectors -->
    <g fill="#ef4444" stroke="#b91c1c" stroke-width="1">
      <circle cx="25" cy="30" r="11"/>
      <circle cx="100" cy="45" r="11"/>
      <circle cx="45" cy="95" r="11"/>
      <circle cx="95" cy="110" r="11"/>
      <circle cx="65" cy="60" r="11"/>
    </g>
    <!-- Motion lines -->
    <g stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round">
      <line x1="25" y1="43" x2="32" y2="55"/>
      <line x1="88" y1="45" x2="75" y2="40"/>
      <line x1="45" y1="82" x2="52" y2="70"/>
      <line x1="95" y1="98" x2="105" y2="85"/>
    </g>
    <rect x="35" y="142" width="60" height="24" rx="4" fill="#1e3a8a"/>
    <text x="65" y="158" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">STATE C</text>
  </g>
</svg>`;

  return { svg, labels, key };
}

/**
 * Food Chain Diagram:
 * Sun -> Producer (Grass) -> Primary Consumer (Grasshopper) -> Secondary Consumer (Frog) -> Apex (Hawk)
 */
export function buildFoodChainSvg(): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const labels: VisualLabel[] = [
    { id: 1, text: 'Stage 1: Sun (Energy Source)' },
    { id: 2, text: 'Stage 2: Producer (Plant / Grass)' },
    { id: 3, text: 'Stage 3: Herbivore / Primary Consumer (Grasshopper)' },
    { id: 4, text: 'Stage 4: Secondary Consumer / Carnivore (Bird / Hawk)' }
  ];
  const key = {
    '1': 'Energy Source (Sunlight drives plant photosynthesis)',
    '2': 'Producer (Green plant that manufactures its own food)',
    '3': 'Primary Consumer / Herbivore (Feeds directly on plants)',
    '4': 'Secondary Consumer / Predator (Feeds on herbivores/animals)'
  };

  const svg = `<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <defs>
    <marker id="fcArrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#047857" />
    </marker>
  </defs>

  <!-- Box 1: Sun -->
  <g transform="translate(15, 35)">
    <rect x="0" y="0" width="105" height="110" rx="8" fill="#fef9c3" stroke="#facc15" stroke-width="2"/>
    <circle cx="52" cy="45" r="22" fill="#f59e0b"/>
    <text x="52" y="85" font-size="11" font-weight="800" fill="#78350f" text-anchor="middle">SUN</text>
    <text x="52" y="100" font-size="9" fill="#92400e" text-anchor="middle">Energy Source</text>
    <!-- Badge -->
    <circle cx="15" cy="15" r="11" fill="#1e3a8a"/>
    <text x="15" y="19" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">1</text>
  </g>

  <!-- Arrow 1 -> 2 -->
  <line x1="125" y1="90" x2="145" y2="90" stroke="#047857" stroke-width="3" marker-end="url(#fcArrow)"/>

  <!-- Box 2: Producer (Grass) -->
  <g transform="translate(150, 35)">
    <rect x="0" y="0" width="105" height="110" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
    <!-- Grass blades -->
    <path d="M 35,65 Q 40,30 30,20 Q 45,35 48,65" fill="#16a34a"/>
    <path d="M 50,65 Q 55,25 60,15 Q 65,30 62,65" fill="#15803d"/>
    <path d="M 65,65 Q 75,30 85,25 Q 75,40 73,65" fill="#16a34a"/>
    <text x="52" y="85" font-size="11" font-weight="800" fill="#166534" text-anchor="middle">PRODUCER</text>
    <text x="52" y="100" font-size="9" fill="#15803d" text-anchor="middle">(Green Plants)</text>
    <!-- Badge -->
    <circle cx="15" cy="15" r="11" fill="#1e3a8a"/>
    <text x="15" y="19" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">2</text>
  </g>

  <!-- Arrow 2 -> 3 -->
  <line x1="260" y1="90" x2="280" y2="90" stroke="#047857" stroke-width="3" marker-end="url(#fcArrow)"/>

  <!-- Box 3: Primary Consumer -->
  <g transform="translate(285, 35)">
    <rect x="0" y="0" width="110" height="110" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
    <ellipse cx="55" cy="45" rx="22" ry="14" fill="#93c5fd" stroke="#2563eb" stroke-width="1.5"/>
    <text x="55" y="85" font-size="11" font-weight="800" fill="#1e40af" text-anchor="middle">PRIMARY</text>
    <text x="55" y="100" font-size="9" fill="#1d4ed8" text-anchor="middle">Herbivore</text>
    <!-- Badge -->
    <circle cx="15" cy="15" r="11" fill="#1e3a8a"/>
    <text x="15" y="19" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">3</text>
  </g>

  <!-- Arrow 3 -> 4 -->
  <line x1="400" y1="90" x2="415" y2="90" stroke="#047857" stroke-width="3" marker-end="url(#fcArrow)"/>

  <!-- Box 4: Secondary Consumer / Predator -->
  <g transform="translate(420, 35)">
    <rect x="0" y="0" width="105" height="110" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="2"/>
    <polygon points="52,25 72,55 32,55" fill="#f43f5e"/>
    <text x="52" y="85" font-size="11" font-weight="800" fill="#9d174d" text-anchor="middle">PREDATOR</text>
    <text x="52" y="100" font-size="9" fill="#be185d" text-anchor="middle">Carnivore</text>
    <!-- Badge -->
    <circle cx="15" cy="15" r="11" fill="#1e3a8a"/>
    <text x="15" y="19" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">4</text>
  </g>

  <!-- Title -->
  <text x="270" y="20" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">FLOW OF ENERGY IN A FOOD CHAIN</text>
</svg>`;

  return { svg, labels, key };
}

// ---------------------------------------------------------------------------
// 2. MATHEMATICS DIAGRAM BUILDERS
// ---------------------------------------------------------------------------

/**
 * Rectangular Fraction Bar (e.g. 8 equal parts with 3 or 5 shaded)
 */
export function buildFractionBarSvg(
  totalParts: number = 8,
  shadedParts: number = 3
): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const width = 440;
  const height = 90;
  const partWidth = width / totalParts;

  const rects = Array.from({ length: totalParts }).map((_, i) => {
    const isShaded = i < shadedParts;
    const x = 30 + i * partWidth;
    return `
      <rect x="${x}" y="35" width="${partWidth}" height="${height}" 
            fill="${isShaded ? '#3b82f6' : '#ffffff'}" 
            stroke="#1e3a8a" stroke-width="2.5" />
      <text x="${x + partWidth / 2}" y="88" font-size="14" font-weight="700" 
            fill="${isShaded ? '#ffffff' : '#94a3b8'}" text-anchor="middle">${i + 1}</text>
    `;
  }).join('');

  const fractionStr = `${shadedParts}/${totalParts}`;
  const labels: VisualLabel[] = [
    { id: fractionStr, text: `Fraction: ${fractionStr}` }
  ];
  const key = {
    'shaded': `${shadedParts} out of ${totalParts} parts shaded = ${fractionStr}`,
    'unshaded': `${totalParts - shadedParts} out of ${totalParts} parts unshaded = ${totalParts - shadedParts}/${totalParts}`
  };

  const svg = `<svg viewBox="0 0 500 170" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <text x="250" y="24" font-size="12" font-weight="700" fill="#0f172a" text-anchor="middle">FRACTION MODEL (${totalParts} EQUAL PARTS)</text>
  ${rects}
  <text x="30" y="150" font-size="11" font-weight="600" fill="#475569">Total Equal Parts: ${totalParts} &nbsp;|&nbsp; Shaded Parts: ${shadedParts}</text>
</svg>`;

  return { svg, labels, key };
}

/**
 * Geometric Shape with dimensions (Right Triangle, Rectangle with perimeter/area, etc.)
 */
export function buildGeometryShapeSvg(
  shape: 'right_triangle' | 'rectangle' | 'angles',
  dimensions?: { a?: number; b?: number; c?: number; unit?: string }
): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const unit = dimensions?.unit || 'cm';
  if (shape === 'right_triangle') {
    const a = dimensions?.a || 6;
    const b = dimensions?.b || 8;
    const c = dimensions?.c || 10;
    const key = {
      'area': `Area = (base × height) ÷ 2 = (${b} × ${a}) ÷ 2 = ${(b * a) / 2} ${unit}²`,
      'perimeter': `Perimeter = ${a} + ${b} + ${c} = ${a + b + c} ${unit}`,
      'right_angle': 'Right Angle (90 degrees marked at the vertex)'
    };
    const labels = [
      { id: 'sideA', text: `Height: ${a} ${unit}` },
      { id: 'sideB', text: `Base: ${b} ${unit}` },
      { id: 'sideC', text: `Hypotenuse: ${c} ${unit}` }
    ];

    const svg = `<svg viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Triangle -->
  <polygon points="100,40 100,180 320,180" fill="#e0f2fe" stroke="#0284c7" stroke-width="3" stroke-linejoin="round"/>
  <!-- Right Angle Square -->
  <polyline points="100,162 118,162 118,180" fill="none" stroke="#0369a1" stroke-width="2"/>
  
  <!-- Labels -->
  <!-- Height (Vertical) -->
  <text x="80" y="115" font-size="14" font-weight="700" fill="#0f172a" text-anchor="end">${a} ${unit}</text>
  <!-- Base (Horizontal) -->
  <text x="210" y="202" font-size="14" font-weight="700" fill="#0f172a" text-anchor="middle">${b} ${unit}</text>
  <!-- Hypotenuse -->
  <text x="225" y="100" font-size="14" font-weight="700" fill="#0f172a">${c} ${unit}</text>

  <!-- Title -->
  <rect x="15" y="12" width="165" height="22" rx="4" fill="#0369a1"/>
  <text x="23" y="27" font-size="11" font-weight="700" fill="#ffffff">RIGHT-ANGLED TRIANGLE</text>
</svg>`;
    return { svg, labels, key };
  }

  // Default Rectangle
  const w = dimensions?.b || 9;
  const h = dimensions?.a || 5;
  const key = {
    'area': `Area = length × width = ${w} × ${h} = ${w * h} ${unit}²`,
    'perimeter': `Perimeter = 2 × (length + width) = 2 × (${w} + ${h}) = ${2 * (w + h)} ${unit}`
  };
  const labels = [
    { id: 'length', text: `Length = ${w} ${unit}` },
    { id: 'width', text: `Width = ${h} ${unit}` }
  ];

  const svg = `<svg viewBox="0 0 440 220" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <rect x="80" y="45" width="280" height="130" fill="#f0fdf4" stroke="#16a34a" stroke-width="3" rx="4"/>
  <!-- Dimensions -->
  <text x="220" y="35" font-size="14" font-weight="800" fill="#166534" text-anchor="middle">Length = ${w} ${unit}</text>
  <text x="65" y="115" font-size="14" font-weight="800" fill="#166534" text-anchor="end">Width = ${h} ${unit}</text>
  <!-- Area watermark inside -->
  <text x="220" y="118" font-size="12" font-weight="600" fill="#86efac" text-anchor="middle">Shape: Rectangle</text>
</svg>`;

  return { svg, labels, key };
}

/**
 * Analog Clock Face showing specified hour and minute (e.g. 3:15, 8:30, 10:45)
 */
export function buildAnalogClockSvg(
  hour: number = 3,
  minute: number = 15
): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const minuteAngle = minute * 6; // 360 / 60
  const hourAngle = (hour % 12) * 30 + minute * 0.5;

  const timeStr = `${hour}:${minute < 10 ? '0' + minute : minute}`;
  const key = {
    'time': `The clock shows ${timeStr}`,
    'hourHand': `Hour hand points to ${hour}`,
    'minuteHand': `Minute hand points to ${minute / 5} (${minute} minutes)`
  };
  const labels = [{ id: 'clockTime', text: `Time: ${timeStr}` }];

  const hourNumbers = [
    { n: 12, x: 150, y: 52 },
    { n: 1, x: 200, y: 65 },
    { n: 2, x: 235, y: 102 },
    { n: 3, x: 248, y: 155 },
    { n: 4, x: 235, y: 205 },
    { n: 5, x: 200, y: 242 },
    { n: 6, x: 150, y: 258 },
    { n: 7, x: 100, y: 242 },
    { n: 8, x: 65, y: 205 },
    { n: 9, x: 52, y: 155 },
    { n: 10, x: 65, y: 102 },
    { n: 11, x: 100, y: 65 }
  ];

  const numbersSvg = hourNumbers.map(
    item => `<text x="${item.x}" y="${item.y}" font-size="14" font-weight="700" fill="#0f172a" text-anchor="middle">${item.n}</text>`
  ).join('');

  const svg = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style="max-width: 240px; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Clock Outer Ring -->
  <circle cx="150" cy="150" r="135" fill="#f8fafc" stroke="#1e293b" stroke-width="8"/>
  <circle cx="150" cy="150" r="126" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Tick Marks -->
  ${Array.from({ length: 12 }).map((_, i) => {
    const angle = i * 30 * (Math.PI / 180);
    const x1 = 150 + Math.sin(angle) * 115;
    const y1 = 150 - Math.cos(angle) * 115;
    const x2 = 150 + Math.sin(angle) * 124;
    const y2 = 150 - Math.cos(angle) * 124;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0f172a" stroke-width="${i % 3 === 0 ? '3' : '1.5'}"/>`;
  }).join('')}

  <!-- Numbers -->
  ${numbersSvg}

  <!-- Hour Hand -->
  <line x1="150" y1="150" x2="${150 + Math.sin(hourAngle * (Math.PI / 180)) * 55}" y2="${150 - Math.cos(hourAngle * (Math.PI / 180)) * 55}" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>

  <!-- Minute Hand -->
  <line x1="150" y1="150" x2="${150 + Math.sin(minuteAngle * (Math.PI / 180)) * 85}" y2="${150 - Math.cos(minuteAngle * (Math.PI / 180)) * 85}" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round"/>

  <!-- Center Pin -->
  <circle cx="150" cy="150" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
</svg>`;

  return { svg, labels, key };
}

/**
 * Bar Chart Diagram for Data Handling questions
 */
export function buildBarChartSvg(
  title: string = 'FAVORITE BELIZEAN FRUITS',
  categories: { label: string; value: number }[] = [
    { label: 'Mango', value: 14 },
    { label: 'Papaya', value: 8 },
    { label: 'Banana', value: 18 },
    { label: 'Orange', value: 12 }
  ]
): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const maxValue = 20;
  const chartHeight = 140;
  const startX = 80;
  const barWidth = 45;
  const gap = 35;

  const key: Record<string, string> = {
    'highest': `${categories.reduce((a, b) => a.value > b.value ? a : b).label}`,
    'lowest': `${categories.reduce((a, b) => a.value < b.value ? a : b).label}`,
    'total': `${categories.reduce((sum, c) => sum + c.value, 0)} total students surveyed`
  };

  const labels = categories.map(c => ({ id: c.label, text: `${c.label}: ${c.value}` }));

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const barsSvg = categories.map((cat, i) => {
    const x = startX + i * (barWidth + gap);
    const barH = (cat.value / maxValue) * chartHeight;
    const y = 180 - barH;
    const color = colors[i % colors.length];

    return `
      <!-- Bar -->
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${color}" rx="3"/>
      <!-- Value on top -->
      <text x="${x + barWidth / 2}" y="${y - 6}" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">${cat.value}</text>
      <!-- Label below x-axis -->
      <text x="${x + barWidth / 2}" y="198" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">${escapeXml(cat.label)}</text>
    `;
  }).join('');

  const svg = `<svg viewBox="0 0 460 230" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <text x="230" y="24" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">${escapeXml(title)}</text>

  <!-- Y-Axis Grid Lines & Numbers -->
  <line x1="60" y1="180" x2="420" y2="180" stroke="#0f172a" stroke-width="2"/>
  <line x1="60" y1="40" x2="60" y2="180" stroke="#0f172a" stroke-width="2"/>

  <!-- Y-Grid 5, 10, 15, 20 -->
  <g stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3">
    <line x1="60" y1="145" x2="420" y2="145"/><text x="50" y="149" font-size="10" fill="#64748b" text-anchor="end">5</text>
    <line x1="60" y1="110" x2="420" y2="110"/><text x="50" y="114" font-size="10" fill="#64748b" text-anchor="end">10</text>
    <line x1="60" y1="75" x2="420" y2="75"/><text x="50" y="79" font-size="10" fill="#64748b" text-anchor="end">15</text>
    <line x1="60" y1="40" x2="420" y2="40"/><text x="50" y="44" font-size="10" fill="#64748b" text-anchor="end">20</text>
  </g>

  <!-- Bars -->
  ${barsSvg}

  <text x="20" y="110" font-size="10" font-weight="700" fill="#64748b" transform="rotate(-90 20 110)" text-anchor="middle">Number of Students</text>
</svg>`;

  return { svg, labels, key };
}

// ---------------------------------------------------------------------------
// 3. SOCIAL STUDIES & BELIZEAN STUDIES DIAGRAM BUILDERS
// ---------------------------------------------------------------------------

/**
 * Compass Rose with 8 cardinal & ordinal directions (N, NE, E, SE, S, SW, W, NW)
 * Target direction can be marked with a [?] badge for assessment.
 */
export function buildCompassRoseSvg(
  targetLabel: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' = 'E'
): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const directions = [
    { dir: 'N', angle: 0, text: 'North' },
    { dir: 'NE', angle: 45, text: 'North-East' },
    { dir: 'E', angle: 90, text: 'East' },
    { dir: 'SE', angle: 135, text: 'South-East' },
    { dir: 'S', angle: 180, text: 'South' },
    { dir: 'SW', angle: 225, text: 'South-West' },
    { dir: 'W', angle: 270, text: 'West' },
    { dir: 'NW', angle: 315, text: 'North-West' }
  ];

  const targetObj = directions.find(d => d.dir === targetLabel) || directions[2];
  const key = {
    'target': `Direction marked [?] is ${targetObj.text} (${targetObj.dir})`,
    'cardinal': 'Cardinal directions: North, South, East, West',
    'ordinal': 'Ordinal / Intermediate directions: North-East, South-East, South-West, North-West'
  };
  const labels = [{ id: '?', text: `Target Direction: ${targetObj.text}` }];

  const svg = `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" style="max-width: 260px; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Outer Ring -->
  <circle cx="160" cy="160" r="140" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="160" cy="160" r="120" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- Compass Star Points -->
  <g transform="translate(160, 160)">
    <!-- Intermediate Points (NE, SE, SW, NW) -->
    <g fill="#94a3b8" stroke="#64748b" stroke-width="1">
      <polygon points="0,0 12,-12 70,-70 0,0"/>
      <polygon points="0,0 12,12 70,70 0,0"/>
      <polygon points="0,0 -12,12 -70,70 0,0"/>
      <polygon points="0,0 -12,-12 -70,-70 0,0"/>
    </g>

    <!-- Cardinal Points (N, E, S, W) -->
    <!-- North Point (Red/Navy) -->
    <polygon points="0,0 -18,-20 0,-115 0,0" fill="#ef4444"/>
    <polygon points="0,0 18,-20 0,-115 0,0" fill="#b91c1c"/>

    <!-- South Point -->
    <polygon points="0,0 -18,20 0,115 0,0" fill="#1e3a8a"/>
    <polygon points="0,0 18,20 0,115 0,0" fill="#172554"/>

    <!-- East Point -->
    <polygon points="0,0 20,-18 115,0 0,0" fill="#1e3a8a"/>
    <polygon points="0,0 20,18 115,0 0,0" fill="#172554"/>

    <!-- West Point -->
    <polygon points="0,0 -20,-18 -115,0 0,0" fill="#1e3a8a"/>
    <polygon points="0,0 -20,18 -115,0 0,0" fill="#172554"/>

    <!-- Center Ring -->
    <circle cx="0" cy="0" r="16" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
  </g>

  <!-- Direction Labels -->
  <!-- N -->
  <text x="160" y="32" font-size="18" font-weight="900" fill="#b91c1c" text-anchor="middle">${targetLabel === 'N' ? '?' : 'N'}</text>
  <!-- S -->
  <text x="160" y="302" font-size="18" font-weight="900" fill="#1e3a8a" text-anchor="middle">${targetLabel === 'S' ? '?' : 'S'}</text>
  <!-- E -->
  <text x="295" y="166" font-size="18" font-weight="900" fill="#1e3a8a" text-anchor="middle">${targetLabel === 'E' ? '?' : 'E'}</text>
  <!-- W -->
  <text x="25" y="166" font-size="18" font-weight="900" fill="#1e3a8a" text-anchor="middle">${targetLabel === 'W' ? '?' : 'W'}</text>
  <!-- NE -->
  <text x="245" y="75" font-size="13" font-weight="700" fill="#64748b" text-anchor="middle">${targetLabel === 'NE' ? '?' : 'NE'}</text>
  <!-- SE -->
  <text x="245" y="255" font-size="13" font-weight="700" fill="#64748b" text-anchor="middle">${targetLabel === 'SE' ? '?' : 'SE'}</text>
  <!-- SW -->
  <text x="75" y="255" font-size="13" font-weight="700" fill="#64748b" text-anchor="middle">${targetLabel === 'SW' ? '?' : 'SW'}</text>
  <!-- NW -->
  <text x="75" y="75" font-size="13" font-weight="700" fill="#64748b" text-anchor="middle">${targetLabel === 'NW' ? '?' : 'NW'}</text>
</svg>`;

  return { svg, labels, key };
}

/**
 * Belize Districts Map layout showing Corozal, Orange Walk, Belize, Cayo, Stann Creek, Toledo
 */
export function buildBelizeDistrictsMapSvg(
  targetDistrict: string = 'Cayo'
): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const districts = [
    { name: 'Corozal', x: 210, y: 40, w: 80, h: 40, color: '#fef08a' },
    { name: 'Orange Walk', x: 130, y: 70, w: 85, h: 70, color: '#bbf7d0' },
    { name: 'Belize', x: 215, y: 85, w: 85, h: 65, color: '#fed7aa' },
    { name: 'Cayo', x: 110, y: 145, w: 95, h: 80, color: '#bae6fd' },
    { name: 'Stann Creek', x: 210, y: 155, w: 85, h: 65, color: '#fbcfe8' },
    { name: 'Toledo', x: 130, y: 230, w: 125, h: 70, color: '#ddd6fe' }
  ];

  const key: Record<string, string> = {
    'target': `District [?] is ${targetDistrict} District`,
    'sea': 'Caribbean Sea lies to the East of Belize',
    'borders': 'Mexico borders Belize to the North; Guatemala to the West and South'
  };
  const labels = [{ id: '?', text: `Target District: ${targetDistrict}` }];

  const districtsSvg = districts.map(d => {
    const isTarget = d.name.toLowerCase() === targetDistrict.toLowerCase();
    return `
      <g>
        <rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" rx="6" 
              fill="${isTarget ? '#fde047' : d.color}" 
              stroke="${isTarget ? '#b91c1c' : '#475569'}" 
              stroke-width="${isTarget ? '3' : '1.5'}" />
        <text x="${d.x + d.w / 2}" y="${d.y + d.h / 2 + 5}" font-size="${isTarget ? '16' : '11'}" 
              font-weight="800" fill="${isTarget ? '#b91c1c' : '#1e293b'}" text-anchor="middle">
          ${isTarget ? '?' : d.name}
        </text>
      </g>
    `;
  }).join('');

  const svg = `<svg viewBox="0 0 460 320" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Caribbean Sea Area on Right -->
  <rect x="310" y="0" width="150" height="320" fill="#e0f2fe" rx="0"/>
  <text x="385" y="160" font-size="13" font-weight="700" fill="#0284c7" text-anchor="middle" transform="rotate(90 385 160)">CARIBBEAN SEA</text>

  <!-- Barrier Reef / Cayes dots -->
  <g fill="#38bdf8">
    <ellipse cx="335" cy="90" rx="4" ry="12" />
    <ellipse cx="345" cy="140" rx="4" ry="16" />
    <ellipse cx="330" cy="210" rx="3" ry="10" />
  </g>
  <text x="355" y="100" font-size="9" fill="#0369a1">Ambergris Caye</text>
  <text x="360" y="145" font-size="9" fill="#0369a1">Caye Caulker</text>

  <!-- Title & Border Indicators -->
  <text x="20" y="25" font-size="11" font-weight="700" fill="#0f172a">MAP OF BELIZE DISTRICTS</text>
  <text x="30" y="180" font-size="10" font-weight="600" fill="#94a3b8" transform="rotate(-90 30 180)">GUATEMALA (WEST)</text>
  <text x="210" y="20" font-size="10" font-weight="600" fill="#94a3b8">MEXICO (NORTH)</text>

  <!-- Districts -->
  ${districtsSvg}
</svg>`;

  return { svg, labels, key };
}

// ---------------------------------------------------------------------------
// 4. LANGUAGE ARTS DIAGRAM BUILDERS
// ---------------------------------------------------------------------------

/**
 * Story Sequencing: 3-step or 4-step illustrated sequence panels
 */
export function buildStorySequenceSvg(): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const labels: VisualLabel[] = [
    { id: '1', text: 'Step 1: Digging & Planting the Seed' },
    { id: '2', text: 'Step 2: Watering & Sprouting Stem' },
    { id: '3', text: 'Step 3: Blooming Healthy Flower' }
  ];
  const key = {
    '1': 'Step 1: The gardener prepares the soil and plants the seed',
    '2': 'Step 2: Sunlight and water help the seed germinate into a young sprout',
    '3': 'Step 3: The plant matures and produces colorful blooming flowers'
  };

  const svg = `<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Panel A (Step 1) -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="140" height="135" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="0" y="95" width="140" height="40" rx="0" fill="#78350f" opacity="0.2"/>
    <circle cx="70" cy="110" r="6" fill="#92400e"/>
    <path d="M 60,70 L 80,70 L 70,85 Z" fill="#3b82f6"/>
    <text x="70" y="55" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">Step 1: Planting</text>
    <!-- Badge -->
    <circle cx="20" cy="20" r="12" fill="#1e3a8a"/>
    <text x="20" y="24" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">1</text>
  </g>

  <!-- Panel B (Step 2) -->
  <g transform="translate(190, 20)">
    <rect x="0" y="0" width="140" height="135" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="0" y="95" width="140" height="40" rx="0" fill="#78350f" opacity="0.2"/>
    <!-- Young sprout -->
    <path d="M 70,95 L 70,65" stroke="#16a34a" stroke-width="3"/>
    <path d="M 70,65 Q 55,55 58,45 Q 70,55 70,65" fill="#22c55e"/>
    <path d="M 70,65 Q 85,55 82,45 Q 70,55 70,65" fill="#22c55e"/>
    <text x="70" y="35" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">Step 2: Sprouting</text>
    <!-- Badge -->
    <circle cx="20" cy="20" r="12" fill="#1e3a8a"/>
    <text x="20" y="24" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">2</text>
  </g>

  <!-- Panel C (Step 3) -->
  <g transform="translate(360, 20)">
    <rect x="0" y="0" width="140" height="135" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="0" y="95" width="140" height="40" rx="0" fill="#78350f" opacity="0.2"/>
    <!-- Full Plant with flower -->
    <path d="M 70,95 L 70,50" stroke="#16a34a" stroke-width="4"/>
    <circle cx="70" cy="45" r="14" fill="#f43f5e"/>
    <circle cx="70" cy="45" r="6" fill="#facc15"/>
    <text x="70" y="25" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">Step 3: Blooming</text>
    <!-- Badge -->
    <circle cx="20" cy="20" r="12" fill="#1e3a8a"/>
    <text x="20" y="24" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">3</text>
  </g>
</svg>`;

  return { svg, labels, key };
}

/**
 * Venn Diagram for comparison questions (e.g. Living vs Non-Living, Solid vs Liquid, Fiction vs Non-Fiction)
 */
export function buildVennDiagramSvg(
  labelA: string = 'Topic A',
  labelB: string = 'Topic B'
): { svg: string; labels: VisualLabel[]; key: Record<string, string> } {
  const labels: VisualLabel[] = [
    { id: 'A', text: `Only ${labelA}` },
    { id: 'Both', text: `Characteristics Shared by Both` },
    { id: 'B', text: `Only ${labelB}` }
  ];
  const key = {
    'middle': 'Intersection represents characteristics or properties shared by both topics',
    'left': `Left area represents characteristics unique to ${labelA}`,
    'right': `Right area represents characteristics unique to ${labelB}`
  };

  const svg = `<svg viewBox="0 0 500 240" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
  <!-- Circle A -->
  <circle cx="190" cy="125" r="95" fill="#3b82f6" fill-opacity="0.25" stroke="#2563eb" stroke-width="2.5"/>
  <!-- Circle B -->
  <circle cx="310" cy="125" r="95" fill="#10b981" fill-opacity="0.25" stroke="#059669" stroke-width="2.5"/>

  <!-- Titles -->
  <text x="140" y="45" font-size="14" font-weight="800" fill="#1e40af" text-anchor="middle">${escapeXml(labelA)}</text>
  <text x="360" y="45" font-size="14" font-weight="800" fill="#065f46" text-anchor="middle">${escapeXml(labelB)}</text>

  <!-- Section Callouts -->
  <text x="140" y="130" font-size="12" font-weight="700" fill="#1e3a8a" text-anchor="middle">Only ${escapeXml(labelA)}</text>
  <text x="250" y="125" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">BOTH</text>
  <text x="250" y="142" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">(Shared)</text>
  <text x="360" y="130" font-size="12" font-weight="700" fill="#065f46" text-anchor="middle">Only ${escapeXml(labelB)}</text>

  <!-- Numbered Marker in Intersection for Labeling -->
  <circle cx="250" cy="95" r="12" fill="#1e3a8a"/>
  <text x="250" y="99" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">?</text>
</svg>`;

  return { svg, labels, key };
}

// ---------------------------------------------------------------------------
// 5. INTELLIGENT TOPIC-TO-VISUAL MATCHER
// ---------------------------------------------------------------------------

/**
 * Inspects the weekly instructional content and returns the most suitable
 * high-resolution vector visual if applicable.
 */
export function generateInstructionalVisual(params: {
  subject: string;
  topic: string;
  subtopic?: string;
  concepts?: string[];
  outcomes?: string[];
  questionIndex: number;
}): QuestionVisual | null {
  const { subject, topic, subtopic = '', concepts = [], outcomes = [], questionIndex } = params;
  const combined = `${subject} ${topic} ${subtopic} ${concepts.join(' ')} ${outcomes.join(' ')}`.toLowerCase();

  // 1. Water Cycle
  if (
    combined.includes('water cycle') ||
    combined.includes('evaporation') ||
    combined.includes('condensation') ||
    combined.includes('precipitation')
  ) {
    const { svg, labels } = buildWaterCycleSvg();
    return {
      type: 'diagram',
      visualQuestionType: 'label_diagram',
      title: 'Water Cycle Diagram',
      caption: 'Study the stages of the water cycle labeled 1, 2, 3, and 4.',
      altText: 'Water cycle diagram showing evaporation (1), condensation (2), precipitation (3), and collection (4).',
      svgContent: svg,
      labels
    };
  }

  // 2. Plant / Flower Parts
  if (
    combined.includes('plant') ||
    combined.includes('parts of a plant') ||
    combined.includes('flower') ||
    combined.includes('roots') ||
    combined.includes('leaf') ||
    combined.includes('leaves') ||
    combined.includes('stem')
  ) {
    const { svg, labels } = buildPlantAnatomySvg();
    return {
      type: 'diagram',
      visualQuestionType: 'label_diagram',
      title: 'Parts of a Plant',
      caption: 'Examine the plant diagram showing parts labeled 1, 2, 3, and 4.',
      altText: 'Diagram of a plant showing flower (1), leaf (2), stem (3), and roots (4).',
      svgContent: svg,
      labels
    };
  }

  // 3. Electrical Circuits
  if (
    combined.includes('circuit') ||
    combined.includes('electricity') ||
    combined.includes('battery') ||
    combined.includes('switch') ||
    combined.includes('bulb')
  ) {
    const isClosed = !combined.includes('open circuit');
    const { svg, labels } = buildCircuitSvg(isClosed);
    return {
      type: 'diagram',
      visualQuestionType: 'identify',
      title: 'Simple Electrical Circuit',
      caption: `Study the simple electrical circuit with components labeled 1, 2, 3, and 4.`,
      altText: 'Circuit diagram showing battery (1), switch (2), wire (3), and light bulb (4).',
      svgContent: svg,
      labels
    };
  }

  // 4. States of Matter
  if (
    combined.includes('states of matter') ||
    combined.includes('solid') ||
    combined.includes('liquid') ||
    combined.includes('gas') ||
    combined.includes('particle')
  ) {
    const { svg, labels } = buildStatesOfMatterSvg();
    return {
      type: 'comparison',
      visualQuestionType: 'compare',
      title: 'States of Matter Particle Arrangement',
      caption: 'Compare the particle arrangements in containers labeled State A, State B, and State C.',
      altText: 'Particle diagram comparing solid (A), liquid (B), and gas (C).',
      svgContent: svg,
      labels
    };
  }

  // 5. Food Chain / Ecosystem
  if (
    combined.includes('food chain') ||
    combined.includes('food web') ||
    combined.includes('producer') ||
    combined.includes('consumer') ||
    combined.includes('predator') ||
    combined.includes('herbivore')
  ) {
    const { svg, labels } = buildFoodChainSvg();
    return {
      type: 'diagram',
      visualQuestionType: 'sequence',
      title: 'Food Chain Energy Flow',
      caption: 'Study the flow of energy from Sun (1) through the organisms labeled 2, 3, and 4.',
      altText: 'Food chain showing Sun, Producer, Primary Consumer, and Predator.',
      svgContent: svg,
      labels
    };
  }

  // 6. Mathematics: Fractions
  if (
    combined.includes('fraction') ||
    combined.includes('numerator') ||
    combined.includes('denominator') ||
    combined.includes('shaded')
  ) {
    // Alternate between 8 parts (3 shaded) and 6 parts (4 shaded)
    const total = questionIndex % 2 === 0 ? 8 : 6;
    const shaded = questionIndex % 2 === 0 ? 3 : 4;
    const { svg, labels } = buildFractionBarSvg(total, shaded);
    return {
      type: 'fraction_model',
      visualQuestionType: 'visual_mc',
      title: 'Fraction Strip Model',
      caption: `Look at the rectangular model divided into ${total} equal parts.`,
      altText: `Rectangle divided into ${total} equal parts with ${shaded} parts shaded.`,
      svgContent: svg,
      labels
    };
  }

  // 7. Mathematics: Geometry & Perimeter/Area
  if (
    combined.includes('triangle') ||
    combined.includes('right angle') ||
    combined.includes('area') ||
    combined.includes('perimeter') ||
    combined.includes('rectangle')
  ) {
    const shapeType = combined.includes('triangle') ? 'right_triangle' : 'rectangle';
    const { svg, labels } = buildGeometryShapeSvg(shapeType);
    return {
      type: 'shape',
      visualQuestionType: 'observation',
      title: shapeType === 'right_triangle' ? 'Right-Angled Triangle Model' : 'Rectangle Area & Perimeter Model',
      caption: 'Use the dimensions shown on the geometric figure to answer the question.',
      altText: `Geometric shape showing labeled side lengths for calculation.`,
      svgContent: svg,
      labels
    };
  }

  // 8. Mathematics: Time & Clocks
  if (
    combined.includes('clock') ||
    combined.includes('time') ||
    combined.includes('hour') ||
    combined.includes('minute')
  ) {
    const hour = questionIndex % 2 === 0 ? 3 : 8;
    const minute = questionIndex % 2 === 0 ? 15 : 30;
    const { svg, labels } = buildAnalogClockSvg(hour, minute);
    return {
      type: 'clock',
      visualQuestionType: 'identify',
      title: 'Analog Clock Face',
      caption: 'Study the hour and minute hands on the analog clock below.',
      altText: `Analog clock showing the time ${hour}:${minute < 10 ? '0' + minute : minute}.`,
      svgContent: svg,
      labels
    };
  }

  // 9. Mathematics: Data Handling & Bar Charts
  if (
    combined.includes('graph') ||
    combined.includes('chart') ||
    combined.includes('data') ||
    combined.includes('survey')
  ) {
    const { svg, labels } = buildBarChartSvg();
    return {
      type: 'chart',
      visualQuestionType: 'observation',
      title: 'Survey Bar Chart',
      caption: 'Read the data shown on the vertical bar graph.',
      altText: 'Bar chart showing student survey choices on favorite Belizean fruits.',
      svgContent: svg,
      labels
    };
  }

  // 10. Social Studies: Compass Rose & Directions
  if (
    combined.includes('compass') ||
    combined.includes('direction') ||
    combined.includes('cardinal') ||
    combined.includes('north') ||
    combined.includes('ordinal')
  ) {
    const targetDir = questionIndex % 2 === 0 ? 'E' : 'NE';
    const { svg, labels } = buildCompassRoseSvg(targetDir as any);
    return {
      type: 'map',
      visualQuestionType: 'identify',
      title: 'Compass Rose (Directions)',
      caption: 'Study the compass rose below. Identify the direction marked by the question mark [?].',
      altText: 'Compass rose with 8 directions with one direction marked by a question mark.',
      svgContent: svg,
      labels
    };
  }

  // 11. Social Studies: Belize Districts
  if (
    combined.includes('belize') ||
    combined.includes('district') ||
    combined.includes('cayo') ||
    combined.includes('corozal') ||
    combined.includes('toledo') ||
    combined.includes('stann creek')
  ) {
    const target = combined.includes('cayo') ? 'Cayo' : combined.includes('toledo') ? 'Toledo' : 'Stann Creek';
    const { svg, labels } = buildBelizeDistrictsMapSvg(target);
    return {
      type: 'map',
      visualQuestionType: 'label_diagram',
      title: 'Map of Belize Districts',
      caption: 'Examine the map of Belize. Identify the district marked with the question mark [?].',
      altText: `Map of Belize districts with one district marked by question mark.`,
      svgContent: svg,
      labels
    };
  }

  // 12. Language Arts: Sequencing & Comparison
  if (
    combined.includes('sequence') ||
    combined.includes('story order') ||
    combined.includes('first next last') ||
    combined.includes('chronological')
  ) {
    const { svg, labels } = buildStorySequenceSvg();
    return {
      type: 'sequence',
      visualQuestionType: 'sequence',
      title: 'Story Event Sequence Panels',
      caption: 'Look at the three illustrated story panels labeled 1, 2, and 3.',
      altText: 'Three panels showing steps of planting, sprouting, and blooming.',
      svgContent: svg,
      labels
    };
  }

  if (
    combined.includes('compare') ||
    combined.includes('contrast') ||
    combined.includes('venn diagram')
  ) {
    const { svg, labels } = buildVennDiagramSvg(topic || 'Topic A', 'Topic B');
    return {
      type: 'organizer',
      visualQuestionType: 'compare',
      title: 'Venn Diagram Comparison',
      caption: 'Study the two overlapping circles on the Venn diagram.',
      altText: 'Venn diagram comparing characteristics of two topics.',
      svgContent: svg,
      labels
    };
  }

  // If no specialized match found, return null so we don't force unrelated visuals
  return null;
}
