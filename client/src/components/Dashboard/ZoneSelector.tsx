import "../../styles/ZoneSelector.css";

import { TOTAL_ZONES } from "../../utils/parkingUtils";
interface ZoneSelectorProps {
  selectedZoneId:    number;
  onZoneChange:      (id: number) => void;
}

export function ZoneSelector({ selectedZoneId, onZoneChange }: ZoneSelectorProps) {
  return (
    <section className="zone-selector">
      <div className="zone-selector__quick">
        <h3 className="zone-selector__title">구역 선택</h3>
      </div>
      <div className="zone-selector__manual">
        <span className="zone-selector__or">(1–{TOTAL_ZONES}):</span>
        <input
          className="zone-input"
          type="number"
          min={1}
          max={TOTAL_ZONES}
          value={selectedZoneId}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= 1 && v <= TOTAL_ZONES) onZoneChange(v);
          }}
        />
      </div>
    </section>
  );
}