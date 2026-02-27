export interface ZoneAvailabilityResponse {
  zone_id: number;
  total_slots: number;
  occupied_slots: number;
  available_slots: number;
  general_total: number;
  general_occupied: number;
  general_available: number;
  ev_total: number;
  ev_occupied: number;
  ev_available: number;
  disabled_total: number;
  disabled_occupied: number;
  disabled_available: number;
}

export interface TypeAvailabilityResponse {
  zone_id: number;
  type: string;
  total: number;
  occupied: number;
  available: number;
}

