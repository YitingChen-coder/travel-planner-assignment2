import Link from "next/link";

const directions = [
  { name: "Calm", description: "A slower, softer way to wander.", route: "/mood-boards/calm", art: "calm", number: "01" },
  { name: "Arcade", description: "Playful color for the curious traveler.", route: "/mood-boards/arcade", art: "arcade", number: "02" },
  { name: "Editorial", description: "A considered journal of places and people.", route: "/mood-boards/editorial", art: "editorial", number: "03" },
] as const;

type Direction = (typeof directions)[number];

function DestinationCard({
  name,
  description,
  route,
  art,
  number,
  category,
}: {
  name: string;
  description: string;
  route: string;
  art: Direction["art"];
  number: string;
  category: "Visual direction" | "Design language";
}) {
  const isAvailable = category === "Visual direction";
  const card = (
    <article className="destination-card">
      <div className={`card-art card-art--${art}`} aria-hidden="true">
        {category === "Visual direction" ? (
          <>
            <span className="art-orbit" />
            <span className="art-sun" />
            <span className="art-landscape" />
            <span className="art-title">{name}</span>
          </>
        ) : (
          <>
            <span className="type-sample">Aa</span>
            <span className="swatch swatch--one" />
            <span className="swatch swatch--two" />
            <span className="swatch swatch--three" />
            <span className="sample-rule" />
          </>
        )}
        <span className="art-number">{number}</span>
      </div>
      <div className="destination-card__body">
        <div className="destination-card__heading">
          <div>
            <p className="card-kicker">{category}</p>
            <h3>{name}</h3>
          </div>
          <span className="status-pill">{isAvailable ? "View board" : "Planned"}</span>
        </div>
        <p className="card-description">{description}</p>
        <div className="route-meta">
          <span className="route-code">{route}</span>
          <span className="availability">{isAvailable ? "Open mood board ↗" : "Page not available yet"}</span>
        </div>
      </div>
    </article>
  );

  if (isAvailable) {
    return (
      <Link className="destination-card-link" href={route}>
        {card}
      </Link>
    );
  }

  return card;
}

function ProjectSection({
  number,
  title,
  description,
  count,
  id,
  children,
}: {
  number: string;
  title: string;
  description: string;
  count: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section className="project-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="section-heading">
        <div className="section-heading__title">
          <span className="section-number">{number}</span>
          <div>
            <h2 id={`${id}-title`}>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <span className="section-count">{count}</span>
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <main className="site-shell" id="top">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Travel Planner home">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="12.5" />
            <path d="m20.8 10.6-3.5 7-7 3.8 3.5-7 7-3.8Z" />
            <circle cx="16" cy="16" r="1.2" />
          </svg>
          <span>FIELDNOTES <span className="wordmark__divider">/</span> 51238</span>
        </a>
        <nav className="topbar__nav" aria-label="Project sections">
          <a href="#mood-boards">Mood boards</a>
          <a href="#design-systems">Design systems</a>
          <a href="#final-website">Final website</a>
        </nav>
        <span className="topbar__term">Fall 2026 <i>·</i> Assignment 02</span>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero__copy">
          <p className="eyebrow"><span /> UI/UX &amp; Visual Design</p>
          <h1 id="page-title">Travel Planner<span>.</span></h1>
          <p className="hero__summary">Three visual directions. Three design systems. One thoughtful way to plan what&apos;s next.</p>
          <a className="text-link" href="#project-map">Explore the project <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-art__map">
            <svg viewBox="0 0 500 300" fill="none">
              <path className="map-grid" d="M0 60h500M0 120h500M0 180h500M0 240h500M70 0v300M160 0v300M250 0v300M340 0v300M430 0v300" />
              <path className="map-route" d="M56 221c57-3 53-90 123-90s64 73 117 54 45-95 125-96" />
              <circle className="map-stop" cx="56" cy="221" r="7" />
              <circle className="map-stop map-stop--end" cx="421" cy="89" r="7" />
            </svg>
            <span className="map-label map-label--start">A GOOD PLACE TO BEGIN</span>
            <span className="map-label map-label--end">SOMEWHERE NEW</span>
          </div>
          <div className="hero-art__stamp"><span>DESIGN<br />JOURNAL</span><span>01—04</span></div>
          <span className="hero-art__caption">A study in the art of getting away</span>
        </div>
        <div className="hero__index"><span><strong>04</strong> live pages</span><i /><span><strong>04</strong> destinations remaining</span></div>
      </section>

      <div className="project-intro" id="project-map">
        <span className="section-overline">The project map</span>
        <p>One starting point for the ideas, systems, and experience behind a better trip.</p>
      </div>

      <ProjectSection number="01" title="Mood Boards" description="Three different feelings for the same journey." count="03 directions" id="mood-boards">
        <div className="card-grid">
          {directions.map((direction) => <DestinationCard key={direction.route} {...direction} category="Visual direction" />)}
        </div>
      </ProjectSection>

      <ProjectSection number="02" title="Design Systems" description="Turning each direction into a usable visual language." count="03 systems" id="design-systems">
        <div className="card-grid">
          {directions.map((direction) => (
            <DestinationCard
              key={direction.name}
              name={direction.name}
              description={`A complete set of colors, type, spacing, and interface states for ${direction.name.toLowerCase()}.`}
              route={`/design-systems/${direction.name.toLowerCase()}`}
              art={direction.art}
              number={direction.number}
              category="Design language"
            />
          ))}
        </div>
      </ProjectSection>

      <ProjectSection number="03" title="Final Website" description="The destination where the pieces come together." count="01 experience" id="final-website">
        <article className="final-card">
          <div className="final-card__art" aria-hidden="true">
            <span className="final-sun" />
            <span className="final-route final-route--one" />
            <span className="final-route final-route--two" />
            <span className="final-pin final-pin--one">A</span>
            <span className="final-pin final-pin--two">B</span>
            <span className="final-coordinates">41°52&apos;N&nbsp; 87°38&apos;W</span>
          </div>
          <div className="final-card__content">
            <p className="card-kicker">The complete experience</p>
            <h3>Travel Planner</h3>
            <p>A responsive trip-planning experience, shaped by the visual direction that earns its way here.</p>
            <div className="route-meta"><span className="route-code">/travel-planner</span><span className="availability">Page not available yet</span></div>
          </div>
          <div className="final-card__status"><span className="status-pill">Planned</span><span className="final-card__arrow" aria-hidden="true">↗</span></div>
        </article>
      </ProjectSection>

      <footer className="footer">
        <span>Travel Planner <i>·</i> MPCS 51238</span>
        <span>Iteration 02C of 04 <i>·</i> Project hub</span>
      </footer>
    </main>
  );
}
