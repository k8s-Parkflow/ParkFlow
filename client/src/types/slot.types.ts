//Parking slot default
export interface BaseSlot {
  slot_id: number;
  zone_id: number;
  slot_type_id: number;
  slot_code: string;
  is_active: boolean;
}

export interface SlotOccupancy {
  slot_id: number;
  occupied: boolean;
  vehicle_plate?: string;
}

// Updated Slot interface used throughout the front
export type SlotType = "standard" | "EV" | "handicapped";

export const SLOT_TYPE_MAP: Record<number, SlotType> = {
  0: "standard",
  1: "EV",
  2: "handicapped",
};

export interface ParkingSlotData {
  slotId: number;
  slotCode: string;
  zoneId: number;
  slotType: SlotType;
  isActive: boolean;
  licensePlate?: string;
}
