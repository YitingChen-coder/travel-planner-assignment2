import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Planner — UI/UX & Visual Design",
  description:
    "A visual design study for Travel Planner: three mood boards, three design systems, and one considered travel-planning experience.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
