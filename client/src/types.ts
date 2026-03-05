// Backend API Response
// Endpoint: GET /zones/availability
// GET /zones/{zoneId}/availability

export interface ZoneAvailabilityResponse {
  zoneId: number;
  zoneName: string;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  generalAvailable: number;
  evAvailable: number;
  disabledAvailable: number;
}

//GET /zones/{zoneID}/availability/general
//GET /zones/{zoneID}/availability/ev
//GET /zones/{zoneID}/availability/disabled
export interface TypeAvailabilityResponse {
  zoneId: number;
  category: SlotType;
  total: number;
  occupied: number;
  available: number;
}

//uses snake_case instead of camelCase
export interface CurrentParkingLocationResponse {
  zone_id: string;
  slot_name: string;
}

export interface ApiEnvelope<T> {
  isSuccess: boolean;
  code:      string;
  message:   string;
  data:      T;
}


//Derived Typesssss

//type totals for each zone
//fetched once and not re-fetched
export interface ZoneTypeTotals {
  generalTotal:  number;
  evTotal:       number;
  disabledTotal: number;
}

export interface GlobalTypeStats {
  //derived from ZoneTypeTotals
  totalSlots:        number;
  generalTotal:      number;
  evTotal:           number;
  disabledTotal:     number;

  totalOccupied:     number;
  totalAvailable:    number;
  generalAvailable:  number;
  evAvailable:       number;
  disabledAvailable: number;
}

export interface Zone {
  zoneId: number;
  zoneName: string;
}

// //Parking slot default
// export interface BaseSlot {
//   slotId: number;
//   zoneId: number;
//   slotTypeId: number;
//   slotCode: string;
//   isActive: boolean;
// }

// export interface SlotOccupancy {
//   slotId: number;
//   occupied: boolean;
//   vehiclePlate?: string;
// }

export type SlotType = "GENERAL" | "EV" | "DISABLED";

export type SlotCategoryPath = "general" | "ev" | "disabled";

export const SLOT_TYPE_MAP: Record<number, SlotType> = {
  0: "GENERAL",
  1: "EV",
  2: "DISABLED",
};

export interface Slot {
  slotId: number;
  zoneId: number;
  slotCode: string;
  category: SlotType;
  isActive: boolean;
  vehiclePlate?: string;
}