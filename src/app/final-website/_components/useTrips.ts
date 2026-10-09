"use client";
import { useState } from "react";
import { makeDemo } from "./data";
import type { Trip, TripSession } from "./model";

// React owns this page's temporary state. A remount starts a fresh demo.
export function useTrips() {
  const [session, setSession] = useState<TripSession>(() => ({
    trips: [makeDemo()],
    activeId: null,
  }));
  function selectTrip(id: string) {
    setSession((current) => ({ ...current, activeId: id }));
  }
  function updateTrip(trip: Trip) {
    setSession((current) => ({
      ...current,
      trips: current.trips.map((t) => (t.id === trip.id ? trip : t)),
    }));
  }
  function addTrip(trip: Trip) {
    setSession((current) => ({
      trips: [...current.trips, trip],
      activeId: trip.id,
    }));
  }
  function deleteTrip(id: string) {
    setSession((current) => ({
      trips: current.trips.filter((t) => t.id !== id),
      activeId: current.activeId === id ? null : current.activeId,
    }));
  }
  function restoreDemo() {
    const demo = makeDemo();
    setSession((current) => ({
      trips: [...current.trips.filter((t) => t.id !== demo.id), demo],
      activeId: demo.id,
    }));
  }
  return { session, selectTrip, updateTrip, addTrip, deleteTrip, restoreDemo };
}
