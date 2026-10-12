import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PaperStudy, WeaveStudy, LeafStudy, TideStudy } from "../_components/MaterialStudies";

export const metadata: Metadata = {
  title: "Calm Mood Board — Travel Planner",
  description:
    "A visual direction for slow travel: quiet landscapes, softened color, tactile details, and unhurried interface moments.",
};

type Piece = {
  number: string;
  kind: "photograph" | "typography" | "color" | "texture" | "interface";
  label: string;
  title: string;
  note: string;
  variant: number;
  image?: string;
  alt?: string;
  hex?: string;
};

const pieces: Piece[] = [
  { number: "01", kind: "photograph", label: "Landscape / alpine", title: "The still point", note: "A room beside the water", variant: 1, image: "/mood-boards/calm/mountain-lake.jpg", alt: "A still alpine lake below cloud-softened mountains and a quiet wooden boathouse" },
  { number: "02", kind: "typography", label: "Type / opening thought", title: "A slower kind\nof somewhere.", note: "Display serif · generous leading", variant: 1 },
  { number: "03", kind: "color", label: "Color / 01", title: "Moss after rain", note: "Sage · #8C9A83", variant: 1, hex: "#8c9a83" },
  { number: "04", kind: "texture", label: "Texture / contour", title: "Contours around a summit", note: "Irregular nested elevation lines", variant: 1 },
  { number: "05", kind: "photograph", label: "Landscape / open road", title: "A little farther", note: "The road can wait", variant: 2, image: "/mood-boards/calm/coastal-cliffs.jpg", alt: "A quiet two-lane road winding between rose-colored desert cliffs" },
  { number: "06", kind: "typography", label: "Type / travel note", title: "Leave room\nfor the long way.", note: "Editorial italic · warm ink", variant: 2 },
  { number: "07", kind: "interface", label: "Interface / itinerary", title: "Day one, unhurried", note: "Trip rhythm · one small card", variant: 1 },
  { number: "08", kind: "photograph", label: "Landscape / forest", title: "Under the canopy", note: "A path without a plan", variant: 3, image: "/mood-boards/calm/forest-path.jpg", alt: "A soft footpath winding through a sunlit green forest" },
  { number: "09", kind: "color", label: "Color / 02", title: "Linen in daylight", note: "Warm ivory · #F3F0E7", variant: 2, hex: "#f3f0e7" },
  { number: "10", kind: "texture", label: "Texture / handmade paper", title: "Paper with a past", note: "Uneven fibers · original vector study", variant: 2 },
  { number: "11", kind: "interface", label: "Interface / dates", title: "A flexible week", note: "Date range · quiet controls", variant: 2 },
  { number: "12", kind: "typography", label: "Type / identity", title: "THE QUIET\nWAY", note: "Open tracking · steady sans", variant: 3 },
  { number: "13", kind: "photograph", label: "Landscape / first light", title: "Before the day begins", note: "First light over an inland lake", variant: 4, image: "/mood-boards/calm/soft-morning.jpg", alt: "Apricot sunrise above a misty inland lake surrounded by trees" },
  { number: "14", kind: "color", label: "Color / 03", title: "The last light", note: "Soft terracotta · #C98268", variant: 3, hex: "#c98268" },
  { number: "15", kind: "texture", label: "Texture / woven linen", title: "A softer surface", note: "Warp over weft · alternating crossings", variant: 3 },
  { number: "16", kind: "interface", label: "Interface / paper ticket", title: "One way, no rush", note: "A keepsake for the pocket", variant: 3 },
  { number: "17", kind: "photograph", label: "Landscape / clear water", title: "Sun on alpine water", note: "Turquoise, timber, and midday light", variant: 5, image: "/mood-boards/calm/alpine-water.jpg", alt: "Rowboats beside a turquoise alpine lake in bright daylight" },
  { number: "18", kind: "color", label: "Color / 04", title: "A quiet shoreline", note: "Dried sand · #D8C7AA", variant: 4, hex: "#d8c7aa" },
  { number: "19", kind: "interface", label: "Interface / route sketch", title: "A gentle detour", note: "Route sketch · two intermediate stops", variant: 4 },
  { number: "20", kind: "texture", label: "Texture / shade study", title: "Filtered through leaves", note: "Branch silhouettes · soft-edged shadows", variant: 4 },
  { number: "21", kind: "typography", label: "Type / annotation", title: "46°41′ N\n12°05′ E", note: "Monospaced coordinates · precise annotation", variant: 4 },
  { number: "22", kind: "interface", label: "Interface / place search", title: "Start anywhere", note: "Search field · open invitation", variant: 5 },
  { number: "23", kind: "photograph", label: "Landscape / shore", title: "Warm evening shoreline", note: "Sand, surf, and warm evening light", variant: 6, image: "/mood-boards/calm/green-hills.jpg", alt: "Warm sunset over a sandy beach with gentle surf" },
  { number: "24", kind: "color", label: "Color / 05", title: "Deep shade", note: "Forest ink · #46574A", variant: 5, hex: "#46574a" },
  { number: "25", kind: "texture", label: "Texture / tide marks", title: "What the water leaves", note: "Flowing wave traces · sand and foam", variant: 5 },
  { number: "26", kind: "interface", label: "Interface / saved place", title: "A lakeside morning", note: "Place, duration, and a reading hierarchy", variant: 6 },
  { number: "27", kind: "typography", label: "Type / reading measure", title: "The morning path follows the lake. Pause at the boathouse; the next stop can wait.", note: "Body serif · a comfortable line length", variant: 5 },
  { number: "28", kind: "interface", label: "Interface / packing note", title: "Bring less, notice more", note: "A short list for the road", variant: 7 },
];

