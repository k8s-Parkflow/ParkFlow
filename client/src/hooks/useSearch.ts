/*
    parked car location search
 */

import { useState, useCallback } from "react";

const PLATE_REGEX = /^\d{2,3}[가-힣]\s?\d{4}$/;
export type SearchError = "invalid_format" | "not_found" | "server_error" | null;

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<SearchError>(null);
  const [highlightedSlotId, setHighlightedSlotId] = useState("");
 
  const handleSearch = useCallback(async (onFound: (zoneId: number) => void) => {
    if (!PLATE_REGEX.test(searchQuery.trim())) {
      setSearchError("invalid_format");
      return;
    }

    try {
      const response = await fetch(`/zones/vehicles/${searchQuery}/current-parking`);
      const result = await response.json();

      if (result.data) {
        // result.data matches CurrentParkingLocationResponse
        const foundZoneId = parseInt(result.data.zone_id);
        onFound(foundZoneId); // Navigate the UI to the correct zone
        setHighlightedSlotId(result.data.slot_name); // Highlight the specific slotCode
        setSearchError(null);
      } else {
        setSearchError("not_found");
      }
    } catch (err) {
      setSearchError("server_error");
    }
  }, [searchQuery]);

  return { 
    searchQuery, 
    setSearchQuery, 
    searchError, 
    highlightedSlotId, 
    handleSearch, 
  };
}