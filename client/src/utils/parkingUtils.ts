import type { Slot, SlotType } from "../types.ts";
export const TOTAL_ZONES   = 100;
export const SLOTS_PER_ZONE = 100;

interface BaseSlot {
  slot_id:      number;
  zone_id:      number;
  slot_type_id: number;
  slot_code:    string;
}

interface SlotOccupancy {
  slot_id:       number;
  occupied:      boolean;
  vehicle_plate?: string;
}

const SLOT_TYPE_MAP: Record<number, SlotType> = {
  0: "GENERAL",
  1: "EV",
  2: "DISABLED",
};

// ─── Slot mapper ──────────────────────────────────────────────────────────────

export function mapToParkingSlotData(
  baseSlots:   BaseSlot[],
  occupancies: SlotOccupancy[],
): Slot[] {
  const occMap = new Map(occupancies.map((o) => [o.slot_id, o]));
  return baseSlots.map((slot) => {
    const occ = occMap.get(slot.slot_id);
    return {
      slotId:       slot.slot_id,
      slotCode:     slot.slot_code,
      zoneId:       slot.zone_id,
      category:     SLOT_TYPE_MAP[slot.slot_type_id] ?? "standard",
      isActive:     occ?.occupied ?? false,
      licensePlate: occ?.vehicle_plate,
    };
  });
}
