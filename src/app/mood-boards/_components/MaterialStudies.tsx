// Original vector studies: deterministic geometry, no external assets or requests.
export function PaperStudy({ id, dark = false }: { id: string; dark?: boolean }) {
  return <svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><filter id={`${id}-fiber`}><feTurbulence type="fractalNoise" baseFrequency=".045 .32" numOctaves="3" seed="17" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="linear" slope=".22" /></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply" /></filter></defs>
    <rect width="360" height="240" fill={dark ? '#ddd9cd' : '#eee9de'} filter={`url(#${id}-fiber)`} />
    {Array.from({ length: 55 }, (_, i) => <path key={i} d={`M${(i * 83 + 19) % 360} ${(i * 47 + 31) % 240}l${3 + i % 7} ${i % 3 - 1}`} stroke={dark ? '#746f65' : '#ac9f89'} strokeWidth=".6" opacity={.25 + i % 4 * .1} />)}
  </svg>;
}

export function WeaveStudy() {
  return <svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="360" height="240" fill="#d9d6c4" />
    {Array.from({ length: 31 }, (_, x) => <path key={x} d={`M${x * 12} 0v240`} stroke="#a6a88f" strokeWidth={x % 3 === 0 ? 8 : 6} />)}
    {Array.from({ length: 21 }, (_, y) => <g key={y}><path d={`M0 ${y * 12}h360`} stroke="#efeddd" strokeWidth="7" />{Array.from({ length: 15 }, (_, x) => <path key={x} d={`M${x * 24 + y % 2 * 12} ${y * 12 - 5}v10`} stroke="#a6a88f" strokeWidth="6" />)}</g>)}
  </svg>;
}

export function LeafStudy({ id }: { id: string }) {
  return <svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id={id}><feGaussianBlur stdDeviation="2.5" /></filter></defs><rect width="360" height="240" fill="#eee6cc" /><g fill="#53664d" opacity=".36" filter={`url(#${id})`} transform="rotate(-24 180 120)"><path d="M35 250Q140 120 260-10" fill="none" stroke="#53664d" strokeWidth="6" />{Array.from({ length: 7 }, (_, i) => <g key={i} transform={`translate(${65 + i * 27} ${210 - i * 30})`}><ellipse rx="32" ry="11" transform="rotate(25) translate(-28 -10)" /><ellipse rx="30" ry="10" transform="rotate(-75) translate(20 8)" /></g>)}</g></svg>;
}

export function TideStudy() {
  return <svg viewBox="0 0 360 240" preserveAspectRatio="none" aria-hidden="true"><rect width="360" height="240" fill="#e9dfcd" />{Array.from({ length: 10 }, (_, i) => <path key={i} d={`M-20 ${20 + i * 24}Q70 ${60 + i * 16} 180 ${25 + i * 20}T380 ${35 + i * 23}`} fill="none" stroke={i % 2 ? '#c1ad8b' : '#f8f3e5'} strokeWidth={i % 3 === 0 ? 4 : 2} />)}</svg>;
}

export function ReliefStudy({ id }: { id: string }) {
  return <svg viewBox="0 0 360 240" aria-hidden="true"><defs><filter id={id}><feTurbulence baseFrequency=".17" numOctaves="2" seed="9" result="grain" /><feDisplacementMap in="SourceGraphic" in2="grain" scale="1.4" /><feDropShadow dx="1" dy="1" stdDeviation=".4" floodColor="#fff" /></filter></defs><rect width="360" height="240" fill="#e7e3d8" /><g filter={`url(#${id})`}><text x="24" y="112" fill="#111" fontFamily="Georgia, serif" fontWeight="bold" fontSize="66">INK</text><text x="26" y="168" fill="#555" fontFamily="Georgia, serif" fontSize="28">pressed into paper</text><path d="M26 187h300" stroke="#111" strokeWidth="3" /></g></svg>;
}

export function HalftoneStudy() {
  return <svg viewBox="0 0 360 240" aria-hidden="true"><rect width="360" height="240" fill="#fff" />{Array.from({ length: 24 }, (_, row) => Array.from({ length: 36 }, (_, col) => {
    const x = col * 10 + 5, y = row * 10 + 5;
    const ridge = 105 + 32 * Math.sin(col / 6) - 18 * Math.cos(col / 3);
    const tone = y > ridge ? Math.min(1, .55 + (y - ridge) / 180) : .08 + row / 65;
    return <circle key={`${row}-${col}`} cx={x} cy={y} r={tone * 4.5} fill="#111" />;
  }))}</svg>;
}

const pixels: Record<string, string[]> = {
  P: ['11110','10001','10001','11110','10000','10000','10000'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  Y: ['10001','10001','01010','00100','00100','00100','00100'],
};
export function PixelStudy() {
  return <svg viewBox="0 0 25 9" role="img" aria-label="PLAY drawn with five-by-seven pixel letterforms" shapeRendering="crispEdges"><g fill="#171531">{'PLAY'.split('').map((letter, n) => pixels[letter].flatMap((row, y) => row.split('').map((bit, x) => bit === '1' ? <rect key={`${n}-${x}-${y}`} x={n * 6 + x + 1} y={y + 1} width=".85" height=".85" /> : null)))}</g></svg>;
}
