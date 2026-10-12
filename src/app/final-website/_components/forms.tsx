"use client";
import { useState } from "react";
import { destinations } from "./data";
import {
  categories,
  paces,
  validateTrip,
  validateActivity,
  validateBudget,
  parseUsdCents,
  createTrip,
  tripShorteningSummary,
  updateTripDetails,
} from "./model";
import type {
  Activity,
  ActivityDraft,
  Category,
  Trip,
  TripDraft,
} from "./model";
import { Field, Modal } from "./ui";
import styles from "./planner.module.css";
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function TripForm({
  destinationId,
  onClose,
  trip,
  onCreate,
  onSave,
}: {
  destinationId: string;
  onClose: () => void;
} & (
  | { trip?: never; onCreate: (trip: Trip) => void; onSave?: never }
  | { trip: Trip; onSave: (trip: Trip) => void; onCreate?: never }
)) {
  const destination =
    destinations.find((d) => d.id === destinationId) || destinations[0];
  const [draft, setDraft] = useState<TripDraft>({
    destinationId: trip?.destinationId ?? destination.id,
    name: trip?.name ?? `A few days in ${destination.name}`,
    start: trip?.start ?? "",
    end: trip?.end ?? "",
    pace: trip?.pace ?? "Unhurried",
    budget: String(trip?.budget ?? destination.daily * destination.days),
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TripDraft, string>>
  >({});
  const [shortening, setShortening] = useState<{
    days: number;
    activities: number;
  } | null>(null);
  const change = (key: keyof TripDraft, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const attrs = (key: keyof TripDraft) => ({
    id: `trip-${key}`,
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `trip-${key}-help` : undefined,
  });
  return (
    <Modal
      title={
        shortening
          ? "Make this journey shorter?"
          : trip
            ? "A little adjustment to your journey."
            : "Make room for a new journey."
      }
      description={
        shortening
          ? `${shortening.days} ${shortening.days === 1 ? "day" : "days"} and ${shortening.activities} ${shortening.activities === 1 ? "activity" : "activities"} will be removed from the end of your trip. This cannot be undone.`
          : trip
            ? "Update your journey. Activities stay with their relative day number; new days begin empty."
            : "A place, a little time, and a plan of your own. All costs are illustrative estimates in USD."
      }
      onClose={onClose}
    >
      {shortening && trip ? (
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.secondary}
            autoFocus
            onClick={() => {
              setShortening(null);
              requestAnimationFrame(() => document.getElementById("trip-end")?.focus());
            }}
          >
            Keep all days
          </button>
          <button
            type="button"
            className={styles.destructive}
            onClick={() => onSave?.(updateTripDetails(trip, draft, true))}
          >
            Shorten trip
          </button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const found = validateTrip(draft);
            setErrors(found);
            const first = Object.keys(found)[0];
            if (first) {
              document.getElementById(`trip-${first}`)?.focus();
              return;
            }
            if (trip) {
              const removed = tripShorteningSummary(trip, draft);
              if (removed.activities) {
                setShortening(removed);
                return;
              }
              onSave?.(updateTripDetails(trip, draft));
            } else {
              onCreate?.(createTrip(draft, crypto.randomUUID()));
            }
          }}
        >
          <Field
            id="trip-destinationId"
            label="Destination"
            error={errors.destinationId}
          >
            <select
              {...attrs("destinationId")}
              value={draft.destinationId}
              onChange={(e) => change("destinationId", e.target.value)}
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.region}
                </option>
              ))}
            </select>
          </Field>
          {trip && draft.destinationId !== trip.destinationId && (
            <p className={styles.hint} role="status">
              Your activities will be kept. Review them for your new destination.
            </p>
          )}
          <Field id="trip-name" label="Trip name" error={errors.name}>
            <input
              {...attrs("name")}
              required
              maxLength={80}
              value={draft.name}
              onChange={(e) => change("name", e.target.value)}
            />
          </Field>
          <div className={styles.formGrid}>
            <Field id="trip-start" label="Start date" error={errors.start}>
              <input
                {...attrs("start")}
                type="date"
                required
                value={draft.start}
                onChange={(e) => change("start", e.target.value)}
              />
            </Field>
            <Field id="trip-end" label="End date" error={errors.end}>
              <input
                {...attrs("end")}
                type="date"
                required
                value={draft.end}
                onChange={(e) => change("end", e.target.value)}
              />
            </Field>
          </div>
          <p className={styles.hint}>
            Choose 1–30 days. Past dates are welcome for travel journals. Today is{" "}
            {today()}.
          </p>
          <div className={styles.formGrid}>
            <Field id="trip-pace" label="Travel pace" error={errors.pace}>
              <select
                {...attrs("pace")}
                value={draft.pace}
                onChange={(e) => change("pace", e.target.value)}
              >
                {paces.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            {!trip && (
              <Field
                id="trip-budget"
                label="Overall budget (USD)"
                error={errors.budget}
              >
                <input
                  {...attrs("budget")}
                  type="number"
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  required
                  value={draft.budget}
                  onChange={(e) => change("budget", e.target.value)}
                />
              </Field>
            )}
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primary}>
              {trip ? "Save trip details" : (
                <>Create trip <span aria-hidden="true">↗</span></>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
export function ActivityForm({
  activity,
  dayLabel,
  onClose,
  onSave,
}: {
  activity?: Activity;
  dayLabel: string;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}) {
  const [draft, setDraft] = useState<ActivityDraft>({
    title: activity?.title || "",
    time: activity?.time || "09:00",
    category: activity?.category || "Outdoors",
    duration: String(activity?.duration || 60),
    cost: String(activity?.cost ?? 0),
    notes: activity?.notes || "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ActivityDraft, string>>
  >({});
  const change = (key: keyof ActivityDraft, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const attrs = (key: keyof ActivityDraft) => ({
    id: `activity-${key}`,
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `activity-${key}-help` : undefined,
  });
  return (
    <Modal
      title={
        activity ? "A little adjustment." : "Leave room for something good."
      }
      description={`${activity ? "Edit" : "Add"} an activity for ${dayLabel}. Costs are estimates in USD.`}
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const found = validateActivity(draft);
          setErrors(found);
          const first = Object.keys(found)[0];
          if (first) {
            document.getElementById(`activity-${first}`)?.focus();
            return;
          }
          onSave({
            id: activity?.id || crypto.randomUUID(),
            title: draft.title.trim(),
            time: draft.time,
            category: draft.category as Category,
            duration: Number(draft.duration),
            cost: parseUsdCents(draft.cost)! / 100,
            notes: draft.notes.trim(),
          });
        }}
      >
        <Field id="activity-title" label="Activity name" error={errors.title}>
          <input
            {...attrs("title")}
            required
            maxLength={100}
            value={draft.title}
            onChange={(e) => change("title", e.target.value)}
            placeholder="A morning walk, a little café…"
          />
        </Field>
        <div className={styles.formGrid}>
          <Field id="activity-time" label="Start time" error={errors.time}>
            <input
              {...attrs("time")}
              type="time"
              required
              value={draft.time}
              onChange={(e) => change("time", e.target.value)}
            />
          </Field>
          <Field
            id="activity-category"
            label="Category"
            error={errors.category}
          >
            <select
              {...attrs("category")}
              value={draft.category}
              onChange={(e) => change("category", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className={styles.formGrid}>
          <Field
            id="activity-duration"
            label="Duration (minutes)"
            error={errors.duration}
          >
            <input
              {...attrs("duration")}
              type="number"
              min="1"
              max="1440"
              step="1"
              required
              value={draft.duration}
              onChange={(e) => change("duration", e.target.value)}
            />
          </Field>
          <Field
            id="activity-cost"
            label="Estimated cost (USD)"
            error={errors.cost}
          >
            <input
              {...attrs("cost")}
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              required
              value={draft.cost}
              onChange={(e) => change("cost", e.target.value)}
            />
          </Field>
        </div>
        <Field id="activity-notes" label="Notes & details" error={errors.notes}>
          <textarea
            {...attrs("notes")}
            maxLength={1000}
            rows={3}
            value={draft.notes}
            onChange={(e) => change("notes", e.target.value)}
            placeholder="The little things worth remembering."
          />
        </Field>
        <div className={styles.modalActions}>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.primary} type="submit">
            {activity ? "Apply changes" : "Add activity"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function BudgetForm({
  budget,
  onClose,
  onSave,
}: {
  budget: number;
  onClose: () => void;
  onSave: (value: number) => void;
}) {
  const [value, setValue] = useState(String(budget));
  const [error, setError] = useState("");
  return (
    <Modal
      title="A budget that feels right."
      description="Set your total trip allowance in USD. The planner counts activity estimates; remember to add any stay or transport costs as activities."
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const found = validateBudget(value);
          if (found) {
            setError(found);
            document.getElementById("edit-budget")?.focus();
            return;
          }
          onSave(parseUsdCents(value)! / 100);
        }}
      >
        <Field id="edit-budget" label="Overall budget (USD)" error={error}>
          <input
            id="edit-budget"
            type="number"
            step="0.01"
            min="0.01"
            max="1000000"
            required
            value={value}
            aria-invalid={!!error}
            aria-describedby={error ? "edit-budget-help" : undefined}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
          />
        </Field>
        <div className={styles.modalActions}>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.primary}>
            Update budget
          </button>
        </div>
      </form>
    </Modal>
  );
}
