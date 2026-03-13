import { ParkingSlot } from "./ParkingSlot";
import type { Slot } from "../types.ts";
import "../styles/ParkingGrid.css";

const AISLES_COUNT = 5;
const SLOTS_PER_AISLE = 20;
const SLOTS_PER_SIDE = SLOTS_PER_AISLE / 2;

interface ParkingGridProps {
  slots: Slot[]; 
  highlightedSlotName: string | null;
  zoomLevel: number;
}

interface AisleProps {
  aisleSlots: Slot[];
  highlightedSlotName: string | null;
}

//aisle: 1-2 columns of parking spaces
//lane: 주행도로 / 빈 공간

function groupIntoAisles(slots: Slot[]): Slot[][] {
  return Array.from({ length: AISLES_COUNT }, (_, i) => 
  slots.slice(i * SLOTS_PER_AISLE, (i+1) * SLOTS_PER_AISLE));
}

function SlotColumn({ slots, orientation, highlightedSlotName,
}: {
  slots: Slot[];
  orientation: "left" | "right";
  highlightedSlotName: string | null;
}) {
  return (
    <div className="parking-grid__column">
      {slots.map((slot) => (
        <ParkingSlot 
          key={slot.slotId}
          slotName={slot.slotName}
          isActive={slot.isActive}
          slotType={slot.category}
          licensePlate={slot.licensePlate}
          orientation={orientation}
          isHighlighted={slot.slotName === highlightedSlotName}/>
      ))}
    </div>
  )
}

function Aisle({ aisleSlots, highlightedSlotName }: AisleProps) {
  const topRow = aisleSlots.slice(0, SLOTS_PER_SIDE);
  const bottomRow = aisleSlots.slice(SLOTS_PER_SIDE);

  return (
    <div className="parking-grid__aisle">
      <SlotColumn slots={topRow} orientation="left" highlightedSlotName={highlightedSlotName} />
      <div className="parking-grid__lane" aria-hidden="true">
        <div className="parking-grid__lane--right" aria-hidden="true" />
      </div>
      <SlotColumn slots={bottomRow} orientation="right" highlightedSlotName={highlightedSlotName} />
    </div>
  );
}

export function ParkingGrid({ slots, highlightedSlotName, zoomLevel }: ParkingGridProps) {
  const aisles = groupIntoAisles(slots);

  return (
    <div className="parking-grid__scaler">
      <div
        style={{
          width:  `calc(var(--grid-w)  * ${zoomLevel})`,
          height: `calc(var(--grid-h) * ${zoomLevel})`,
          position: "relative",
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      >
        <div
          className="parking-grid"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left"}}
        >
          {aisles.map((aisleSlots, i) => (
            <Aisle key={i} aisleSlots={aisleSlots} highlightedSlotName={highlightedSlotName} />
          ))}
        </div>
      </div>
    </div>
  );
}