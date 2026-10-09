import { createTrip, upsertActivity } from "./model";
export type Destination = {
  id: string;
  name: string;
  region: string;
  description: string;
  image: string;
  alt: string;
  daily: number;
  days: number;
  theme: string;
};
export const destinations: Destination[] = [
  {
    id: "dolomites",
    name: "The Dolomites",
    region: "South Tyrol, Italy",
    description: "Still water, mountain air, and a path with nowhere to hurry.",
    image: "/mood-boards/calm/mountain-lake.jpg",
    alt: "A wooden boathouse on a still lake below the Dolomite mountains",
    daily: 120,
    days: 3,
    theme: "By the mountains",
  },
  {
    id: "liguria",
    name: "The Ligurian coast",
    region: "Liguria, Italy",
    description:
      "Take the coastal path. Find a little table overlooking the sea.",
    image: "/mood-boards/editorial/coastal-village.jpg",
    alt: "Colorful Ligurian houses overlooking rocky cliffs and blue water",
    daily: 140,
    days: 4,
    theme: "Beside the sea",
  },
  {
    id: "paris",
    name: "Paris, slowly",
    region: "Île-de-France, France",
    description:
      "Bookshops, river walks, and an afternoon that belongs to you.",
    image: "/mood-boards/editorial/paris-river.jpg",
    alt: "The River Seine and the historic buildings of Paris",
    daily: 170,
    days: 4,
    theme: "A city at your pace",
  },
  {
    id: "venice",
    name: "A quieter Venice",
    region: "Veneto, Italy",
    description:
      "Beyond the busy squares, a city of small bridges and morning light.",
    image: "/mood-boards/editorial/venice-notes.jpg",
    alt: "Historic Venetian architecture along the water",
    daily: 150,
    days: 3,
    theme: "Along the water",
  },
];
export function makeDemo() {
  let trip = createTrip(
    {
      destinationId: "dolomites",
      name: "A little mountain escape",
      start: "2026-11-09",
      end: "2026-11-11",
      pace: "Unhurried",
      budget: "450",
    },
    "demo-dolomites",
  );
  trip = { ...trip, demo: true };
  const sample = [
    [
      {
        title: "A morning by Lake Braies",
        time: "09:00",
        category: "Outdoors",
        duration: 90,
        cost: 0,
        notes: "Take the lakeside path. Leave time to sit by the water.",
      },
      {
        title: "Lunch at a mountain inn",
        time: "12:30",
        category: "Food",
        duration: 75,
        cost: 28,
        notes:
          "A warm bowl of soup, something local, and a table outside if the weather allows.",
      },
      {
        title: "An afternoon to wander",
        time: "15:00",
        category: "Outdoors",
        duration: 120,
        cost: 0,
        notes: "An easy village walk. Keep the afternoon flexible.",
      },
    ],
    [
      {
        title: "Meadows and mountain views",
        time: "10:00",
        category: "Outdoors",
        duration: 150,
        cost: 25,
        notes:
          "Sample lift estimate. Check seasonal opening and trail conditions before travel.",
      },
      {
        title: "A slow café stop",
        time: "14:00",
        category: "Food",
        duration: 60,
        cost: 12,
        notes: "Coffee, cake, and a page of your book.",
      },
    ],
    [
      {
        title: "Village market & a final look",
        time: "09:30",
        category: "Culture",
        duration: 90,
        cost: 15,
        notes: "A few provisions and something small to remember the trip.",
      },
      {
        title: "Return journey",
        time: "13:00",
        category: "Transport",
        duration: 120,
        cost: 35,
        notes:
          "Illustrative train estimate; confirm your route before booking.",
      },
    ],
  ] as const;
  sample.forEach((day, i) =>
    day.forEach((a, j) => {
      trip = upsertActivity(trip, i, { ...a, id: `demo-${i}-${j}` });
    }),
  );
  return trip;
}
