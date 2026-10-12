import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(
  new URL("../src/app/final-website/_components/model.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const m = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const draft = {
  destinationId: "dolomites",
  name: "Mountain days",
  start: "2026-11-01",
  end: "2026-11-03",
  pace: "Unhurried",
  budget: "600",
};
test("trip validation covers missing, impossible, reversed dates, duration and budget", () => {
  assert.deepEqual(m.validateTrip(draft), {});
  for (const update of [
    { name: " " },
    { destinationId: "" },
    { start: "2026-02-30" },
    { end: "2026-10-01" },
    { end: "2027-01-01" },
    { budget: "0" },
    { budget: "Infinity" },
  ])
    assert.ok(Object.keys(m.validateTrip({ ...draft, ...update })).length);
  assert.equal(m.dayCount("2026-12-31", "2027-01-02"), 3);
  assert.equal(m.dayCount("2026-11-01", "2026-11-01"), 1);
});
test("activity edits are day scoped; reordering and removal preserve other days", () => {
  const trip = m.createTrip(draft, "test");
  assert.equal(trip.days.length, 3);
  assert.equal(trip.demo, false);
  const a = {
    id: "a",
    title: "Walk",
    time: "09:00",
    category: "Outdoors",
    duration: 60,
    cost: 25,
    notes: "Trees",
  };
  const b = { ...a, id: "b", cost: 50 };
  let next = m.upsertActivity(trip, 0, a);
  next = m.upsertActivity(next, 0, b);
  next = m.upsertActivity(next, 1, { ...a, id: "c" });
  const moved = m.moveActivity(next, 0, "b", -1);
  assert.deepEqual(
    moved.days[0].activities.map((a) => a.id),
    ["b", "a"],
  );
  assert.equal(next.days[0].activities[0].id, "a");
  const edited = m.upsertActivity(moved, 0, { ...a, cost: 100 });
  assert.equal(m.budgetSummary(edited).spent, 175);
  const removed = m.removeActivity(edited, 0, "a");
  assert.equal(m.budgetSummary(removed).spent, 75);
  assert.equal(removed.days[1].activities.length, 1);
  assert.deepEqual(m.moveActivity(removed, 0, "b", -1), removed);
});
test("budget derives categories, remaining and over-budget amounts from activities", () => {
  let trip = m.createTrip({ ...draft, budget: "10" }, "test");
  trip = m.upsertActivity(trip, 0, {
    id: "a",
    title: "Lunch",
    time: "12:00",
    category: "Food",
    duration: 60,
    cost: 25,
    notes: "",
  });
  const s = m.budgetSummary(trip);
  assert.equal(s.spent, 25);
  assert.equal(s.remaining, -15);
  assert.equal(s.percent, 250);
  assert.equal(s.categories.Food, 25);
});
test("checklist completion follows in-memory checkbox and custom-item changes", () => {
  const trip = m.createTrip(draft, "test");
  const changed = {
    ...trip,
    checklist: trip.checklist.map((item, i) =>
      i === 0 ? { ...item, done: true } : item,
    ),
  };
  changed.checklist = [
    ...changed.checklist,
    { id: "custom", label: "Camera", done: false, custom: true },
  ];
  assert.deepEqual(m.checklistSummary(changed), { done: 1, total: 7 });
  assert.deepEqual(m.checklistSummary(trip), { done: 0, total: 6 });
  const removed = {
    ...changed,
    checklist: changed.checklist.filter((item) => item.id !== "custom"),
  };
  assert.deepEqual(m.checklistSummary(removed), { done: 1, total: 6 });
});
test("activity validation accepts free moments and rejects malformed fields", () => {
  const draft = {
    title: "A walk",
    time: "09:00",
    category: "Outdoors",
    duration: "60",
    cost: "0",
    notes: "",
  };
  assert.deepEqual(m.validateActivity(draft), {});
  for (const update of [
    { title: " " },
    { time: "25:00" },
    { category: "Unknown" },
    { duration: "1.5" },
    { duration: "0" },
    { duration: "1441" },
    { cost: "" },
    { cost: "-1" },
    { cost: "NaN" },
    { notes: "x".repeat(1001) },
  ])
    assert.ok(Object.keys(m.validateActivity({ ...draft, ...update })).length);
});
test("application source contains no persistence APIs or external data requests", () => {
  const root = new URL("../src/", import.meta.url);
  const forbidden =
    /\b(?:localStorage|sessionStorage|indexedDB|cookieStore)\b|document\.cookie|\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/;
  for (const file of readdirSync(root, { recursive: true })) {
    if (/\.(?:tsx?|css)$/.test(file))
      assert.doesNotMatch(
        readFileSync(new URL(file, root), "utf8"),
        forbidden,
        file,
      );
  }
});

test("trip detail edits preserve identity, budget, checklist and relative-day activities", () => {
  let trip = m.createTrip(draft, "original");
  const activity = { id: "kept", title: "Walk", time: "09:00", category: "Outdoors", duration: 60, cost: 12, notes: "Keep me" };
  trip = m.upsertActivity(trip, 0, activity);
  trip = m.upsertActivity(trip, 0, { ...activity, id: "second" });
  trip = m.upsertActivity(trip, 2, { ...activity, id: "last" });
  trip = { ...trip, demo: true, checklist: trip.checklist.map((item, i) => i === 0 ? { ...item, done: true } : item) };
  const original = structuredClone(trip);
  const details = { ...draft, name: "  Paris pause  ", destinationId: "paris", pace: "Balanced", start: "2026-12-31", end: "2027-01-04", budget: "999" };
  const next = m.updateTripDetails(trip, details);
  assert.equal(next.name, "Paris pause");
  assert.equal(next.destinationId, "paris");
  assert.equal(next.pace, "Balanced");
  assert.equal(next.start, details.start);
  assert.equal(next.end, details.end);
  assert.equal(next.id, trip.id);
  assert.equal(next.budget, trip.budget);
  assert.equal(next.demo, true);
  assert.deepEqual(next.checklist, trip.checklist);
  assert.deepEqual(next.days.map((d) => d.date), ["2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03", "2027-01-04"]);
  assert.deepEqual(next.days.slice(0, 3).map((d) => d.activities), trip.days.map((d) => d.activities));
  assert.deepEqual(next.days.slice(3).map((d) => d.activities), [[], []]);
  assert.deepEqual(trip, original);
});

test("shortening counts all removed days and activities and requires explicit confirmation", () => {
  let trip = m.createTrip(draft, "original");
  const a = { id: "tail", title: "Lunch", time: "12:00", category: "Food", duration: 60, cost: 20, notes: "" };
  trip = m.upsertActivity(trip, 2, a);
  const details = { ...draft, end: draft.start };
  const original = structuredClone(trip);
  assert.deepEqual(m.tripShorteningSummary(trip, details), { days: 2, activities: 1 });
  assert.throws(() => m.updateTripDetails(trip, details), /confirmation/i);
  assert.deepEqual(trip, original);
  const next = m.updateTripDetails(trip, details, true);
  assert.equal(next.days.length, 1);
  assert.equal(m.budgetSummary(next).spent, 0);
  assert.deepEqual(trip, original);
  const empty = m.createTrip(draft, "empty");
  assert.equal(m.updateTripDetails(empty, details).days.length, 1);
  assert.deepEqual(m.tripShorteningSummary(empty, { ...draft, end: "2026-11-05" }), { days: 0, activities: 0 });
});

test("trip detail updates reject invalid fields and retain one-to-thirty-day limits", () => {
  const trip = m.createTrip(draft, "original");
  for (const update of [{ name: " " }, { destinationId: "unknown" }, { pace: "unknown" }, { start: "2026-02-30" }, { end: "2026-10-31" }, { end: "2026-12-01" }]) {
    assert.throws(() => m.updateTripDetails(trip, { ...draft, ...update }, true), /Invalid trip/);
  }
  assert.equal(m.updateTripDetails(trip, { ...draft, end: "2026-11-30" }).days.length, 30);
});
