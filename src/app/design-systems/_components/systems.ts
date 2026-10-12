export type Direction = 'calm' | 'arcade' | 'editorial';
export type ColorToken = { key: string; role: string; value: string; foreground: string; use: string };
export type TypeToken = { role: string; family: string; size: number; weight: number; lineHeight: number; sample: string };
export type System = {
  name: string; subtitle: string; intro: string; number: string; image: string; imageAlt: string;
  colors: ColorToken[]; typography: TypeToken[]; spacing: number[]; radii: number[];
  geometry: string; border: string; shadow: string; destination: string; trip: string;
};
export const systems: Record<Direction, System> = {
  calm: {
    name: 'The Quiet Way', subtitle: 'A little room to wander.', number: '01',
    intro: 'A field guide to softer interfaces. Natural color, generous breathing room, and thoughtful details for a trip at your own pace.',
    image: '/mood-boards/calm/mountain-lake.jpg', imageAlt: 'A still alpine lake and wooden boathouse below the mountains',
    destination: 'Lake Braies', trip: 'Three days, unhurried',
    colors: [
      { key: 'background', role: 'Page background', value: '#F3F0E7', foreground: '#29372F', use: 'Warm ivory gives long planning sessions a quiet ground.' },
      { key: 'surface', role: 'Surface', value: '#FFFEFA', foreground: '#29372F', use: 'Lift forms and stay cards gently from the page.' },
      { key: 'text', role: 'Primary text', value: '#29372F', foreground: '#FFFEFA', use: 'Forest ink for headlines and essential information.' },
      { key: 'muted', role: 'Secondary text', value: '#62675B', foreground: '#FFFEFA', use: 'Readable supporting notes, never pale labels.' },
      { key: 'border', role: 'Border', value: '#697161', foreground: '#FFFEFA', use: 'Define interactive boundaries; decorative rules may be softer.' },
      { key: 'accent', role: 'Accent / primary action', value: '#46574A', foreground: '#FFFFFF', use: 'Deep sage signals the next thoughtful step.' },
      { key: 'success', role: 'Success', value: '#3F644D', foreground: '#FFFFFF', use: 'A saved plan, supported by a clear text message.' },
      { key: 'warning', role: 'Warning', value: '#F5D58F', foreground: '#493508', use: 'A sand-toned notice that asks for attention.' },
      { key: 'error', role: 'Error', value: '#8F3C30', foreground: '#FFFFFF', use: 'Deep terracotta for validation and destructive actions.' },
    ],
    typography: [
      { role: 'Display', family: 'Georgia, serif', size: 76, weight: 400, lineHeight: 1.05, sample: 'Take the long way.' },
      { role: 'Heading', family: 'Georgia, serif', size: 42, weight: 400, lineHeight: 1.2, sample: 'A place to pause' },
      { role: 'Body', family: 'Arial, sans-serif', size: 16, weight: 400, lineHeight: 1.65, sample: 'Leave an afternoon open. The best part of a trip often finds you.' },
      { role: 'Label', family: 'Arial, sans-serif', size: 12, weight: 700, lineHeight: 1.5, sample: 'DAY THREE / NEAR THE WATER' },
    ], spacing: [4, 8, 12, 16, 20, 24, 28, 32, 48, 64], radii: [0, 8, 16, 24],
    geometry: '12-column desktop grid, 24px gutters, 1280px maximum content. At 640px and below, use one column and 20px side margins. Keep 24–48px between quiet groups.',
    border: '1px solid #697161 for controls; 1px #D6D9CC for decorative separation.',
    shadow: 'Cards: 0 4px 16px rgba(41,55,47,.03). Featured photos: 0 8px 24px rgba(41,55,47,.08).',
  },
  arcade: {
    name: 'Play the World', subtitle: 'Your next level starts here.', number: '02',
    intro: 'The player manual for a world worth exploring. High-energy controls, unmistakable states, and small rewards along the route.',
    image: '/mood-boards/arcade/neon-city.jpg', imageAlt: 'Bright neon signs and busy streets in Shibuya at night',
    destination: 'Tokyo', trip: 'Tokyo night quest',
    colors: [
      { key: 'background', role: 'Page background', value: '#171531', foreground: '#F6F4FF', use: 'Cabinet navy is the game world beneath every panel.' },
      { key: 'surface', role: 'Surface', value: '#24203F', foreground: '#F6F4FF', use: 'Quest panels separate the interface from the world.' },
      { key: 'text', role: 'Primary text', value: '#F6F4FF', foreground: '#171531', use: 'Bright text for missions, headings, and readable controls.' },
      { key: 'muted', role: 'Secondary text', value: '#C5BDDF', foreground: '#171531', use: 'Lavender supports readable quest annotations.' },
      { key: 'border', role: 'Border', value: '#9287AF', foreground: '#171531', use: 'Strong frames keep every control identifiable.' },
      { key: 'accent', role: 'Accent / primary action', value: '#713BFF', foreground: '#FFFFFF', use: 'Electric purple powers primary actions; cyan marks focus.' },
      { key: 'success', role: 'Success', value: '#35E4E8', foreground: '#171531', use: 'Player cyan celebrates unlocked and completed states.' },
      { key: 'warning', role: 'Warning', value: '#FFD84D', foreground: '#171531', use: 'Prize yellow highlights time-sensitive quest notices.' },
      { key: 'error', role: 'Error', value: '#FF5D67', foreground: '#171531', use: 'Joystick coral marks errors and destructive actions.' },
    ],
    typography: [
      { role: 'Display', family: 'Arial Black, Arial, sans-serif', size: 72, weight: 900, lineHeight: .95, sample: 'GO. PLAY. EXPLORE.' },
      { role: 'Heading', family: 'Arial, sans-serif', size: 32, weight: 900, lineHeight: 1.1, sample: 'QUEST ACCEPTED' },
      { role: 'Body', family: 'Arial, sans-serif', size: 16, weight: 400, lineHeight: 1.6, sample: 'Take the side quest. Find a new street. Collect a story worth keeping.' },
      { role: 'Label', family: 'Consolas, monospace', size: 12, weight: 700, lineHeight: 1.5, sample: 'PLAYER 01 // WORLD UNLOCKED' },
    ], spacing: [4, 8, 12, 16, 24, 32, 48], radii: [0, 2, 4],
    geometry: '12-column desktop grid, 20px gutters, 1280px maximum content. Use 2px frames and compact HUD groups. Below 640px, stack panels with 20px page margins.',
    border: '2px solid #9287AF; selection uses purple with a white boundary; cyan identifies focus and completion.', shadow: '4px 4px 0 #35E4E8; pressed controls move 3px and reduce the shadow.',
  },
  editorial: {
    name: 'Elsewhere', subtitle: 'A Travel Journal / Interface edition', number: '03',
    intro: 'The grammar of a contemporary travel magazine. Black and white, a confident grid, and typography that knows when to speak loudly.',
    image: '/mood-boards/editorial/coastal-village.jpg', imageAlt: 'Pastel houses above the rocky Ligurian coastline',
    destination: 'Liguria', trip: 'Liguria, in three acts',
    colors: [
      { key: 'background', role: 'Page background', value: '#FFFFFF', foreground: '#111111', use: 'Pure paper white. No beige tint or soft card canvas.' },
      { key: 'surface', role: 'Surface', value: '#F0F0F0', foreground: '#111111', use: 'Newsprint gray for supporting panels; ink for inverse surfaces.' },
      { key: 'text', role: 'Primary text', value: '#111111', foreground: '#FFFFFF', use: 'Printer’s ink for confident headlines and reading text.' },
      { key: 'muted', role: 'Secondary text', value: '#606060', foreground: '#FFFFFF', use: 'Graphite for bylines, dates, and metadata.' },
      { key: 'border', role: 'Border', value: '#606060', foreground: '#FFFFFF', use: 'Visible control edges; ink rules organize the page.' },
      { key: 'accent', role: 'Accent / primary action', value: '#111111', foreground: '#FFFFFF', use: 'Black action buttons. Brick red is reserved for small editorial marks.' },
      { key: 'success', role: 'Success', value: '#285E42', foreground: '#FFFFFF', use: 'A precise confirmation, outside the magazine’s core palette.' },
      { key: 'warning', role: 'Warning', value: '#F0C96C', foreground: '#111111', use: 'A clear notice with text; never color alone.' },
      { key: 'error', role: 'Error', value: '#A2493C', foreground: '#FFFFFF', use: 'Brick red marks validation and destructive intent.' },
    ],
    typography: [
      { role: 'Display', family: 'Arial, sans-serif', size: 96, weight: 900, lineHeight: .9, sample: 'LOOK CLOSER.' },
      { role: 'Heading', family: 'Arial, sans-serif', size: 40, weight: 800, lineHeight: 1, sample: 'Outside the frame' },
      { role: 'Body', family: 'Georgia, serif', size: 18, weight: 400, lineHeight: 1.65, sample: 'A story begins where the itinerary ends. Follow the details, then turn the page.' },
      { role: 'Label', family: 'Arial, sans-serif', size: 12, weight: 700, lineHeight: 1.5, sample: 'FIELD REPORT / No. 03' },
    ], spacing: [4, 8, 16, 24, 32, 48, 64, 96], radii: [0],
    geometry: '12-column print grid, 24px gutters, 1320px maximum content. Align headlines and index rows to the same edge. Below 640px, use a single column with 20px margins. Essays use Georgia 18px; interface copy uses Arial 16px, labels 12–14px.',
    border: '1px solid #606060 for controls; 4px solid #111111 for graphic section rules.', shadow: 'None. Use tonal contrast and graphic rules for hierarchy.',
  },
};
