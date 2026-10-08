import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Arcade Mood Board — Travel Planner",
  description:
    "Play the World: a high-energy travel direction built from arcade maps, neon city scenes, collectible stamps, and game-like travel interfaces.",
};

type Scene = {
  id: string;
  level: string;
  title: string;
  route: string;
  alt: string;
  image: string;
  state: string;
};

const scenes: Scene[] = [
  { id: "01", level: "WORLD 01", title: "Downtown Dash", route: "CHI → ???", alt: "A glowing downtown street at dusk, framed by tall buildings and city traffic", image: "/mood-boards/arcade/city-after-dark.jpg", state: "START HERE" },
  { id: "02", level: "WORLD 02", title: "Last Train Out", route: "RAIL / 084 KM", alt: "A freight locomotive rolling down railway tracks", image: "/mood-boards/arcade/railway-run.jpg", state: "BONUS ROUTE" },
  { id: "03", level: "WORLD 03", title: "Neon Night Run", route: "CITY / AFTER DARK", alt: "A city tram corridor at night illuminated by violet and cyan lights", image: "/mood-boards/arcade/night-sky.jpg", state: "NEW LEVEL" },
  { id: "04", level: "WORLD 04", title: "Shibuya Shuffle", route: "TOKYO / JP", alt: "The bright neon signs and crowded streets of Shibuya at night", image: "/mood-boards/arcade/neon-city.jpg", state: "UNLOCKED" },
  { id: "05", level: "WORLD 05", title: "Cloud Hopper", route: "SKY / 34,000 FT", alt: "An airplane wing above bright clouds at sunset", image: "/mood-boards/arcade/skyway.jpg", state: "IN PROGRESS" },
  { id: "06", level: "WORLD 06", title: "Festival Finale", route: "LIVE / ALL NIGHT", alt: "A crowd under bright violet and magenta lights at a live music festival", image: "/mood-boards/arcade/festival-lights.jpg", state: "BOSS LEVEL" },
];

const typography = [
  { id: "07", title: "GO FIND\nTHE NEXT LEVEL", note: "Block display / jump-cut line breaks", style: "block" },
  { id: "08", title: "PL4Y\nTHE W0RLD", note: "Pixel swap / digital voice", style: "pixel" },
  { id: "09", title: "EXPLORE MORE", note: "Hollow type / layered offset", style: "outline" },
  { id: "10", title: "Destination: Unknown!", note: "Playful title case / punchy punctuation", style: "bounce" },
  { id: "11", title: "NO MAP?\nNO PROBLEM.", note: "Monospace / arcade marquee", style: "mono" },
];

const colors = [
  { id: "12", name: "Electric Purple", hex: "#713BFF", use: "PORTAL / PRIMARY", style: "purple" },
  { id: "13", name: "Joystick Coral", hex: "#FF5D67", use: "ACTION / ALERT", style: "coral" },
  { id: "14", name: "Player Cyan", hex: "#35E4E8", use: "SIGNAL / ACTIVE", style: "cyan" },
  { id: "15", name: "Prize Yellow", hex: "#FFD84D", use: "REWARD / XP", style: "yellow" },
  { id: "16", name: "Cabinet Navy", hex: "#171531", use: "WORLD / BASE", style: "navy" },
];

const patterns = [
  { id: "17", name: "Cabinet checker", note: "8-bit grid / two-color", style: "checker" },
  { id: "18", name: "Level map", note: "Nodes, path, unlock", style: "route" },
  { id: "19", name: "Speed lines", note: "Fast travel / directional", style: "speed" },
  { id: "20", name: "Star loot", note: "Collectible / sparkle field", style: "stars" },
  { id: "21", name: "CRT scan", note: "Screen glow / scanline", style: "crt" },
];

function PieceTag({ id, kind }: { id: string; kind: string }) {
  return <span className="arcade-piece-tag"><b>{id}</b><i>{kind}</i></span>;
}

