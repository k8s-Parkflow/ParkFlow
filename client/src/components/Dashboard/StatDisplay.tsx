import { CheckCircle, Zap, Accessibility } from "lucide-react";
import { StatPanel }   from "./StatPanel";
import { SearchPanel } from "./SearchPanel";
import type { GlobalStats } from "../../utils/parkingUtils";
import "../../styles/StatDisplay.css";

interface StatDisplayProps {
  globalStats:   GlobalStats;
  searchQuery:   string;
  onSearchChange:(q: string) => void;
  onSearch:      () => void;
}

export function StatDisplay({ globalStats, searchQuery, onSearchChange, onSearch }: StatDisplayProps) {
  const { generalAvailable, generalTotal, disabledAvailable, disabledTotal, evAvailable, evTotal } = globalStats;

  return (
    <section className="stats-row">
      <StatPanel
        hero
        label="일반 주차석"
        value={generalAvailable}
        total={generalTotal}
        sub={`전체 일반 주차석의 ${((generalAvailable / (generalTotal || 1)) * 100).toFixed(0)}% 여유`}
        icon={CheckCircle}
        iconClass="stat-panel__icon--hero"
      />

      <StatPanel
        label="장애인 주차석"
        value={disabledAvailable}
        total={disabledTotal}
        sub="가용"
        icon={Accessibility}
        iconClass="stat-panel__icon--blue"
      />

      <StatPanel
        label="EV 충전석"
        value={evAvailable}
        total={evTotal}
        sub="가용"
        icon={Zap}
        iconClass="stat-panel__icon--purple"
      />

      <SearchPanel
        query={searchQuery}
        onChange={onSearchChange}
        onSearch={onSearch}
      />
    </section>
  );
}