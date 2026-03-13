import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Zone, Slot, SlotData, Availability } from "../types.ts";
import { TOTAL_ZONES, EV_PER_ZONE, DISABLED_PER_ZONE, SLOTS_PER_ZONE } from "../App.tsx";

const REFRESH_INTERVAL_MS = 5_000;

//POSSIBLE ERROR !! 
function buildZones(total: number): Zone[] {
  return Array.from({ length: total }, (_, i) => ({
    zoneId: i + 1,
    zoneName: `${i + 1}`,
  }));
}

function mapToSlot(s: SlotData): Slot {
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
async function fetchTypedAvailability(slotType = "", signal?: AbortSignal): Promise<number> {
  const url = `/api/parking/availability/${slotType ? `?slot_type=${slotType}` : ""}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Fetch failed for ${slotType || "TOTAL"}`);
  return (await res.json()).availableCount;
}

// get total availability (sum of all zones)
async function fetchGlobalAvailability(signal?: AbortSignal): Promise<Availability> {
  const [totalAvailable, generalAvailable, evAvailable, disabledAvailable] =
    await Promise.all([
      fetchTypedAvailability("", signal),
      fetchTypedAvailability("GENERAL", signal),
      fetchTypedAvailability("EV", signal),
      fetchTypedAvailability("DISABLED", signal),
    ]);

  return {
    totalCount:    TOTAL_ZONES * SLOTS_PER_ZONE,
    generalCount:  TOTAL_ZONES * (SLOTS_PER_ZONE - EV_PER_ZONE - DISABLED_PER_ZONE),
    evCount:       EV_PER_ZONE * TOTAL_ZONES,
    disabledCount: DISABLED_PER_ZONE * TOTAL_ZONES,
    totalAvailable,
    generalAvailable,
    evAvailable,
    disabledAvailable,
  };
}

// GET zones/<zone_id>/slots/
// Returns ZoneSlotsResponse { zone_id: number, slots: SlotData[] }
async function fetchZoneSlots(zoneId: number, signal?: AbortSignal): Promise<SlotData[]> {
  const res = await fetch(`/zones/${zoneId}/slots/`, { signal });
  if (!res.ok) throw new Error(`Zone slots fetch failed: ${res.status}`);
  return (await res.json()).slots;
}

interface UseParkingDataReturn {
  zones: Zone[];
  zoneSlots: Slot[];
  globalStats: Availability;
  lastUpdated: Date;
  autoRefresh: boolean;
  toggleAutoRefresh: () => void;
  selectedZoneId: number;
  setSelectedZoneId: (id: number) => void;
  isLoading: boolean;
  error: string | null;
}

const EMPTY_AVAILABILITY: Availability = {
  totalCount: 0, generalCount: 0, evCount: 0, disabledCount: 0,
  totalAvailable: 0, generalAvailable: 0, evAvailable: 0, disabledAvailable: 0,
};

// renamed from getParkingData
export function useParkingData(): UseParkingDataReturn {
  const zones = useMemo(() => buildZones(TOTAL_ZONES), []);

  const [globalStats,    setGlobalStats]    = useState<Availability>(EMPTY_AVAILABILITY);
  const [allZoneSlots,   setAllZoneSlots]   = useState<SlotData[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState(1);
  const [lastUpdated,    setLastUpdated]    = useState(() => new Date());
  const [autoRefresh,    setAutoRefresh]    = useState(true);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  const selectedZoneIdRef = useRef(selectedZoneId);
  useEffect(() => { selectedZoneIdRef.current = selectedZoneId; }, [selectedZoneId]);

  const fetchAll = useCallback(async (zoneId: number, signal?: AbortSignal) => {
    try {
      const [availability, slots] = await Promise.all([
        fetchGlobalAvailability(signal),
        fetchZoneSlots(zoneId, signal),
      ]);
      setGlobalStats(availability);
      setAllZoneSlots(slots);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch parking data");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    fetchAll(selectedZoneId, controller.signal).finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [fetchAll]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetchAll(selectedZoneIdRef.current);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, fetchAll]);

  const handleSetSelectedZoneId = useCallback((id: number) => {
    const controller = new AbortController();
    setSelectedZoneId(id);
    setIsLoading(true);
    fetchAll(id, controller.signal).finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [fetchAll]);

  const zoneSlots = useMemo(() => allZoneSlots.map(mapToSlot), [allZoneSlots]);

  return {
    zones,
    zoneSlots,
    globalStats,
    lastUpdated,
    autoRefresh,
    toggleAutoRefresh: () => setAutoRefresh(v => !v),
    selectedZoneId,
    setSelectedZoneId: handleSetSelectedZoneId,
    isLoading,
    error,
  };
}