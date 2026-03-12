// /*
//   Parking data hook
//   - Fetches slots from backend
//   - Computes availability per zone and globally
//   - Handles auto refresh
// */

// import { useState, useEffect, useCallback, useRef, useMemo } from "react";
// import type { Zone, ParkingSlot, SlotData, Availability } from "../types";
// import { TOTAL_ZONES } from "../App";

// const REFRESH_INTERVAL_MS = 5000;

// /* ----------------------------- helpers ----------------------------- */

// function buildZones(total: number): Zone[] {
//   return Array.from({ length: total }, (_, i) => ({
//     zoneId: i + 1,
//     zoneName: `Zone ${i + 1}`,
//   }));
// }

// function mapToParkingSlot(slot: SlotData): ParkingSlot {
//   return {
//     slotId: slot.slot_id,
//     slotName: slot.slot_name,
//     category: slot.category,
//     isActive: slot.is_active,
//     licensePlate: slot.license_plate,
//   };
// }

// function computeAvailability(slots: SlotData[]): Availability {
//   const stats = {
//     generalCount: 0,
//     evCount: 0,
//     disabledCount: 0,

//     generalAvailable: 0,
//     evAvailable: 0,
//     disabledAvailable: 0,
//   };

//   for (const s of slots) {
//     const available = s.is_active && !s.license_plate;

//     if (s.category === "GENERAL") {
//       stats.generalCount++;
//       if (available) stats.generalAvailable++;
//     }

//     if (s.category === "EV") {
//       stats.evCount++;
//       if (available) stats.evAvailable++;
//     }

//     if (s.category === "DISABLED") {
//       stats.disabledCount++;
//       if (available) stats.disabledAvailable++;
//     }
//   }

//   return {
//     ...stats,
//     totalCount:
//       stats.generalCount +
//       stats.evCount +
//       stats.disabledCount,

//     totalAvailable:
//       stats.generalAvailable +
//       stats.evAvailable +
//       stats.disabledAvailable,
//   };
// }

// /* ----------------------------- api ----------------------------- */

// async function fetchZoneSlots(zoneId: number): Promise<SlotData[]> {
//   const res = await fetch(`/zones/${zoneId}/slots`);

//   if (!res.ok) {
//     throw new Error(`zone ${zoneId} slots fetch failed: ${res.status}`);
//   }

//   const data = await res.json();

//   return data.slots;
// }

// async function fetchAllZones(): Promise<Record<number, SlotData[]>> {
//   const results: Record<number, SlotData[]> = {};

//   await Promise.all(
//     Array.from({ length: TOTAL_ZONES }, (_, i) => i + 1).map(async (zoneId) => {
//       results[zoneId] = await fetchZoneSlots(zoneId);
//     })
//   );

//   return results;
// }

// /* ----------------------------- hook ----------------------------- */

// interface GetParkingDataReturn {
//   zones: Zone[];

//   zoneSlots: ParkingSlot[];

//   zoneStats: Availability;
//   globalStats: Availability;

//   lastUpdated: Date;

//   autoRefresh: boolean;
//   toggleAutoRefresh: () => void;

//   selectedZoneId: number;
//   setSelectedZoneId: (id: number) => void;

//   isLoading: boolean;
//   error: string | null;
// }

// export function getParkingData(): GetParkingDataReturn {
//   const zones = useMemo(() => buildZones(TOTAL_ZONES), []);

//   const [allSlotsByZone, setAllSlotsByZone] =
//     useState<Record<number, SlotData[]>>({});

//   const [selectedZoneId, setSelectedZoneId] =
//     useState<number>(1);

//   const [lastUpdated, setLastUpdated] =
//     useState<Date>(new Date());

//   const [autoRefresh, setAutoRefresh] =
//     useState<boolean>(true);

//   const [isLoading, setIsLoading] =
//     useState<boolean>(true);

//   const [error, setError] =
//     useState<string | null>(null);

//   const selectedZoneIdRef = useRef(selectedZoneId);

//   useEffect(() => {
//     selectedZoneIdRef.current = selectedZoneId;
//   }, [selectedZoneId]);

//   /* ---------------- fetch logic ---------------- */

//   const fetchAll = useCallback(async () => {
//     try {
//       const allSlots = await fetchAllZones();

//       setAllSlotsByZone(allSlots);
//       setLastUpdated(new Date());
//       setError(null);
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Failed to fetch parking data"
//       );
//     }
//   }, []);

//   /* initial load */

//   useEffect(() => {
//     setIsLoading(true);

//     fetchAll().finally(() => setIsLoading(false));
//   }, [fetchAll]);

//   /* auto refresh */

//   useEffect(() => {
//     if (!autoRefresh) return;

//     const id = setInterval(fetchAll, REFRESH_INTERVAL_MS);

//     return () => clearInterval(id);
//   }, [autoRefresh, fetchAll]);

//   /* ---------------- derived data ---------------- */

//   const zoneSlots = useMemo<ParkingSlot[]>(() => {
//     const slots = allSlotsByZone[selectedZoneId] ?? [];

//     return slots.map(mapToParkingSlot);
//   }, [allSlotsByZone, selectedZoneId]);

//   const zoneStats = useMemo<Availability>(() => {
//     const slots = allSlotsByZone[selectedZoneId] ?? [];

//     return computeAvailability(slots);
//   }, [allSlotsByZone, selectedZoneId]);

//   const globalStats = useMemo<Availability>(() => {
//     const allSlots = Object.values(allSlotsByZone).flat();

//     return computeAvailability(allSlots);
//   }, [allSlotsByZone]);

//   /* ---------------- return ---------------- */

//   return {
//     zones,

//     zoneSlots,

//     zoneStats,
//     globalStats,

//     lastUpdated,

//     autoRefresh,
//     toggleAutoRefresh: () =>
//       setAutoRefresh((v) => !v),

//     selectedZoneId,
//     setSelectedZoneId,

//     isLoading,
//     error,
//   };
// }