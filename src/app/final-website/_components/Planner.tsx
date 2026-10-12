"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import { systems } from "../../design-systems/_components/systems";
import { destinations } from "./data";
import { dateRangeLabel, money } from "./model";
import { useTrips } from "./useTrips";
import { TripForm } from "./forms";
import { Confirm } from "./ui";
import Workspace from "./Workspace";
import styles from "./planner.module.css";
export default function Planner() {
  const { session, selectTrip, updateTrip, addTrip, deleteTrip, restoreDemo } =
    useTrips();
  const [view, setView] = useState<"discover" | "trips" | null>(null);
  const [creation, setCreation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<"delete" | "demo" | null>(
    null,
  );
  const active = session.trips.find((t) => t.id === session.activeId);
  const screen = view || (active ? "planner" : "discover");
  const variables = Object.fromEntries(
    systems.calm.colors.flatMap((c) => [
      [`--${c.key}`, c.value],
      [`--${c.key}-fg`, c.foreground],
    ]),
  ) as CSSProperties;
  function focusScreen() {
    requestAnimationFrame(() => {
      document.getElementById("workspace-title")?.focus();
      document.getElementById("screen-title")?.focus();
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  function show(next: "discover" | "trips") {
    setView(next);
    setMessage("");
    focusScreen();
  }
  function open(id: string) {
    selectTrip(id);
    setView(null);
    setMessage("Your journey is ready for this visit. Nothing is saved.");
    focusScreen();
  }
  function demo() {
    const existing = session.trips.find((t) => t.demo);
    if (existing) open(existing.id);
    else {
      restoreDemo();
      setView(null);
      focusScreen();
    }
  }
  return (
    <main className={styles.app} style={variables} id="quiet-way-top">
      <a className={styles.skipLink} href="#quiet-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <button
          className={styles.brand}
          onClick={() => show("discover")}
          aria-label="The Quiet Way — Discover"
        >
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="13" />
            <path d="M8 21c2-6 4-2 7-9 2-4 5 3 9-2M8 25h16" />
          </svg>
          <span>
            The Quiet Way
            <span className={styles.brandSub}>MAKE ROOM FOR THE JOURNEY</span>
          </span>
        </button>
        <nav aria-label="Main navigation">
          <button
            onClick={() => show("discover")}
            aria-current={screen === "discover" ? "page" : undefined}
          >
            Discover
          </button>
          <button
            onClick={() => show("trips")}
            aria-current={screen === "trips" ? "page" : undefined}
          >
            Demo trips{" "}
            <span className={styles.navCount}>{session.trips.length}</span>
          </button>
          {active && (
            <button
              onClick={() => open(active.id)}
              aria-current={screen === "planner" ? "page" : undefined}
            >
              Your itinerary
            </button>
          )}
        </nav>
        <button
          className={styles.primary}
          onClick={() => setCreation("dolomites")}
        >
          + New journey
        </button>
      </header>
      <div className={styles.notice} role="status" aria-live="polite">
        {message ||
          "Interactive demo · Nothing is saved. Refresh resets all trips."}
      </div>
      <div id="quiet-content" className={styles.content}>
        {screen === "discover" && (
          <>
            <section className={styles.hero} aria-labelledby="screen-title">
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>
                  <span className={styles.tinyDot} /> FOR THE PLACES THAT STAY
                  WITH YOU
                </p>
                <h1 id="screen-title" tabIndex={-1}>
                  Make room
                  <br />
                  for <em>the journey.</em>
                </h1>
                <p>
                  Less rushing. More being there. Discover beautiful places and
                  shape a few thoughtful days, at your own pace.
                </p>
                <div className={styles.heroActions}>
                  <button
                    className={styles.primary}
                    onClick={() => setCreation("dolomites")}
                  >
                    Plan your journey <span aria-hidden="true">↗</span>
                  </button>
                  <a className={styles.textLink} href="#destinations">
                    Find your somewhere <span aria-hidden="true">↓</span>
                  </a>
                </div>
                <button className={styles.demoLink} onClick={demo}>
                  Just looking? Try a three-day demo{" "}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <figure className={styles.heroPhoto}>
                <Image
                  src={destinations[0].image}
                  alt={destinations[0].alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 55vw"
                  priority
                />
                <figcaption>
                  <span>46°41′ N / 12°05′ E</span>
                  <strong>A little stillness in the Dolomites.</strong>
                </figcaption>
                <span className={styles.photoStamp}>
                  GO
                  <br />
                  <em>gently.</em>
                </span>
              </figure>
              <div className={styles.heroFoot}>
                <span>A slower way to see the world.</span>
                <span>YOUR DAYS. YOUR PACE. YOUR PLAN.</span>
              </div>
            </section>
            <section
              id="destinations"
              className={styles.discovery}
              aria-labelledby="destinations-title"
            >
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.eyebrow}>A FEW GOOD PLACES TO BEGIN</p>
                  <h2 id="destinations-title">
                    Where will you find a little room?
                  </h2>
                </div>
                <p>
                  Four places worth taking your time in.
                  <br />
                  Not a checklist. An invitation.
                </p>
              </div>
              <div className={styles.destinationGrid}>
                {destinations.map((destination, i) => (
                  <article className={styles.destination} key={destination.id}>
                    <div className={styles.destinationPhoto}>
                      <Image
                        src={destination.image}
                        alt={destination.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1000px) 45vw, 24vw"
                      />
                      <span className={styles.photoIndex}>
                        0{i + 1} / {destination.theme}
                      </span>
                    </div>
                    <div className={styles.destinationBody}>
                      <p className={styles.eyebrow}>{destination.region}</p>
                      <h3>{destination.name}</h3>
                      <p>{destination.description}</p>
                      <div className={styles.destinationMeta}>
                        <span>{destination.days} slow days</span>
                        <span>~{money(destination.daily)}/day</span>
                      </div>
                      <button
                        className={styles.destinationCta}
                        onClick={() => setCreation(destination.id)}
                        aria-label={`Plan this trip: ${destination.name}`}
                      >
                        Plan this trip <span aria-hidden="true">↗</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <p className={styles.hint}>
                Daily budgets are illustrative USD estimates. Photography from
                the approved local mood-board collection, originally sourced
                from Unsplash.
              </p>
            </section>
            <section className={styles.howItWorks} aria-labelledby="how-title">
              <div>
                <p className={styles.eyebrow}>A PLAN THAT FEELS LIKE YOU</p>
                <h2 id="how-title">
                  Thoughtfully planned.
                  <br />
                  <em>Beautifully unhurried.</em>
                </h2>
                <p>Make a little structure. Leave a little space.</p>
              </div>
              <ol>
                <li>
                  <span>01</span>
                  <div>
                    <h3>Find your somewhere.</h3>
                    <p>Choose a place and a few days you can call your own.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <h3>Shape the days.</h3>
                    <p>
                      A walk, a meal, a moment. Add, move, and make it yours.
                    </p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <h3>Keep the little things together.</h3>
                    <p>
                      Your budget and essentials, together while you explore.
                    </p>
                  </div>
                </li>
              </ol>
            </section>
            <section className={styles.closing}>
              <span aria-hidden="true">✳</span>
              <h2>
                The best part might be
                <br />
                <em>what you didn’t plan.</em>
              </h2>
              <button
                className={styles.primary}
                onClick={() => setCreation("dolomites")}
              >
                Start with a little plan <span aria-hidden="true">↗</span>
              </button>
            </section>
          </>
        )}
        {screen === "trips" && (
          <section
            className={styles.tripsSection}
            aria-labelledby="screen-title"
          >
            <p className={styles.eyebrow}>YOUR OWN LITTLE ATLAS</p>
            <h1 id="screen-title" tabIndex={-1}>
              Journeys for this visit.
            </h1>
            <p className={styles.muted}>
              These are temporary practice trips. Nothing is saved; refreshing
              this page resets the original demo.
            </p>
            <div className={styles.tripsHeading}>
              <span>
                {session.trips.filter((t) => !t.demo).length} personal{" "}
                {session.trips.filter((t) => !t.demo).length === 1
                  ? "journey"
                  : "journeys"}{" "}
                · {session.trips.filter((t) => t.demo).length} demo
              </span>
              <button
                className={styles.secondary}
                onClick={() => setCreation("dolomites")}
              >
                + Create a trip
              </button>
            </div>
            <div className={styles.tripsGrid}>
              {session.trips.map((trip) => {
                const d = destinations.find(
                  (d) => d.id === trip.destinationId,
                )!;
                return (
                  <article key={trip.id} className={styles.tripCard}>
                    <div className={styles.tripCardPhoto}>
                      <Image
                        src={d.image}
                        alt={d.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, 35vw"
                      />
                      <span className={styles.imageBadge}>
                        {trip.demo
                          ? "DEMO / EDITABLE EXAMPLE"
                          : "IN-SESSION TRIP"}
                      </span>
                    </div>
                    <div>
                      <p className={styles.eyebrow}>{d.region}</p>
                      <h2>{trip.name}</h2>
                      <p className={styles.tripCardDates}>
                        {dateRangeLabel(trip.start, trip.end)}
                      </p>
                      <p>
                        {trip.days.length} {trip.days.length === 1 ? "day" : "days"} · {trip.pace}
                      </p>
                      <button
                        className={styles.primary}
                        onClick={() => open(trip.id)}
                      >
                        Open {trip.demo ? "demo" : "journey"}{" "}
                        <span aria-hidden="true">↗</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            {!session.trips.length && (
              <div className={styles.empty}>
                <h2>Your next chapter starts here.</h2>
                <p>
                  No trips in this visit yet. Choose somewhere that calls to
                  you.
                </p>
                <button
                  className={styles.primary}
                  onClick={() => show("discover")}
                >
                  Explore destinations
                </button>
              </div>
            )}
            <div className={styles.demoNote}>
              <p>
                The demo is yours to explore. Resetting it affects only the
                example, never your other trips in this visit.
              </p>
              <button
                className={styles.textButton}
                onClick={() =>
                  session.trips.some((t) => t.demo)
                    ? setConfirmation("demo")
                    : demo()
                }
              >
                {session.trips.some((t) => t.demo)
                  ? "Reset demo trip"
                  : "Restore demo trip"}
              </button>
            </div>
          </section>
        )}
        {screen === "planner" && active && (
          <Workspace
            key={active.id}
            trip={active}
            updateTrip={updateTrip}
            onDiscover={() => show("discover")}
            onNew={() => setCreation(active.destinationId)}
            onDelete={() => setConfirmation("delete")}
            announce={setMessage}
          />
        )}
      </div>
      <footer className={styles.footer}>
        <div>
          <span className={styles.footerBrand}>
            The Quiet Way<span>.</span>
          </span>
          <p>Go gently. Find the beautiful bit between here and there.</p>
        </div>
        <div>
          <button onClick={() => show("discover")}>Discover</button>
          <button onClick={() => show("trips")}>Demo trips</button>
          <Link href="/">Assignment gallery ↗</Link>
          <Link href="/design-systems/calm">Built from Calm ↗</Link>
        </div>
        <p>
          INTERACTIVE DEMO / NOTHING IS SAVED
          <br />A frontend travel prototype. All costs are estimates.
        </p>
      </footer>
      {creation && (
        <TripForm
          destinationId={creation}
          onClose={() => setCreation(null)}
          onCreate={(trip) => {
            addTrip(trip);
            setView(null);
            setCreation(null);
            setMessage(
              "Trip created for this visit. Refresh resets all trips.",
            );
            focusScreen();
          }}
        />
      )}
      {confirmation === "delete" && active && (
        <Confirm
          title="Let this journey go?"
          description={`“${active.name}”, its activities, and checklist will be removed from this visit. This cannot be undone.${active.demo ? " You can restore the original demo from Demo trips." : ""}`}
          onClose={() => setConfirmation(null)}
          onConfirm={() => {
            deleteTrip(active.id);
            setConfirmation(null);
            setView("trips");
            setMessage("Trip deleted. Your other journeys are safe.");
            focusScreen();
          }}
          label="Delete trip"
        />
      )}
      {confirmation === "demo" && (
        <Confirm
          title="Begin the demo again?"
          description="This replaces all edits to the example trip with its original three-day plan. Other trips in this visit stay exactly as they are."
          onClose={() => setConfirmation(null)}
          onConfirm={() => {
            restoreDemo();
            setConfirmation(null);
            setView(null);
            setMessage("Demo restored to its original plan.");
            focusScreen();
          }}
          label="Reset demo"
        />
      )}
    </main>
  );
}
