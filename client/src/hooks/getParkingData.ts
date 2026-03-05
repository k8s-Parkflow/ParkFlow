/**
 * getParkingData.ts
 *
 * Manages parking state using the real backend.
 * Structure is kept as close to the original as possible to minimise diff.
 *
 * Two-phase strategy:
 *   Phase 1 (once on mount): fetch per-type totals from zone 1
 *             → generalTotal / evTotal / disabledTotal are identical across all zones
 *             → stored in a ref, never re-fetched during polling
 *   Phase 2 (every 5 s):     fetch ZoneAvailabilityResponse[] for live counts
 *
 * TODO: replace setInterval with WebSocket / SSE when backend is ready
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import {
  fetchAllZonesAvailability,
  fetchZoneTypeAvailability,
} from "../services/parkingApi";

import type {
  Zone,
  ZoneAvailabilityResponse,
  ZoneTypeTotals,
  GlobalStats,
} from "../types";

const REFRESH_INTERVAL_MS = 5_000;
const REFERENCE_ZONE_ID      = 1;   // representative zone — totals identical across all
const TOTAL_ZONES = 100;

// ─── Global stats calculator ──────────────────────────────────────────────────

function calcGlobalStats(
  allZoneStats: ZoneAvailabilityResponse[],
  typeTotals:   ZoneTypeTotals,
): GlobalStats {
  const sums = allZoneStats.reduce(
    (acc, z) => ({
      totalAvailable:    acc.totalAvailable    + z.availableSlots,
      totalOccupied:     acc.totalOccupied     + z.occupiedSlots,
      generalAvailable:  acc.generalAvailable  + z.generalAvailable,
      evAvailable:       acc.evAvailable       + z.evAvailable,
      disabledAvailable: acc.disabledAvailable + z.disabledAvailable,
    }),
    { totalAvailable: 0, totalOccupied: 0, generalAvailable: 0, evAvailable: 0, disabledAvailable: 0 },
  );

  const generalTotal  = typeTotals.generalTotal  * TOTAL_ZONES;
  const evTotal       = typeTotals.evTotal        * TOTAL_ZONES;
  const disabledTotal = typeTotals.disabledTotal  * TOTAL_ZONES;

  return {
    totalSlots: generalTotal + evTotal + disabledTotal,
    generalTotal,
    evTotal,
    disabledTotal,
    ...sums,
  };
}

const EMPTY_GLOBAL_STATS: GlobalStats = {
  totalSlots: 0, generalTotal: 0, evTotal: 0, disabledTotal: 0,
  totalAvailable: 0, totalOccupied: 0,
  generalAvailable: 0, evAvailable: 0, disabledAvailable: 0,
};

// ─── Return type (same shape as the original hook) ────────────────────────────

interface GetParkingDataReturn {
  zones:             Zone[];
  allZoneStats:      ZoneAvailabilityResponse[];
  zoneStats:         ZoneAvailabilityResponse | null;
  zoneTotals:        ZoneTypeTotals | null;
  globalStats:       GlobalStats;
  lastUpdated:       Date;
  autoRefresh:       boolean;
  toggleAutoRefresh: () => void;
  selectedZoneId:    number;
  setSelectedZoneId: (id: number) => void;
  isLoading:         boolean;
  error:             string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function getParkingData(): GetParkingDataReturn {
  const [allZoneStats, setAllZoneStats] = useState<ZoneAvailabilityResponse[]>([]);
  const [zoneTotals,   setZoneTotals]   = useState<ZoneTypeTotals | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState(1);
  const [lastUpdated,    setLastUpdated]    = useState(new Date());
  const [autoRefresh,    setAutoRefresh]    = useState(true);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  // Ref so polling callback always sees latest totals without re-subscribing
  const zoneTotalsRef = useRef<ZoneTypeTotals | null>(null);

  // ── Phase 1: fetch per-type totals once ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadTotals() {
      try {
        const [general, ev, disabled] = await Promise.all([
          fetchZoneTypeAvailability(REFERENCE_ZONE_ID, "general"),
          fetchZoneTypeAvailability(REFERENCE_ZONE_ID, "ev"),
          fetchZoneTypeAvailability(REFERENCE_ZONE_ID, "disabled"),
        ]);
        const totals: ZoneTypeTotals = {
          generalTotal:  general.total,
          evTotal:       ev.total,
          disabledTotal: disabled.total,
        };
        if (!cancelled) {
          zoneTotalsRef.current = totals;
          setZoneTotals(totals);
        }
      } catch (err) {
        // Non-fatal — available counts still work; totals show 0 until resolved
        console.warn("Failed to load slot type totals:", err);
      }
    }
    loadTotals();
    return () => { cancelled = true; };
  }, []);

  // ── Phase 2: poll live availability counts ────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const data = await fetchAllZonesAvailability();
      setAllZoneStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch zone availability");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const zones = useMemo<Zone[]>(
    () => allZoneStats.map((z) => ({ zoneId: z.zoneId, zoneName: z.zoneName })),
    [allZoneStats],
  );

  const zoneStats = useMemo(
    () => allZoneStats.find((z) => z.zoneId === selectedZoneId) ?? null,
    [allZoneStats, selectedZoneId],
  );

  const globalStats = useMemo(
    () => zoneTotals && allZoneStats.length > 0
      ? calcGlobalStats(allZoneStats, zoneTotals)
      : EMPTY_GLOBAL_STATS,
    [allZoneStats, zoneTotals],
  );

  return {
    zones,
    allZoneStats,
    zoneStats,
    zoneTotals,
    globalStats,
    lastUpdated,
    autoRefresh,
    toggleAutoRefresh: () => setAutoRefresh((v) => !v),
    selectedZoneId,
    setSelectedZoneId,
    isLoading,
    error,
  };
}