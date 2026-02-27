/*
    parked car location search
 */

import { useState, useCallback } from "react";
import type { ParkingSlotData } from "../types/slot.types";

const HIGHLIGHT_DURATION_MS = 5_000;

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  highlightedSlotId: string;
  handleSearch: (allSlots: ParkingSlotData[], onFound: (zoneId: number) => void) => void;
}

export function useSearch(): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedSlotId, setHighlightedSlotId] = useState("");

  const handleSearch = useCallback(
    (allSlots: ParkingSlotData[], onFound: (zoneId: number) => void) => {
      const q = searchQuery.trim();
      if (!q) return;

      const found = allSlots.find((s) =>
        s.licensePlate?.toLowerCase().includes(q.toLowerCase())
      );

      if (found) {
        onFound(found.zoneId);
        setHighlightedSlotId(found.slotCode);
        setTimeout(() => setHighlightedSlotId(""), HIGHLIGHT_DURATION_MS);
      } else {
        alert("그런 차 없삼");
      }
    },
    [searchQuery]
  );

  return { searchQuery, setSearchQuery, highlightedSlotId, handleSearch };
}