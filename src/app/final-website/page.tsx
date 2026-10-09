import type { Metadata } from "next";
import Planner from "./_components/Planner";
export const metadata: Metadata = {
  title: "The Quiet Way — Make room for the journey",
  description:
    "Discover a slower way to travel. Create day-by-day itineraries, track estimated budgets, and try a non-persistent, browser-only planning demo.",
};
export default function Page() {
  return <Planner />;
}
