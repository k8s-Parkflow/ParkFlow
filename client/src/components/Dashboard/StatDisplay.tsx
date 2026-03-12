import { CheckCircle, Zap, Accessibility } from "lucide-react";
import { StatPanel }   from "./StatPanel";
import { SearchPanel } from "./SearchPanel";
import type { Availability } from "../../types"; 
import type { SearchError } from "../../hooks/useSearch";
import "../../styles/StatDisplay.css";

interface StatDisplayProps {
  globalStats:   Availability;
  searchQuery:   string;
  isValidPlate: boolean,
  searchError: SearchError;
  onSearchChange:(q: string) => void;
  onSearch:      () => void;
}

export function StatDisplay({ globalStats, searchQuery, isValidPlate, searchError, onSearchChange, onSearch }: StatDisplayProps) {
  const { generalAvailable, generalCount, disabledAvailable, disabledCount, evAvailable, evCount } = globalStats;

  return (
    <section className="stats-row">
      <StatPanel
        category="hero"
        label="일반 주차석"
        value={generalAvailable}
        total={generalCount}
        fillPct={(generalAvailable / generalCount) * 100}
        sub={`전체 일반 주차석의 ${((generalAvailable / (generalCount || 1)) * 100).toFixed(0)}% 여유`}
        icon={CheckCircle}
        iconClass="stat-panel__icon--hero"
      />

      <StatPanel
        category="handicapped"
        label="장애인 주차석"
        value={disabledAvailable}
        total={disabledCount}
        sub="Available"
        icon={Accessibility}
        iconClass="stat-panel__icon--blue"
      />

      <StatPanel
        category="EV"
        label="EV 충전석"
        value={evAvailable}
        total={evCount}
        sub="Available"
        icon={Zap}
        iconClass="stat-panel__icon--purple"
      />

      <SearchPanel
        query={searchQuery}
        isValidPlate={isValidPlate}
        searchError={searchError}
        onChange={onSearchChange}
        onSearch={onSearch}
      />
    </section>
  );
}