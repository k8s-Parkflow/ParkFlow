/*
    manages parking state and simulates real-time refresh loop
    must replace generateMockData() / the interval with real calls for integration w/ backend later
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Zone, ParkingSlot, GlobalStats, CurrentParkingViewResponse, ZoneAvailabilityResponse, ZoneSlotsResponse } from "../types.ts";
import { TOTAL_ZONES } from "../App.tsx";

const REFRESH_INTERVAL_MS = 5_000;
const EVENTS_PER_TICK = () => Math.floor(Math.random() * 4) + 2;

export function calcGlobalStats(allZoneStats: ZoneAvailabilityResponse[]): GlobalStats {
  const sums = allZoneStats.reduce(
    (acc, z) => {
      if (z.slot_type === "GENERAL") {
        acc.generalCount += z.total_count;
        acc.generalAvailable += z.available_count;
      }
      else if (z.slot_type === "EV") {
        acc.evCount += z.total_count;
        acc.evAvailable += z.available_count;
      } 
      else if (z.slot_type === "DISABLED") {
        acc.disabledCount += z.total_count;
        acc.disabledAvailable += z.available_count;
      }
      return acc;
    },
    {
      generalCount: 0,
      evCount: 0,
      disabledCount: 0,
      generalAvailable: 0,
      evAvailable: 0,
      disabledAvailable: 0,
    }
  );

  return {
    ...sums,
    totalCount: sums.generalCount + sums.evCount + sums.disabledCount,
    totalAvailable: sums.generalAvailable + sums.evAvailable + sums.disabledAvailable,
  };
}

interface GetParkingDataReturn {
  zones: Zone[];
  zoneSlots: ParkingSlot[];
  zoneStats: ZoneAvailabilityResponse;
  globalStats: GlobalStats;
  lastUpdated: Date;
  autoRefresh: boolean;
  toggleAutoRefresh: () => void;
  selectedZoneId: number;
  setSelectedZoneId: (id: number) => void;
  isLoading:         boolean;
  error:             string | null;
}

export function getParkingData(): GetParkingDataReturn {
  const [zoneSlots, setZoneSlots] = useState<ZoneSlotsResponse>();
  const [zoneStats, setZoneStats] = useState<ZoneAvailabilityResponse>();
  const [globalStats, setGlobalStats] = useState<ZoneAvailabilityResponse[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState(1);
  const [lastUpdated,    setLastUpdated]    = useState(new Date());
  const [autoRefresh,    setAutoRefresh]    = useState(true);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetch("/api/parking/availability/all").then((res) => res.json());
      setGlobalStats(data);
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

  // real-time updates

  return {
    zones: ,
    zoneSlots,
    zoneStats,
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