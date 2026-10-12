export const destinationIds = [
  "dolomites",
  "liguria",
  "paris",
  "venice",
] as const;
export const categories = [
  "Outdoors",
  "Culture",
  "Food",
  "Transport",
  "Other",
] as const;
export const paces = ["Unhurried", "Balanced", "Full days"] as const;
export type Category = (typeof categories)[number];
export type Pace = (typeof paces)[number];
export type Activity = {
  id: string;
  title: string;
  time: string;
  category: Category;
  duration: number;
  cost: number;
  notes: string;
};
export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  custom: boolean;
};
export type Trip = {
  id: string;
  destinationId: string;
  name: string;
  start: string;
  end: string;
  pace: Pace;
  budget: number;
  demo: boolean;
  days: { date: string; activities: Activity[] }[];
  checklist: ChecklistItem[];
};
export type TripSession = { trips: Trip[]; activeId: string | null };
export type TripDraft = {
  destinationId: string;
  name: string;
  start: string;
  end: string;
  pace: string;
  budget: string;
};
export type ActivityDraft = {
  title: string;
  time: string;
  category: string;
  duration: string;
  cost: string;
  notes: string;
};
const DAY = 86400000;
function dateStamp(value: string) {
  const n = Date.parse(value + "T00:00:00Z");
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(n) &&
    new Date(n).toISOString().slice(0, 10) === value
    ? n
    : NaN;
}
export function dayCount(start: string, end: string) {
  return Math.round((dateStamp(end) - dateStamp(start)) / DAY) + 1;
}
// Parse decimal USD text before converting to the existing dollar-valued model.
// Exponents and fractions of a cent are deliberately not accepted.
export function parseUsdCents(value: string): number | null {
  const text = value.trim();
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole || "0") * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function validateBudget(value: string): string | undefined {
  const cents = parseUsdCents(value);
  if (cents === null || cents < 1 || cents > 100000000)
    return "Enter a USD budget from $0.01 to $1,000,000 with at most two decimal places (e.g. 12.30).";
}

function validateCost(value: string): string | undefined {
  const cents = parseUsdCents(value);
  if (cents === null || cents < 0 || cents > 100000000)
    return "Enter a USD estimate from $0 to $1,000,000 with at most two decimal places (e.g. 12.30).";
}

function toCents(value: number) {
  return Math.round(value * 100);
}

export function activityTotal(activities: Activity[]) {
  return activities.reduce((sum, activity) => sum + toCents(activity.cost), 0) / 100;
}

export function validateTrip(d: TripDraft) {
  const errors: Partial<Record<keyof TripDraft, string>> = {};
  if (!destinationIds.some((id) => id === d.destinationId))
    errors.destinationId = "Choose a destination.";
  if (!d.name.trim() || d.name.trim().length > 80)
    errors.name = "Give your trip a name of 1–80 characters.";
  if (!Number.isFinite(dateStamp(d.start)))
    errors.start = "Choose a valid start date.";
  if (!Number.isFinite(dateStamp(d.end)))
    errors.end = "Choose a valid end date.";
  if (
    !errors.start &&
    !errors.end &&
    (dayCount(d.start, d.end) < 1 || dayCount(d.start, d.end) > 30)
  )
    errors.end = "End date must be on or after the start, within 30 days.";
  const budgetError = validateBudget(d.budget);
  if (budgetError) errors.budget = budgetError;
  if (!paces.some((p) => p === d.pace)) errors.pace = "Choose a travel pace.";
  return errors;
}
export function validateActivity(d: ActivityDraft) {
  const errors: Partial<Record<keyof ActivityDraft, string>> = {};
  if (!d.title.trim() || d.title.trim().length > 100)
    errors.title = "Enter an activity name of 1–100 characters.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.time))
    errors.time = "Choose a valid time.";
  if (!categories.some((c) => c === d.category))
    errors.category = "Choose a category.";
  if (
    !Number.isInteger(Number(d.duration)) ||
    Number(d.duration) < 1 ||
    Number(d.duration) > 1440
  )
    errors.duration = "Enter a duration between 1 and 1,440 minutes.";
  const costError = validateCost(d.cost);
  if (costError) errors.cost = costError;
  if (d.notes.length > 1000)
    errors.notes = "Keep notes within 1,000 characters.";
  return errors;
}
export function createTrip(d: TripDraft, id: string): Trip {
  if (Object.keys(validateTrip(d)).length) throw new Error("Invalid trip");
  return {
    id,
    destinationId: d.destinationId,
    name: d.name.trim(),
    start: d.start,
    end: d.end,
    pace: d.pace as Pace,
    budget: parseUsdCents(d.budget)! / 100,
    demo: false,
    days: Array.from({ length: dayCount(d.start, d.end) }, (_, i) => ({
      date: new Date(dateStamp(d.start) + i * DAY).toISOString().slice(0, 10),
      activities: [],
    })),
    checklist: [
      "Passport and travel documents",
      "Transportation tickets",
      "Accommodation confirmation",
      "Comfortable walking shoes",
      "Weather-appropriate clothing",
      "Chargers and adapters",
    ].map((label, i) => ({
      id: `${id}-check-${i}`,
      label,
      done: false,
      custom: false,
    })),
  };
}
export type TripDetailsDraft = Omit<TripDraft, "budget">;