function SceneArtifact({ scene }: { scene: Scene }) {
  return (
    <figure className={`arcade-scene arcade-scene--${scene.id}`}>
      <div className="arcade-scene__image">
        <Image src={scene.image} alt={scene.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 60vw, 50vw" className="arcade-photo" />
        <span className="arcade-scene__scan" aria-hidden="true" />
        <span className="arcade-scene__level">{scene.level}</span>
        <span className="arcade-scene__state">{scene.state}</span>
        <span className="arcade-scene__title">{scene.title}</span>
        <span className="arcade-scene__route">{scene.route}</span>
      </div>
      <figcaption><PieceTag id={scene.id} kind="TRAVEL SCENE" /><span>LEVEL SELECT / {scene.level.slice(-2)}</span></figcaption>
    </figure>
  );
}

function TypographyArtifact({ item }: { item: (typeof typography)[number] }) {
  return (
    <figure className={`arcade-type arcade-type--${item.style}`}>
      <div className="arcade-type__canvas">
        {item.style === "bounce" ? <><span className="arcade-bounce-word">Destination:</span><span className="arcade-bounce-word arcade-bounce-word--second">Unknown!</span></> : <p>{item.title}</p>}
        <span className="arcade-type__cursor" aria-hidden="true">▮</span>
      </div>
      <figcaption><PieceTag id={item.id} kind="TYPE LAB" /><span>{item.note}</span></figcaption>
    </figure>
  );
}

function ColorArtifact({ item }: { item: (typeof colors)[number] }) {
  return (
    <figure className={`arcade-color arcade-color--${item.style}`}>
      <div className="arcade-color__chip" style={{ backgroundColor: item.hex }}>
        <span>{item.hex}</span>
        <b aria-hidden="true">✦</b>
      </div>
      <figcaption><PieceTag id={item.id} kind="COLOR DROP" /><strong>{item.name}</strong><span>{item.use}</span></figcaption>
    </figure>
  );
}

function PatternArtifact({ item }: { item: (typeof patterns)[number] }) {
  return (
    <figure className={`arcade-pattern arcade-pattern--${item.style}`}>
      <div className="arcade-pattern__field" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span></div>
      <figcaption><PieceTag id={item.id} kind="TEXTURE / FX" /><strong>{item.name}</strong><span>{item.note}</span></figcaption>
    </figure>
  );
}

function InterfaceArtwork({ variant }: { variant: number }) {
  if (variant === 1) {
    return <div className="arcade-ui__art ui-quest"><div className="ui-quest__top"><span>DAILY QUEST</span><span>+250 XP</span></div><strong>Find 3 hidden corners</strong><div className="ui-quest__tasks"><span><i>✓</i> Ask a local for a side street</span><span><i /> Take one wrong turn</span><span><i /> Save a tiny souvenir</span></div><div className="ui-mini-progress"><i style={{ width: "34%" }} /></div><small>1 / 3 CHECKPOINTS</small></div>;
  }
  if (variant === 2) {
    return <div className="arcade-ui__art ui-achievement"><div className="ui-achievement__seal"><span>★</span><b>NEW</b></div><strong>FIRST<br />FLIGHT</strong><span>ACHIEVEMENT<br />UNLOCKED</span><small>+100 XP</small></div>;
  }
  if (variant === 3) {
    return <div className="arcade-ui__art ui-xp"><div><span>TRAVEL XP</span><b>720 <i>/ 1,000</i></b></div><div className="ui-xp__bar"><i /></div><span className="ui-xp__foot">LEVEL 04 <b>280 XP TO LEVEL UP</b></span></div>;
  }
  if (variant === 4) {
    return <div className="arcade-ui__art ui-level-map"><span className="ui-level-map__label">WORLD MAP / 01—03</span><svg viewBox="0 0 280 92" fill="none" aria-label="Three destination nodes connected on a route"><path d="M18 62C67 62 55 24 103 24s41 49 84 43 39-42 75-42"/><circle cx="18" cy="62" r="9"/><circle cx="103" cy="24" r="9"/><circle cx="187" cy="67" r="9"/><circle cx="262" cy="25" r="9"/></svg><div><span>01 CHI</span><span>02 ???</span><span>03 GO!</span></div></div>;
  }
  if (variant === 5) {
    return <div className="arcade-ui__art ui-challenge"><div><span>ITINERARY CHALLENGE</span><b>RUN 02</b></div><strong>Collect 4 city sounds<br />before sunset.</strong><div className="ui-challenge__slots"><i>01</i><i>02</i><i>03</i><i>04</i></div><small>REWARD <b>RARE POSTCARD + 400 XP</b></small></div>;
  }
  if (variant === 6) {
    return <div className="arcade-ui__art ui-unlock"><div className="ui-unlock__gate"><span>✦</span><b>NEW</b></div><span className="ui-unlock__eyebrow">DESTINATION UNLOCKED</span><strong>TOKYO!</strong><span className="ui-unlock__sub">WORLD 03 / NIGHT MODE</span><div><i>ENTER WORLD</i><b>↗</b></div></div>;
  }
  return <div className="arcade-ui__art ui-pass"><div className="ui-pass__stub"><span>BOARDING PASS</span><b>EXTRA LIFE</b></div><strong>ONE-WAY<br />TO ANYWHERE</strong><div className="ui-pass__route"><span>CHI</span><i /><span>???</span></div><small>PLAYER 01 <b>GATE OPEN</b></small></div>;
}

function InterfaceArtifact({ id, name, note, variant }: { id: string; name: string; note: string; variant: number }) {
  return (
    <figure className={`arcade-interface arcade-interface--${variant}`}>
      <InterfaceArtwork variant={variant} />
      <figcaption><PieceTag id={id} kind="HUD FRAGMENT" /><strong>{name}</strong><span>{note}</span></figcaption>
    </figure>
  );
}

const interfacePieces = [
  { id: "22", name: "Quest card", note: "A destination becomes a mission.", variant: 1 },
  { id: "23", name: "Achievement seal", note: "Collectible stamp / first flight.", variant: 2 },
  { id: "24", name: "XP meter", note: "Travel progress with a reward loop.", variant: 3 },
  { id: "25", name: "World map", note: "Three nodes / one route to unlock.", variant: 4 },
  { id: "26", name: "Itinerary challenge", note: "A timed detour with a rare reward.", variant: 5 },
  { id: "27", name: "Destination gate", note: "The next city is ready to play.", variant: 6 },
  { id: "28", name: "Bonus boarding pass", note: "A travel ticket turned extra life.", variant: 7 },
];

export default function ArcadeMoodBoard() {
  return (
    <main className="arcade-page">
      <header className="arcade-topbar">
        <Link href="/" className="arcade-brand" aria-label="Return to Travel Planner home"><span className="arcade-brand__coin">TP</span><span>TRAVEL PLAYER <i>{"//"}</i> 51238</span></Link>
        <div className="arcade-topbar__status"><span>INSERT COIN <b>●</b></span><span>PLAYER 01 <b>ONLINE</b></span></div>
        <Link href="/" className="arcade-home">EXIT GAME <span>↗</span></Link>
      </header>

      <section className="arcade-hero" aria-labelledby="arcade-title">
        <div className="arcade-hero__copy">
          <p className="arcade-kicker"><span>STAGE 02</span><i /> TRAVEL ARCADE / CONCEPT BOARD</p>
          <h1 id="arcade-title">PLAY<br /><span>THE WORLD</span><b>!</b></h1>
          <p className="arcade-hero__deck">Travel is the game. Take the side quest, chase the strange little landmark, and see what unlocks when you wander off-route.</p>
          <div className="arcade-hero__prompt"><span className="prompt-caret" /> PRESS START <b>↗</b></div>
        </div>
        <div className="arcade-machine" aria-label="Decorative arcade status display">
          <div className="arcade-machine__header"><span>WORLD SELECT</span><span>● LIVE</span></div>
          <div className="arcade-machine__map">
            <svg viewBox="0 0 420 228" fill="none" aria-hidden="true"><path d="M42 171C94 171 74 75 152 75s57 90 129 70 40-74 99-74"/><circle cx="42" cy="171" r="12"/><circle cx="152" cy="75" r="12"/><circle cx="281" cy="145" r="12"/><circle cx="380" cy="71" r="12"/><path className="map-spark" d="m274 32 6 13 14 1-11 9 3 14-12-8-12 8 3-14-11-9 14-1 6-13Z"/></svg>
            <span className="arcade-map-label arcade-map-label--one">01 / START</span><span className="arcade-map-label arcade-map-label--two">02 / ???</span><span className="arcade-map-label arcade-map-label--three">03 / BONUS</span>
          </div>
          <div className="arcade-machine__footer"><span>ROUTE DATA LOADED</span><b>•••••••••• <i>83%</i></b></div>
          <span className="machine-sticker" aria-hidden="true">GO!<b>✦</b></span>
        </div>
        <div className="arcade-hero__foot"><span>CONCEPT: PLAY THE WORLD</span><span>28 ARTIFACTS <b>◆</b> 5 WORLDS</span></div>
      </section>

      <div className="arcade-ticker" aria-label="Arcade mood board categories"><span>LEVEL SELECT</span><b>✦</b><span>TRAVEL QUESTS</span><b>✦</b><span>COLLECT YOUR MOMENTS</span><b>✦</b><span>LEVEL SELECT</span><b>✦</b><span>TRAVEL QUESTS</span></div>

      <section className="arcade-section arcade-world-section" aria-labelledby="world-title">
        <div className="arcade-section__head"><div><p className="arcade-kicker"><span>WORLD 01—06</span><i /> SCENES TO PLAY</p><h2 id="world-title">Pick your portal<span>_</span></h2></div><span className="arcade-section__note">6 STAGES / CHOOSE YOUR OWN ROUTE</span></div>
        <div className="arcade-world-map">{scenes.map((scene) => <SceneArtifact key={scene.id} scene={scene} />)}<svg className="arcade-route-trace" viewBox="0 0 1200 530" preserveAspectRatio="none" aria-hidden="true"><path d="M30 60C210 10 260 210 440 198s145-150 290-134 134 212 290 193 106 130 152 230" /></svg></div>
      </section>

      <section className="arcade-type-section" aria-labelledby="type-title">
        <div className="arcade-section__head arcade-section__head--light"><div><p className="arcade-kicker"><span>TYPE POWER-UP</span><i /> 5 VOICES / 5 WAYS TO PLAY</p><h2 id="type-title">Say it louder<span>!</span></h2></div><span className="arcade-section__note">07—11 / TYPE EXPERIMENTS</span></div>
        <div className="arcade-type-lab">{typography.map((item) => <TypographyArtifact key={item.id} item={item} />)}</div>
      </section>

      <section className="arcade-section arcade-palette-section" aria-labelledby="palette-title">
        <div className="arcade-section__head"><div><p className="arcade-kicker"><span>POWER-UP COLORS</span><i /> PICK A PLAYER</p><h2 id="palette-title">Color loot<span>_</span></h2></div><span className="arcade-section__note">12—16 / PALETTE STUDIES</span></div>
        <div className="arcade-color-rack">{colors.map((item) => <ColorArtifact key={item.id} item={item} />)}</div>
      </section>

      <section className="arcade-pattern-section" aria-labelledby="pattern-title">
        <div className="arcade-section__head arcade-section__head--light"><div><p className="arcade-kicker"><span>WORLD TEXTURES</span><i /> SCREEN FX / PIXEL MAPS</p><h2 id="pattern-title">Glitch the grid<span>!</span></h2></div><span className="arcade-section__note">17—21 / PATTERNS &amp; TEXTURES</span></div>
        <div className="arcade-pattern-rack">{patterns.map((item) => <PatternArtifact key={item.id} item={item} />)}</div>
      </section>

      <section className="arcade-section arcade-ui-section" aria-labelledby="ui-title">
        <div className="arcade-section__head"><div><p className="arcade-kicker"><span>PLAYER INTERFACE</span><i /> THE GAME WITHIN THE TRIP</p><h2 id="ui-title">Quest accepted<span>!</span></h2></div><span className="arcade-section__note">22—28 / HUD FRAGMENTS</span></div>
        <div className="arcade-hud-board">{interfacePieces.map((item) => <InterfaceArtifact key={item.id} {...item} />)}</div>
      </section>

      <footer className="arcade-footer"><Link href="/">← RETURN TO THE PROJECT HUB</Link><span>ARCADE / MOOD BOARD / ITERATION 02B</span><span>GAME OVER? NEVER.</span></footer>
    </main>
  );
}
