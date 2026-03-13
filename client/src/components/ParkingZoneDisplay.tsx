import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { ParkingGrid } from "./ParkingGrid";
import type { Zone, Slot, Availability } from "../types.ts";
import { ZoneSelector } from "./ZoneSelector.tsx";
import "../styles/ParkingZoneDisplay.css";

interface ParkingZoneDisplayProps {
  selectedZoneId: number;
  onZoneChange: (id: number) => void;
  zone: Zone;
  zoneSlots: Slot[];
  zoneStats: Availability;
  highlightedSlotName: string | null;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

export function ParkingZoneDisplay({
  selectedZoneId,
  onZoneChange,
  zone,
  zoneSlots,
  zoneStats,
  highlightedSlotName,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: ParkingZoneDisplayProps) {
  return (
    <section className="zone-display">
      <div className="zone-display__header">
        <div className="zone-display__group">
          <span className="zone-badge">{zone.zoneId}</span>
          <div>
            <h2 className="zone-display__title">{zone.zoneName}</h2>
            <p className="zone-display__sub">
              {zoneStats.totalAvailable} 여유 / {zoneStats.totalCount} 전체
              &nbsp;·&nbsp; 일반 {zoneStats.generalAvailable}/{zoneStats.generalCount}
              &nbsp;·&nbsp; EV {zoneStats.evAvailable}/{zoneStats.evCount}
              &nbsp;·&nbsp; 장애인 {zoneStats.disabledAvailable}/{zoneStats.disabledCount}
            </p>
          </div>
        </div>

        <div className="zone-display__controls">
          <div className="zone-display__zoom">
            <button className="zoom-btn" onClick={onZoomOut}  disabled={zoomLevel <= MIN_ZOOM} aria-label="축소">
              <ZoomOut size={16} />
            </button>
            <button className="zoom-btn" onClick={onZoomReset} aria-label="원래 크기">
              <Maximize2 size={16} />
            </button>
            <button className="zoom-btn" onClick={onZoomIn}   disabled={zoomLevel >= MAX_ZOOM} aria-label="확대">
              <ZoomIn size={16} />
            </button>
            <span className="zoom-label">{Math.round(zoomLevel * 100)}%</span>
          </div>

          <ZoneSelector
            selectedZoneId={selectedZoneId}
            onZoneChange={onZoneChange}
          />
        </div>
        
      </div>

      <div
        className="zone-display__grid"
        style={{ height: `calc(var(--grid-natural-height) * ${zoomLevel})` }}
      >
        <ParkingGrid
          slots={zoneSlots}
          highlightedSlotName={highlightedSlotName}
          zoomLevel={zoomLevel}
        />
      </div>
    </section>
  );
}