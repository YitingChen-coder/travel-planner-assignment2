import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./editorial.module.css";

export const metadata: Metadata = {
  title: "Elsewhere — A Travel Journal",
  description:
    "A contemporary travel magazine direction: cinematic photography, Swiss typography, black-and-white print studies, and bold editorial interfaces.",
};

type Photograph = {
  number: string;
  layout: string;
  title: string;
  place: string;
  image: string;
  alt: string;
};

const photographs: Photograph[] = [
  { number: "01", layout: "photoLead", title: "The city keeps its own weather", place: "Paris, France · 48°51′N", image: "/mood-boards/editorial/paris-river.jpg", alt: "Lamplit bridge over the Seine at dusk in Paris" },
  { number: "02", layout: "photoVenice", title: "A quieter crossing", place: "Venice, Italy · 45°26′N", image: "/mood-boards/editorial/venice-notes.jpg", alt: "A gondola passing below the Rialto Bridge in Venice" },
  { number: "03", layout: "photoRiviera", title: "Houses at the edge of the water", place: "Liguria, Italy · 44°06′N", image: "/mood-boards/editorial/coastal-village.jpg", alt: "Pastel houses stepping down a rocky Ligurian coast" },
  { number: "04", layout: "photoAegean", title: "White walls, blue interval", place: "Santorini, Greece · 36°23′N", image: "/mood-boards/editorial/blue-hour-coast.jpg", alt: "Whitewashed houses above the deep blue Aegean Sea" },
  { number: "05", layout: "photoField", title: "The things we carry", place: "Field notes · unfiled", image: "/mood-boards/editorial/atlas-table.jpg", alt: "A folded map, field notebook, camera, pencil, and travel bag" },
  { number: "06", layout: "photoNorth", title: "The far country", place: "Alaska · 61°13′N", image: "/mood-boards/editorial/mountain-pass.jpg", alt: "A wide green valley framed by snow-covered mountain ranges" },
];

const typography = [
  { number: "07", label: "Cover line / grotesk display", style: "typeCover", copy: "GO\nELSEWHERE." },
  { number: "08", label: "Running head / condensed sans", style: "typeRunning", copy: "NOTES FROM THE EDGE OF THE MAP" },
  { number: "09", label: "Destination essay / italic", style: "typeItalic", copy: "The afternoon took the long way home." },
  { number: "10", label: "Pull quote / oversized serif", style: "typeQuote", copy: "“Somewhere is not a point. It is a feeling.”" },
  { number: "11", label: "Colophon / technical monospace", style: "typeColophon", copy: "FIELD REPORT No. 08 — 03 / 2026" },
];

const colors = [
  { number: "12", name: "Printer’s ink", hex: "#111111", style: "colorInk" },
  { number: "13", name: "Page white", hex: "#ffffff", style: "colorPaper" },
  { number: "14", name: "Graphite", hex: "#606060", style: "colorGray" },
  { number: "15", name: "Newsprint gray", hex: "#d8d8d8", style: "colorStone" },
  { number: "16", name: "Brick mark", hex: "#a2493c", style: "colorBrick" },
];

const textures = [
  { number: "17", name: "Uncoated stock", note: "White fiber / uncoated finish", style: "texturePaper" },
  { number: "18", name: "Letterpress grain", note: "Ink pressed into fiber", style: "texturePress" },
  { number: "19", name: "Atlas contour", note: "Elevation lines / 1:50,000", style: "textureMap" },
  { number: "20", name: "Column rule", note: "Heavy rule / Swiss grid", style: "textureRule" },
  { number: "21", name: "Halftone shade", note: "Photographic dot / 42 lpi", style: "textureTone" },
];

type InterfacePiece = { number: string; title: string; note: string; variant: number; layout: string };

const interfaces: InterfacePiece[] = [
  { number: "22", title: "Editorial navigation", note: "A bold masthead with an issue index.", variant: 1, layout: "interfaceNav" },
  { number: "23", title: "Destination index", note: "A place to turn before you go.", variant: 2, layout: "interfaceIndex" },
  { number: "24", title: "Article preview", note: "A lead image, deck, and byline.", variant: 3, layout: "interfaceArticle" },
  { number: "25", title: "Itinerary excerpt", note: "Three hours, left deliberately open.", variant: 4, layout: "interfaceItinerary" },
  { number: "26", title: "Travel note", note: "A thought kept in the margin.", variant: 5, layout: "interfaceNote" },
  { number: "27", title: "Location details", note: "Place, coordinates, and season.", variant: 6, layout: "interfaceLocation" },
  { number: "28", title: "Issue contents", note: "A printed route through the issue.", variant: 7, layout: "interfaceContents" },
];

function ArtifactNumber({ number, label }: { number: string; label: string }) {
  return <span className={styles.artifactNumber}><b>{number}</b><i>{label}</i></span>;
}

