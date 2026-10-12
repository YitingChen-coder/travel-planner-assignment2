"use client";
import Image from "next/image";
import { useState } from "react";
import { destinations } from "./data";
import {
  budgetSummary,
  activityTotal,
  checklistSummary,
  dateLabel,
  money,
  upsertActivity,
  removeActivity,
  moveActivity,
} from "./model";
import type { Activity, Trip } from "./model";
import { ActivityForm, BudgetForm, TripForm } from "./forms";
import { Confirm } from "./ui";
import styles from "./planner.module.css";
export default function Workspace({
  trip,
  updateTrip,
  onDiscover,
  onNew,
  onDelete,
  announce,
}: {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
  onDiscover: () => void;
  onNew: () => void;
  onDelete: () => void;
  announce: (message: string) => void;
}) {
  const [day, setDay] = useState(0);
  const [activityEdit, setActivityEdit] = useState<{
    activity?: Activity;
  } | null>(null);
  const [removal, setRemoval] = useState<Activity | null>(null);
  const [tripEdit, setTripEdit] = useState(false);
  const [budgetEdit, setBudgetEdit] = useState(false);
  const [custom, setCustom] = useState("");
  const [customError, setCustomError] = useState("");
  const destination = destinations.find((d) => d.id === trip.destinationId)!;
  const selectedDay = Math.min(day, trip.days.length - 1);
  const current = trip.days[selectedDay];
  const summary = budgetSummary(trip);
  const checklist = checklistSummary(trip);
  const change = (updated: Trip, message: string) => {
    updateTrip(updated);
    announce(message);
  };
  const selectDay = (index: number, focus = false) => {
    setDay(index);
    if (focus) document.getElementById(`day-${index}`)?.focus();
  };
  return (
    <>
      <section className={styles.tripHero} aria-labelledby="workspace-title">
        <div>
          <div className={styles.breadcrumb}>
            <button onClick={onDiscover}>Discover</button>
            <span aria-hidden="true">/</span>
            <span>Your journey</span>
          </div>
          <p className={styles.eyebrow}>
            {trip.demo
              ? "DEMO TRIP · TRY IT, MAKE IT YOURS"
              : "YOUR TRIP / THIS VISIT"}{" "}
            / {destination.region}
          </p>
          <h1 id="workspace-title" tabIndex={-1}>
            {trip.name}
          </h1>
          <p className={styles.tripDescription}>
            A little room to explore {destination.name}. Your days, at your own
            pace.
          </p>
          <div className={styles.tripMeta}>
            <span>
              {dateLabel(trip.start, true)} – {dateLabel(trip.end, true)},{" "}
              {trip.start.slice(0, 4)}
              {trip.start.slice(0, 4) !== trip.end.slice(0, 4)
                ? ` / ${trip.end.slice(0, 4)}`
                : ""}
            </span>
            <span>
              {trip.days.length} {trip.days.length === 1 ? "day" : "days"}
            </span>
            <span>{trip.pace}</span>
          </div>
          <div className={styles.tripActions}>
            <button className={styles.secondary} onClick={() => setTripEdit(true)}>
              Edit trip details
            </button>
            <button className={styles.secondary} onClick={onNew}>
              Create another trip
            </button>
            <button className={styles.textButton} onClick={onDelete}>
              Delete this trip
            </button>
          </div>
        </div>
        <figure className={styles.tripPhoto}>
          <Image
            src={destination.image}
            alt={destination.alt}
            fill
            sizes="(max-width: 640px) 100vw, 35vw"
            priority
          />
          <figcaption>
            {destination.theme} <span aria-hidden="true">↗</span>
          </figcaption>
        </figure>
      </section>
      <div className={styles.workspaceGrid}>
        <section className={styles.itinerary} aria-labelledby="itinerary-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>01 / THE DAYS AHEAD</p>
              <h2 id="itinerary-title">A plan, with room to breathe.</h2>
            </div>
            <span className={styles.badge}>
              {trip.days.reduce((sum, d) => sum + d.activities.length, 0)}{" "}
              activities
            </span>
          </div>
          <div
            className={styles.daySelector}
            role="tablist"
            aria-label="Itinerary days"
          >
            {trip.days.map((d, i) => (
              <button
                key={d.date}
                id={`day-${i}`}
                role="tab"
                aria-selected={selectedDay === i}
                aria-controls="day-panel"
                tabIndex={selectedDay === i ? 0 : -1}
                onClick={() => selectDay(i)}
                onKeyDown={(e) => {
                  let next = i;
                  if (e.key === "ArrowRight") next = (i + 1) % trip.days.length;
                  else if (e.key === "ArrowLeft")
                    next = (i + trip.days.length - 1) % trip.days.length;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = trip.days.length - 1;
                  else return;
                  e.preventDefault();
                  selectDay(next, true);
                }}
              >
                <span>DAY {String(i + 1).padStart(2, "0")}</span>
                <strong>{dateLabel(d.date, true)}</strong>
              </button>
            ))}
          </div>
          <div
            id="day-panel"
            role="tabpanel"
            aria-labelledby={`day-${selectedDay}`}
            tabIndex={0}
          >
            <div className={styles.dayHeading}>
              <div>
                <h3>{dateLabel(current.date)}</h3>
                <p>
                  {current.activities.length
                    ? `${current.activities.length} ${current.activities.length === 1 ? "moment" : "moments"} · ${money(activityTotal(current.activities))} estimated`
                    : "A day that’s still yours to shape."}
                </p>
              </div>
              <button
                className={styles.primary}
                onClick={() => setActivityEdit({})}
              >
                + Add activity
              </button>
            </div>
            {current.activities.length ? (
              <ol className={styles.activityList}>
                {current.activities.map((activity, index) => (
                  <li
                    key={activity.id}
                    className={styles.activity}
                    data-activity={activity.id}
                  >
                    <div className={styles.activityTime}>
                      <time>{activity.time}</time>
                      <span>{activity.duration} min</span>
                      <span className={styles.routeDot} aria-hidden="true" />
                    </div>
                    <div className={styles.activityBody}>
                      <div className={styles.activityTop}>
                        <span className={styles.category}>
                          {activity.category}
                        </span>
                        <span className={styles.cost}>
                          {money(activity.cost)} <small>est.</small>
                        </span>
                      </div>
                      <h4>{activity.title}</h4>
                      {activity.notes && <p>{activity.notes}</p>}
                      <div className={styles.activityActions}>
                        <button
                          className={styles.textButton}
                          onClick={() => setActivityEdit({ activity })}
                          aria-label={`Edit ${activity.title}`}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.textButton}
                          onClick={() => setRemoval(activity)}
                          aria-label={`Remove ${activity.title}`}
                        >
                          Remove
                        </button>
                        <div className={styles.moveControls}>
                          <button
                            className={styles.iconButton}
                            aria-label={`Move ${activity.title} up`}
                            disabled={index === 0}
                            onClick={() =>
                              change(
                                moveActivity(
                                  trip,
                                  selectedDay,
                                  activity.id,
                                  -1,
                                ),
                                `${activity.title} moved up.`,
                              )
                            }
                          >
                            ↑
                          </button>
                          <button
                            className={styles.iconButton}
                            aria-label={`Move ${activity.title} down`}
                            disabled={index === current.activities.length - 1}
                            onClick={() =>
                              change(
                                moveActivity(trip, selectedDay, activity.id, 1),
                                `${activity.title} moved down.`,
                              )
                            }
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className={styles.empty}>
                <span className={styles.emptyMark} aria-hidden="true">
                  ✳
                </span>
                <h4>Nothing planned. Plenty possible.</h4>
                <p>
                  A slow walk, a good meal, a place you’ve wanted to see. Start
                  with one little thing.
                </p>
                <button
                  className={styles.secondary}
                  onClick={() => setActivityEdit({})}
                >
                  Plan the first moment
                </button>
              </div>
            )}
            <div className={styles.dayNote}>
              <span aria-hidden="true">✳</span>
              <p>
                You don’t have to fill every hour.
                <br />
                <strong>Leave a little room for the unexpected.</strong>
              </p>
            </div>
          </div>
        </section>
        <aside
          className={styles.sidebar}
          aria-label="Budget and travel checklist"
        >
          <section className={styles.budget} aria-labelledby="budget-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>02 / A LITTLE PERSPECTIVE</p>
                <h2 id="budget-title">Your trip, in balance.</h2>
              </div>
              <button
                className={styles.textButton}
                onClick={() => setBudgetEdit(true)}
                aria-label="Edit overall budget"
              >
                Edit
              </button>
            </div>
            <span className={styles.hint}>Estimated activity spending</span>
            <div className={styles.budgetAmount} data-testid="budget-spent">
              {money(summary.spent)}
              <span>of {money(trip.budget)}</span>
            </div>
            <label className={styles.srOnly} htmlFor="budget-progress">
              Estimated budget used
            </label>
            <progress
              id="budget-progress"
              className={summary.remaining < 0 ? styles.overBudget : undefined}
              value={Math.min(summary.percent, 100)}
              max={100}
            />
            <p
              className={
                summary.remaining < 0 ? styles.error : styles.budgetRemaining
              }
            >
              {summary.remaining < 0
                ? `${money(-summary.remaining)} over your budget`
                : `${money(summary.remaining)} left to explore`}{" "}
              <span>· {summary.percent.toFixed(1)}% used</span>
            </p>
            <dl className={styles.breakdown}>
              {Object.entries(summary.categories).map(([category, value]) => (
                <div key={category}>
                  <dt>{category}</dt>
                  <dd>{money(value)}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.hint}>
              Illustrative USD estimates, not live prices. Only planned
              activities are counted. Add stays and transport as activities to
              include them.
            </p>
          </section>
          <section
            className={styles.checklist}
            aria-labelledby="checklist-title"
          >
            <p className={styles.eyebrow}>03 / BEFORE YOU GO</p>
            <h2 id="checklist-title">The little essentials.</h2>
            <p className={styles.checklistCount}>
              {checklist.done} of {checklist.total} ready
            </p>
            <label className={styles.srOnly} htmlFor="checklist-progress">
              Checklist completion
            </label>
            <progress
              id="checklist-progress"
              value={checklist.done}
              max={Math.max(checklist.total, 1)}
            />
            <ul className={styles.checklistItems}>
              {trip.checklist.map((item) => (
                <li key={item.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        change(
                          {
                            ...trip,
                            checklist: trip.checklist.map((i) =>
                              i.id === item.id ? { ...i, done: !i.done } : i,
                            ),
                          },
                          `${item.label} ${item.done ? "unchecked" : "ready"}.`,
                        )
                      }
                    />
                    <span className={item.done ? styles.checked : undefined}>
                      {item.label}
                    </span>
                  </label>
                  {item.custom && (
                    <button
                      className={styles.iconButton}
                      aria-label={`Remove checklist item ${item.label}`}
                      onClick={() =>
                        change(
                          {
                            ...trip,
                            checklist: trip.checklist.filter(
                              (i) => i.id !== item.id,
                            ),
                          },
                          "Custom checklist item removed.",
                        )
                      }
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <form
              className={styles.checklistForm}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!custom.trim()) {
                  setCustomError("Add a name for your checklist item.");
                  document.getElementById("checklist-custom")?.focus();
                  return;
                }
                change(
                  {
                    ...trip,
                    checklist: [
                      ...trip.checklist,
                      {
                        id: crypto.randomUUID(),
                        label: custom.trim(),
                        done: false,
                        custom: true,
                      },
                    ],
                  },
                  "Checklist item added.",
                );
                setCustom("");
                setCustomError("");
              }}
            >
              <label htmlFor="checklist-custom">
                Something else to remember?
              </label>
              <div>
                <input
                  id="checklist-custom"
                  placeholder="e.g. A book for the journey"
                  maxLength={100}
                  value={custom}
                  aria-invalid={!!customError}
                  aria-describedby={customError ? "checklist-error" : undefined}
                  onChange={(e) => {
                    setCustom(e.target.value);
                    setCustomError("");
                  }}
                />
                <button className={styles.secondary} type="submit">
                  Add
                </button>
              </div>
              {customError && (
                <p className={styles.error} id="checklist-error">
                  {customError}
                </p>
              )}
            </form>
          </section>
          <div className={styles.sessionNote}>
            <span aria-hidden="true">⌂</span>
            <p>
              A little space to practice.
              <br />
              <strong>Nothing is saved. Refresh starts the demo again.</strong>
            </p>
          </div>
        </aside>
      </div>
      {tripEdit && (
        <TripForm
          destinationId={trip.destinationId}
          trip={trip}
          onClose={() => setTripEdit(false)}
          onSave={(updated) => {
            const destinationChanged = updated.destinationId !== trip.destinationId;
            setDay(Math.min(selectedDay, updated.days.length - 1));
            change(updated, destinationChanged
              ? "Trip details updated. Review your activities for your new destination."
              : "Trip details updated.");
            setTripEdit(false);
          }}
        />
      )}
      {activityEdit && (
        <ActivityForm
          activity={activityEdit.activity}
          dayLabel={`Day ${selectedDay + 1}, ${dateLabel(current.date)}`}
          onClose={() => setActivityEdit(null)}
          onSave={(a) => {
            change(
              upsertActivity(trip, selectedDay, a),
              activityEdit.activity
                ? "Activity updated."
                : "Activity added to your day.",
            );
            setActivityEdit(null);
          }}
        />
      )}
      {removal && (
        <Confirm
          title="Remove this moment?"
          description={`“${removal.title}” will be removed from Day ${selectedDay + 1}. You can add it again later.`}
          onClose={() => setRemoval(null)}
          onConfirm={() => {
            change(
              removeActivity(trip, selectedDay, removal.id),
              "Activity removed. Budget updated.",
            );
            setRemoval(null);
            requestAnimationFrame(() =>
              document.getElementById(`day-${selectedDay}`)?.focus(),
            );
          }}
          label="Remove activity"
        />
      )}
      {budgetEdit && (
        <BudgetForm
          budget={trip.budget}
          onClose={() => setBudgetEdit(false)}
          onSave={(budget) => {
            change({ ...trip, budget }, "Overall budget updated.");
            setBudgetEdit(false);
          }}
        />
      )}
    </>
  );
}
