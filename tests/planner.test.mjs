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

test("USD validation rejects excessive precision and non-decimal notation consistently", () => {
  const activity = { title: "Lunch", time: "12:00", category: "Food", duration: "60", cost: "1", notes: "" };
  for (const value of ["0.001", "0.004", "1.005", "1.000", "1000000.001", "1e2", "0x10", "NaN", "Infinity", "", " ", "-1", "1,000", "1.2.3"]) {
    assert.ok(m.validateTrip({ ...draft, budget: value }).budget, value);
    assert.ok(m.validateActivity({ ...activity, cost: value }).cost, value);
    assert.ok(m.validateBudget(value), value);
  }
  for (const value of ["0.01", "0.1", "1", "1.00", "1.23", ".50", "1.", " 12.30 ", "1000000", "1000000.00"]) {
    assert.equal(m.validateTrip({ ...draft, budget: value }).budget, undefined, value);
    assert.equal(m.validateActivity({ ...activity, cost: value }).cost, undefined, value);
    assert.equal(m.validateBudget(value), undefined, value);
  }
  assert.ok(m.validateBudget("0"));
  assert.equal(m.validateActivity({ ...activity, cost: "0.00" }).cost, undefined);
  assert.ok(m.validateBudget("1000000.01"));
  assert.ok(m.validateActivity({ ...activity, cost: "1000000.01" }).cost);
  assert.match(m.validateBudget("0.001"), /two decimal places/);
  assert.match(m.validateActivity({ ...activity, cost: "0.004" }).cost, /two decimal places/);
});

test("USD parsing converts decimal text exactly to cents", () => {
  assert.equal(m.parseUsdCents("1.23"), 123);
  assert.equal(m.parseUsdCents(".29"), 29);
  assert.equal(m.parseUsdCents(" 001.2 "), 120);
  assert.equal(m.parseUsdCents("0"), 0);
  assert.equal(m.parseUsdCents("1000000.00"), 100000000);
  for (const value of ["0.004", "1e2", "-0.01", "", "999999999999999999999999"]) assert.equal(m.parseUsdCents(value), null);
});

test("daily, category and trip totals share cents arithmetic without mutating valid data", () => {
  let trip = m.createTrip({ ...draft, budget: "0.60" }, "precision");
  const activity = { id: "a", title: "Lunch", time: "12:00", category: "Food", duration: 60, cost: 0.1, notes: "" };
  trip = m.upsertActivity(trip, 0, activity);
  trip = m.upsertActivity(trip, 0, { ...activity, id: "b", cost: 0.2 });
  trip = m.upsertActivity(trip, 1, { ...activity, id: "c", category: "Transport", cost: 0.29 });
  const before = structuredClone(trip);
  assert.equal(m.activityTotal(trip.days[0].activities), 0.3);
  assert.deepEqual(m.budgetSummary(trip), { spent: 0.59, remaining: 0.01, percent: 0.59 / 0.6 * 100, categories: { Outdoors: 0, Culture: 0, Food: 0.3, Transport: 0.29, Other: 0 } });
  assert.deepEqual(trip, before);
  trip = m.upsertActivity(trip, 1, { ...activity, id: "c", category: "Transport", cost: 0.3 });
  assert.equal(m.budgetSummary(trip).remaining, 0);
  assert.equal(m.budgetSummary(trip).percent, 100);
  trip = m.upsertActivity(trip, 1, { ...activity, id: "c", category: "Transport", cost: 0.31 });
  assert.equal(m.budgetSummary(trip).remaining, -0.01);
  assert.equal(m.activityTotal([]), 0);
  assert.equal(m.activityTotal(Array.from({ length: 1000 }, () => ({ ...activity, cost: 0.01 }))), 10);
  assert.equal(m.activityTotal([{ ...activity, cost: 1000000 }, { ...activity, cost: 1000000 }]), 2000000);
  assert.equal(before.budget, 0.6);
  assert.deepEqual(before.days[0].activities, [activity, { ...activity, id: "b", cost: 0.2 }]);
});

test("trip card dates identify same-year, cross-year and single-day journeys", () => {
  assert.equal(m.dateRangeLabel("2026-11-01", "2026-11-03"), "Nov 1 – Nov 3, 2026");
  assert.equal(m.dateRangeLabel("2027-11-01", "2027-11-03"), "Nov 1 – Nov 3, 2027");
  assert.equal(m.dateRangeLabel("2026-12-31", "2027-01-02"), "Dec 31, 2026 – Jan 2, 2027");
  assert.equal(m.dateRangeLabel("2028-02-29", "2028-03-01"), "Feb 29 – Mar 1, 2028");
  assert.equal(m.dateRangeLabel("2026-11-01", "2026-11-01"), "Nov 1, 2026");
});
