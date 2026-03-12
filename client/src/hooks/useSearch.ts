import { useState, useCallback } from "react";

const PLATE_REGEX = /^\d{2,3}[가-힣]\s?\d{4}$/;

export type SearchError = "invalid_format" | "not_found" | null;

export interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isValidPlate: boolean;
  searchError: SearchError;
  highlightedSlotId: number | null;

  handleSearch: (onFound: (zoneId: number) => void) => Promise<void>;
}

function normalisePlate(p: string): string {
  return p.trim().replace(/\s+/g, " ");
}

export function useSearch(): UseSearchReturn {
  const [searchQuery, setSearchQueryBase] = useState("");
  const [searchError, setSearchError] = useState<SearchError>(null);
  const [highlightedSlotId, setHighlightedSlotId] = useState<number | null>(null);

  const isValidPlate = PLATE_REGEX.test(searchQuery.trim());

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryBase(q);
    setSearchError(null);
    setHighlightedSlotId(null);
  }, []);

  const handleSearch = useCallback(async (onFound: (zoneId: number) => void) => {
    if (!isValidPlate) {
      setSearchError("invalid_format");
      return;
    }
    const normQ = normalisePlate(searchQuery);
    try {
      const res = await fetch(`/api/parking/current/${encodeURIComponent(normQ)}`);
      if (res.status === 404) {
        setSearchError("not_found");
        return;
      }
      if (!res.ok) {
        throw new Error("Search request failed");
      }
      const data = await res.json();
      setSearchError(null);
      onFound(data.zone_id);
      setHighlightedSlotId(data.slot_id);
    } catch {
      setSearchError("not_found");
    }
  }, [searchQuery, isValidPlate]);

  return {
    searchQuery,
    setSearchQuery,
    isValidPlate,
    searchError,
    highlightedSlotId,
    handleSearch,
  };
}