function PhotographArtifact({ photograph }: { photograph: Photograph }) {
  return (
    <figure className={`${styles.photograph} ${styles[photograph.layout]}`}>
      <div className={styles.photographFrame}>
        <Image src={photograph.image} alt={photograph.alt} fill sizes={photograph.number === "01" ? "100vw" : "(max-width: 640px) 100vw, 75vw"} className={styles.photographImage} priority={photograph.number === "01"} />
        <span className={styles.photoIndex}>{photograph.number} <i>/ 06</i></span>
      </div>
      <figcaption><strong>{photograph.title}</strong><span>{photograph.place}</span></figcaption>
    </figure>
  );
}

function TypographyArtifact({ specimen }: { specimen: (typeof typography)[number] }) {
  return (
    <figure className={`${styles.typeSpecimen} ${styles[specimen.style]}`}>
      <span className={styles.typeLabel}>{specimen.label}</span>
      <p>{specimen.copy}</p>
      <ArtifactNumber number={specimen.number} label="TYPE STUDY" />
    </figure>
  );
}

function ColorArtifact({ color }: { color: (typeof colors)[number] }) {
  return (
    <figure className={`${styles.colorStudy} ${styles[color.style]}`}>
      <div className={styles.colorSwatch} style={{ backgroundColor: color.hex }}><span>{color.hex}</span></div>
      <figcaption><ArtifactNumber number={color.number} label="COLOR" /><strong>{color.name}</strong></figcaption>
    </figure>
  );
}

function TextureArtifact({ texture }: { texture: (typeof textures)[number] }) {
  return (
    <figure className={`${styles.textureStudy} ${styles[texture.style]}`}>
      <div className={styles.textureSample}><span>FIELD / 03</span></div>
      <figcaption><ArtifactNumber number={texture.number} label="MATERIAL" /><strong>{texture.name}</strong><small>{texture.note}</small></figcaption>
    </figure>
  );
}

function InterfaceArtwork({ variant }: { variant: number }) {
  if (variant === 1) {
    return <div className={styles.navSpecimen}><span>ELSEWHERE</span><div><i>Places</i><i>Essays</i><i>Field notes</i><i>Index</i></div><b>ISSUE 08 / SPRING</b></div>;
  }
  if (variant === 2) {
    return <div className={styles.indexSpecimen}><span className={styles.uiOverline}>DESTINATION INDEX / 08</span>{[["01", "Lisbon", "18"], ["02", "Venice", "34"], ["03", "The Cyclades", "52"], ["04", "Somewhere north", "76"]].map(([number, place, page]) => <div className={styles.indexRow} key={number}><i>{number}</i><strong>{place}</strong><span>{page}</span></div>)}</div>;
  }
  if (variant === 3) {
    return <div className={styles.articleSpecimen}><div className={styles.articlePhoto} /><div><span className={styles.uiOverline}>A PLACE IN THREE ACTS</span><strong>On learning the shape of a city</strong><p>By the time the bells began, we had stopped trying to find our way.</p><small>WORDS BY M. LAURENT&nbsp; / &nbsp;8 MIN READ</small></div></div>;
  }
  if (variant === 4) {
    return <div className={styles.itinerarySpecimen}><span className={styles.uiOverline}>A DAY, LEFT OPEN / 14 MAY</span><div><time>09:10</time><p>Coffee at the counter by the station</p></div><div><time>11:40</time><p>Take the ferry, not the fast boat</p></div><div><time>16:20</time><p>Leave the afternoon unplanned</p></div></div>;
  }
  if (variant === 5) {
    return <div className={styles.noteSpecimen}><span>FROM THE FIELD BOOK&nbsp; / &nbsp;MAY 14</span><p>“The best hour was the one we didn’t write down.”</p><i>— L., on the coast</i><b aria-hidden="true">✳</b></div>;
  }
  if (variant === 6) {
    return <div className={styles.locationSpecimen}><span className={styles.uiOverline}>LOCATION / FILE 027</span><strong>Alfama, Lisboa</strong><div className={styles.locationRule} /><span>38°43′N&nbsp; 9°08′W</span><span>Late September · 22°C</span><span>Atlantic light / narrow streets</span></div>;
  }
  return <div className={styles.contentsSpecimen}><span className={styles.uiOverline}>IN THIS ISSUE</span><strong>Elsewhere, No. 08</strong><div><span>Correspondence</span><i>04</i></div><div><span>Three days in Lisbon</span><i>18</i></div><div><span>The ferry at blue hour</span><i>34</i></div><div><span>Notes from the north</span><i>52</i></div><small>SPRING / VOL. 02</small></div>;
}

function InterfaceArtifact({ item }: { item: InterfacePiece }) {
  return (
    <figure className={`${styles.interfaceFragment} ${styles[item.layout]}`}>
      <InterfaceArtwork variant={item.variant} />
      <figcaption><ArtifactNumber number={item.number} label="INTERFACE" /><strong>{item.title}</strong><span>{item.note}</span></figcaption>
    </figure>
  );
}