function PieceArtwork({ piece }: { piece: Piece }) {
  if (piece.kind === "photograph") {
    return (
      <div className={`piece-art piece-art--photo piece-art--photo-${piece.variant}`}>
        <Image
          src={piece.image!}
          alt={piece.alt!}
          fill
          loading={piece.number === "01" ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 40vw"
          className="piece-photo"
        />
        <span className="photo-caption">{piece.title}</span>
      </div>
    );
  }

  if (piece.kind === "typography") {
    return (
      <div className={`piece-art type-piece type-piece--${piece.variant}`}>
        <span className="type-piece__eyebrow">{piece.note}</span>
        <p>{piece.title}</p>
        {piece.variant === 5 && <span className="type-piece__scribble">Field note / Lake Braies</span>}
      </div>
    );
  }

  if (piece.kind === "color") {
    return (
      <div className={`piece-art color-piece color-piece--${piece.variant}`}>
        <span className="color-piece__disc" style={{ backgroundColor: piece.hex }} />
        <span className="color-piece__name">{piece.title}</span>
        <span className="color-piece__hex">{piece.note.split("·")[1]?.trim()}</span><span className="color-piece__use">{({1: 'Soft ground for supporting groups', 2: 'Reading canvas · forest text', 3: 'Warm detail · never body text', 4: 'Quiet emphasis behind a note', 5: 'Primary action · white foreground'})[piece.variant]}</span>
      </div>
    );
  }

  if (piece.kind === "texture") {
    return <div className={`piece-art texture-piece texture-piece--${piece.variant}`}>
      {piece.variant === 1 ? <svg viewBox="0 0 360 240" aria-hidden="true">{Array.from({length: 8}, (_, i) => <path key={i} d={`M${15+i*15} 140C${15+i*12} ${35+i*8} ${290-i*12} ${-25+i*18} ${338-i*15} 105S${230-i*10} ${250-i*13} ${100+i*8} ${210-i*10}Z`} fill="none" stroke="#78876b" strokeWidth="1.5" />)}</svg> : piece.variant === 2 ? <PaperStudy id="calm-paper" /> : piece.variant === 3 ? <WeaveStudy /> : piece.variant === 4 ? <LeafStudy id="calm-leaves" /> : <TideStudy />}
      <span>{piece.title}</span></div>;
  }

  return <InterfaceArtwork variant={piece.variant} title={piece.title} />;
}

function InterfaceArtwork({ variant, title }: { variant: number; title: string }) {
  if (variant === 1) {
    return <div className="piece-art ui-piece ui-itinerary"><div className="ui-piece__topline"><span>THURSDAY, 14 MAY</span><span>DAY 01</span></div><strong>{title}</strong><div className="ui-itinerary__stop"><i /><span>Arrive before the light changes</span><b>10:30</b></div><div className="ui-itinerary__stop"><i /><span>Coffee, then nowhere in particular</span><b>12:00</b></div></div>;
  }
  if (variant === 2) {
    return <div className="piece-art ui-piece ui-dates"><span className="ui-piece__eyebrow">CHOOSE YOUR WINDOW</span><strong>May <span>2026</span></strong><div className="ui-calendar">{["M", "T", "W", "T", "F", "S", "S", "11", "12", "13", "14", "15", "16", "17"].map((day, index) => <i className={index >= 10 ? "selected" : ""} key={`${day}-${index}`}>{day}</i>)}</div><span className="ui-dates__foot">May 14–17 · 3 nights <b>↗</b></span></div>;
  }
  if (variant === 3) {
    return <div className="piece-art ui-ticket"><div className="ui-ticket__stamp">WAY<br />OUT</div><span className="ui-piece__eyebrow">A SMALL PAPER PROMISE</span><strong>{title}</strong><div><span>CHI</span><i /><span>VENICE</span></div></div>;
  }
  if (variant === 4) {
    return <div className="piece-art ui-map"><svg viewBox="0 0 260 130" aria-hidden="true"><path d="M14 92C48 88 48 31 93 38s42 53 78 38 35-38 77-43" /><circle cx="14" cy="92" r="5" /><circle cx="93" cy="38" r="5" /><circle cx="171" cy="76" r="5" /><circle cx="248" cy="33" r="5" /></svg><span>HOME</span><span>THE LONG WAY ROUND</span><small>3 hours / no tolls</small></div>;
  }
  if (variant === 5) {
    return <div className="piece-art ui-search"><span className="ui-piece__eyebrow">A PLACE THAT FEELS LIKE...</span><strong>{title}</strong><div className="ui-search__field"><span>Search places, e.g. Lake Braies</span><b>⌕</b></div><small>1 match · Lake Braies, South Tyrol</small><div className="ui-search__tags"><i>By the water</i><i>Somewhere green</i></div></div>;
  }
  if (variant === 6) {
    return <div className="piece-art ui-stay"><div className="ui-stay__photo" /><div><span className="ui-piece__eyebrow">A LITTLE PLACE TO LAND</span><strong>{title}</strong><span className="ui-stay__meta">Lake Braies · South Tyrol, Italy</span><div className="ui-stay__price">90 min <small>/ lakeside walk</small><b>↗</b></div></div></div>;
  }
  return <div className="piece-art ui-packing"><span className="ui-piece__eyebrow">A SHORT LIST</span><strong>{title}</strong><ul><li><i>✓</i> A good book</li><li><i>✓</i> Walking shoes</li><li><i /> A little curiosity</li></ul><span className="ui-packing__foot">2 of 3 packed · curiosity still to bring</span></div>;
}

function MoodBoardPiece({ piece }: { piece: Piece }) {
  return (
    <figure className={`mood-piece mood-piece--${piece.number}`}>
      <PieceArtwork piece={piece} />
      <figcaption className="piece-caption">
        <span className="piece-number">{piece.number}</span>
        <span className="piece-category">{piece.label}</span>
        <span className="piece-note">{piece.kind === "color" ? piece.note.split("·")[0].trim() : piece.note}</span>
      </figcaption>
    </figure>
  );
}

export default function CalmMoodBoard() {
  return (
    <main className="calm-page">
      <header className="calm-nav">
        <Link className="calm-wordmark" href="/" aria-label="Return to Travel Planner project hub">
          <span className="calm-wordmark__icon" aria-hidden="true">↖</span>
          <span>FIELDNOTES <i>/</i> 51238</span>
        </Link>
        <span className="calm-nav__center">MOOD BOARD <i>01 / 03</i></span>
        <Link className="calm-back" href="/">Back to project hub <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="calm-intro" aria-labelledby="calm-title">
        <div className="calm-intro__copy">
          <p className="calm-eyebrow"><span /> VISUAL DIRECTION / 01</p>
          <h1 id="calm-title">The Quiet Way<span>.</span></h1>
          <p className="calm-deck">A softer kind of travel. Follow the light, take the long way, and leave room for nothing in particular.</p>
        </div>
        <div className="calm-intro__aside">
          <span>CALM / FIELD STUDY</span>
          <p>Grounded in sage, worn paper, open horizons, and the small rituals that make a place feel like yours.</p>
          <div className="calm-intro__meta"><span>28 collected artifacts</span><span>·</span><span>01 / 03 directions</span></div>
        </div>
      </section>

      <div className="collage-heading"><span>Collected impressions</span><span>LANDSCAPE · TYPE · MATERIAL · MOMENT</span></div>

      <section className="calm-collage" aria-label="Calm travel mood board: 28 visual artifacts">
        {pieces.map((piece) => <MoodBoardPiece key={piece.number} piece={piece} />)}
      </section>

      <section className="calm-colophon" aria-label="Mood board summary">
        <span className="colophon-mark" aria-hidden="true">✳</span>
        <p>Go gently. Find the beautiful bit between here and there.</p>
        <span className="colophon-credit">LANDSCAPE PHOTOGRAPHY · UNSPLASH</span>
      </section>

      <footer className="calm-footer">
        <Link href="/">← Back to Travel Planner</Link>
        <span>CALM / MOOD BOARD / ITERATION 02A</span>
      </footer>
    </main>
  );
}
