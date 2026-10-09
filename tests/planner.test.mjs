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