export default function EditorialMoodBoard() {
  return (
    <main className={styles.editorialPage}>
      <header className={styles.masthead}>
        <Link className={styles.mastheadBrand} href="/" aria-label="Return to Travel Planner project hub">TRAVEL PLANNER <i> / </i> MPCS 51238</Link>
        <span className={styles.mastheadIssue}>AN INDEPENDENT TRAVEL JOURNAL <b>·</b> ISSUE 03</span>
        <Link className={styles.mastheadHome} href="/">PROJECT INDEX <span>↗</span></Link>
      </header>

      <section className={styles.cover} aria-labelledby="editorial-title">
        <div className={styles.coverImage}><PhotographArtifact photograph={photographs[0]} /></div>
        <div className={styles.coverCopy}>
          <div className={styles.coverTopline}><p className={styles.kicker}>INDEPENDENT TRAVEL / ISSUE 03</p><span>28 ARTIFACTS · 6 PLACES</span></div>
          <h1 id="editorial-title">Elsewhere<span>A Travel Journal</span></h1>
          <div className={styles.coverStory}>
            <span className={styles.coverStoryNumber}>01</span>
            <div><p className={styles.kicker}>THE CITY AFTER HOURS</p><h2>Get lost.<br /><em>Look closer.</em></h2></div>
            <p className={styles.coverDeck}>Beyond the postcard. Into the streets, the stories, and the places that stay with you.</p>
          </div>
          <div className={styles.coverByline}><span>PARIS / 48°51′N</span><span>VISUAL DIRECTION 03 / 03</span></div>
        </div>
      </section>

      <div className={styles.issueRule}><span>FIELD NOTES / 08</span><span>THE PLACES BETWEEN THE PAGES</span><span>01 — 06</span></div>

      <section className={styles.photoSection} aria-labelledby="places-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}><span><b className={styles.sectionNumber}>01</b>PHOTO ESSAY</span><i>—</i> SIX OPENINGS</p><h2 id="places-title">Outside the frame</h2></div>
          <p className={styles.sectionDeck}>Not a checklist. A few beginnings, gathered from the margins of the map.</p>
        </div>
        <div className={styles.photoSpread}>{photographs.slice(1).map((photograph) => <PhotographArtifact key={photograph.number} photograph={photograph} />)}</div>
      </section>

      <section className={styles.typeSection} aria-labelledby="type-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}><span><b className={styles.sectionNumber}>02</b>LETTERFORM</span><i>—</i> 5 VOICES</p><h2 id="type-title">Type speaks volumes</h2></div>
          <p className={styles.sectionDeck}>Big statements. Precise annotations. A collision of scale, weight, and voice.</p>
        </div>
        <div className={styles.typeSpread}>{typography.map((specimen) => <TypographyArtifact key={specimen.number} specimen={specimen} />)}</div>
      </section>

      <section className={styles.colorSection} aria-labelledby="color-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}><span><b className={styles.sectionNumber}>03</b>INK &amp; STOCK</span><i>—</i> FIVE SWATCHES</p><h2 id="color-title">Ink. Paper. Impact.</h2></div>
          <p className={styles.sectionDeck}>Mostly paper and ink. One small mark of brick, saved for what matters.</p>
        </div>
        <div className={styles.colorSpread}>{colors.map((color) => <ColorArtifact key={color.number} color={color} />)}</div>
      </section>

      <section className={styles.textureSection} aria-labelledby="texture-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}><span><b className={styles.sectionNumber}>04</b>PRINT MATERIALS</span><i>—</i> SURFACE STUDIES</p><h2 id="texture-title">Paper, pressure, grain</h2></div>
          <p className={styles.sectionDeck}>A field guide to the marks left by printing, folding, and carrying.</p>
        </div>
        <div className={styles.textureSpread}>{textures.map((texture) => <TextureArtifact key={texture.number} texture={texture} />)}</div>
      </section>

      <section className={styles.interfaceSection} aria-labelledby="interface-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}><span><b className={styles.sectionNumber}>05</b>READER’S DESK</span><i>—</i> 7 FRAGMENTS</p><h2 id="interface-title">Designed to be read</h2></div>
          <p className={styles.sectionDeck}>A digital edition with the confidence of print: strong navigation, vivid stories, and clear reading paths.</p>
        </div>
        <div className={styles.interfaceSpread}>{interfaces.map((item) => <InterfaceArtifact key={item.number} item={item} />)}</div>
      </section>

      <footer className={styles.colophon}>
        <Link href="/">← RETURN TO THE PROJECT INDEX</Link>
        <span>ELSEWHERE / A TRAVEL JOURNAL</span>
        <span>END PAPER&nbsp; · &nbsp;28 SPECIMENS</span>
      </footer>
    </main>
  );
}