function validateTripDetails(trip: Trip, draft: TripDetailsDraft) {
  return validateTrip({ ...draft, budget: String(trip.budget) });
}

export function tripShorteningSummary(trip: Trip, draft: TripDetailsDraft) {
  if (Object.keys(validateTripDetails(trip, draft)).length)
    throw new Error("Invalid trip details");
  const removed = trip.days.slice(dayCount(draft.start, draft.end));
  return {
    days: removed.length,
    activities: removed.reduce((sum, day) => sum + day.activities.length, 0),
  };
}

export function updateTripDetails(
  trip: Trip,
  draft: TripDetailsDraft,
  confirmed = false,
): Trip {
  const removed = tripShorteningSummary(trip, draft);
  if (removed.activities && !confirmed)
    throw new Error("Shortening this trip requires confirmation");
  return {
    ...trip,
    name: draft.name.trim(),
    destinationId: draft.destinationId,
    start: draft.start,
    end: draft.end,
    pace: draft.pace as Pace,
    days: Array.from({ length: dayCount(draft.start, draft.end) }, (_, i) => ({
      date: new Date(dateStamp(draft.start) + i * DAY).toISOString().slice(0, 10),
      activities: trip.days[i]?.activities ?? [],
    })),
  };
}

export function upsertActivity(
  trip: Trip,
  day: number,
  activity: Activity,
): Trip {
  return {
    ...trip,
    days: trip.days.map((d, i) =>
      i !== day
        ? d
        : {
            ...d,
            activities: d.activities.some((a) => a.id === activity.id)
              ? d.activities.map((a) => (a.id === activity.id ? activity : a))
              : [...d.activities, activity],
          },
    ),
  };
}
export function removeActivity(trip: Trip, day: number, id: string): Trip {
  return {
    ...trip,
    days: trip.days.map((d, i) =>
      i !== day
        ? d
        : { ...d, activities: d.activities.filter((a) => a.id !== id) },
    ),
  };
}
export function moveActivity(
  trip: Trip,
  day: number,
  id: string,
  offset: number,
): Trip {
  const activities = trip.days[day]?.activities;
  const index = activities?.findIndex((a) => a.id === id) ?? -1;
  const target = index + offset;
  if (!activities || index < 0 || target < 0 || target >= activities.length)
    return trip;
  const copy = [...activities];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return {
    ...trip,
    days: trip.days.map((d, i) => (i !== day ? d : { ...d, activities: copy })),
  };
}
export function budgetSummary(trip: Trip) {
  const totals: Record<Category, number> = {
    Outdoors: 0,
    Culture: 0,
    Food: 0,
    Transport: 0,
    Other: 0,
  };
  for (const day of trip.days)
    for (const a of day.activities)
      totals[a.category] += toCents(a.cost);
  const cents = Object.values(totals).reduce((a, b) => a + b, 0);
  const spent = cents / 100;
  const budgetCents = toCents(trip.budget);
  return {
    spent,
    remaining: (budgetCents - cents) / 100,
    percent: (cents / budgetCents) * 100,
    categories: Object.fromEntries(
      Object.entries(totals).map(([k, v]) => [k, v / 100]),
    ) as Record<Category, number>,
  };
}
export function checklistSummary(trip: Trip) {
  return {
    done: trip.checklist.filter((i) => i.done).length,
    total: trip.checklist.length,
  };
}
export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
export function dateLabel(value: string, short = false) {
  return new Intl.DateTimeFormat("en-US", {
    month: short ? "short" : "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T00:00:00Z"));
}
