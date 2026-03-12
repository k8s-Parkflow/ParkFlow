export interface Zone {
  zoneId: number;
  zoneName: string;
}

export interface ParkingSlot {
  slotId: number;
  slotName: string;
  category: SlotType;
  isActive: boolean;
  licensePlate: string | null;
}

export type SlotType = "GENERAL" | "EV" | "DISABLED";

export const SLOT_TYPE_MAP: Record<number, SlotType> = {
  0: "GENERAL",
  1: "EV",
  2: "DISABLED",
};

export interface Availability {
  totalCount: number;
  generalCount: number;
  evCount: number;
  disabledCount: number;

  totalAvailable: number;
  generalAvailable: number;
  evAvailable: number;
  disabledAvailable: number;
}

// export interface ZoneAvailabilityResponse {
//   zone_id: number;
//   slot_type: SlotType;
//   total_count: number;
//   occupied_count: number;
//   available_count: number;
//   updated_at: Date;
// }

export interface AvailabilityResponse {
  slotType?: SlotType;
  availableCount: number;
}

export interface CurrentParkingViewResponse {
  vehicle_num: string;
  history_id: number;
  zone_id: number;
  slot_id: number;
  entry_code: string;
  zone_name: string;
  slot_name: string;
  slot_type: SlotType;
  entry_at: Date;
  updated_at: Date;
}

export interface SlotData {
  slot_id: number;
  slot_name: string;
  category: SlotType;
  is_active: boolean;
  license_plate: string | null;
}

// export interface ZoneSlotsResponse {
//   zone_id: number;
//   slots: SlotData[];
// }