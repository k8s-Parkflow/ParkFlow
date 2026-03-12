/*
    manages parking state and simulates real-time refresh loop
    must replace generateMockData() / the interval with real calls for integration w/ backend later
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Zone, ParkingSlot, SlotData, Availability } from "../types.ts";
import { TOTAL_ZONES } from "../App.tsx";

const REFRESH_INTERVAL_MS = 5_000;

// POSSIBLE ISSUE: zoneId may not align with db
function buildZones(total: number): Zone[] {
  return Array.from({ length: total }, (_, i) => ({
    zoneId: i + 1,
    zoneName: `${i + 1}`,
  }));
}

function mapToParkingSlot(s: SlotData): ParkingSlot {
  return {
    slotId:       s.slot_id,
    slotName:     s.slot_name,
    category:     s.category,
    isActive:     s.is_active,
    licensePlate: s.license_plate,
  };
}

// GET /api/parking/availability/
// returns { slot_type?: SlotType, availableCount: number }
async function fetchTypedAvailability(slotType: string = ""): Promise<number> {
  const url = `/api/parking/availability/${slotType ? `?slot_type=${slotType}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed for ${slotType || "TOTAL"}`);
  const data = await res.json();
  return data.availableCount;
}

// get ZoneSlotsResponse for all zones
async function fetchGlobalAvailability(): Promise<Availability> {
  const [
    totalAvailable,
    generalAvailable,
    evAvailable,
    disabledAvailable,
  ] = await Promise.all([
    fetchTypedAvailability(),
    fetchTypedAvailability("GENERAL"),
    fetchTypedAvailability("EV"),
    fetchTypedAvailability("DISABLED"),
  ]);

  return {
    totalCount: 0,
    generalCount: 0,
    evCount: 0,
    disabledCount: 0,

    totalAvailable,
    generalAvailable,
    evAvailable,
    disabledAvailable,
  };
}

// GET zones/<zone_id>/slots/
// Returns ZoneSlotsResponse { zone_id: number, slots: SlotData[] }
async function fetchZoneSlots(zoneId: number): Promise<SlotData[]> {
  const res = await fetch(`/zones/${zoneId}/slots/`);
  if (!res.ok) throw new Error(`zone slots fetch failed: ${res.status}`);
  const data = await res.json();
  return data.slots;
}

interface GetParkingDataReturn {
  zones: Zone[];
  zoneSlots: ParkingSlot[];
  globalStats: Availability;
  lastUpdated: Date;
  autoRefresh: boolean;
  toggleAutoRefresh: () => void;
  selectedZoneId: number;
  setSelectedZoneId: (id: number) => void;
  isLoading:         boolean;
  error:             string | null;
}

export function getParkingData(): GetParkingDataReturn {
  const zones = useMemo(() => buildZones(TOTAL_ZONES), []);
  
  const [globalStats, setGlobalStats] =
    useState<Availability>({
      totalCount: 0,
      generalCount: 0,
      evCount: 0,
      disabledCount: 0,

      totalAvailable: 0,
      generalAvailable: 0,
      evAvailable: 0,
      disabledAvailable: 0,
    });

  // All SlotData for currently selected zone
  const [allZoneSlots, setAllZoneSlots] = useState<SlotData[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [lastUpdated,    setLastUpdated]    = useState<Date>(new Date());
  const [autoRefresh,    setAutoRefresh]    = useState<boolean>(true);
  const [isLoading,      setIsLoading]      = useState<boolean>(true);
  const [error,          setError]          = useState<string | null>(null);

  const selectedZoneIdRef = useRef(selectedZoneId);
  useEffect(() => { selectedZoneIdRef.current = selectedZoneId; }, [selectedZoneId]);

  const fetchAll = useCallback(async (zoneId: number) => {
    try {
      const [availability, slots] = await Promise.all([
        fetchGlobalAvailability(),
        fetchZoneSlots(zoneId),
      ]);
      setGlobalStats(availability);
      setAllZoneSlots(slots);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch parking data");
    }
  }, []);

  // initial load
  useEffect(() => {
    setIsLoading(true);
    fetchAll(selectedZoneId).finally(() => setIsLoading(false));
  }, []);

  // poll every 5 s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(
      () => fetchAll(selectedZoneIdRef.current),
      REFRESH_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [autoRefresh, fetchAll]);

  // when zone change
  const handleSetSelectedZoneId = useCallback(
    (id: number) => {
      setSelectedZoneId(id);
      fetchAll(id);
    },
    [fetchAll]
  );

  // convert SlotData to ParkingSlot
  const zoneSlots = useMemo<ParkingSlot[]>(() => {
    return allZoneSlots.map(mapToParkingSlot);
  }, [allZoneSlots]);

  return {
    zones,
    zoneSlots,
    globalStats,
    lastUpdated,
    autoRefresh,
    toggleAutoRefresh: () => setAutoRefresh((v) => !v),
    selectedZoneId,
    setSelectedZoneId: handleSetSelectedZoneId,
    isLoading,
    error,
  };
}