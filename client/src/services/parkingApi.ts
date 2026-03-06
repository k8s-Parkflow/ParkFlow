/**
 * parkingApi.ts
 *
 * REST client mapped 1-to-1 with ZoneAvailabilityController.java
 * Base path: /zones  (set VITE_API_BASE_URL=http://localhost:8080 in .env)
 *
 * Every response is wrapped in ApiEnvelope<T> — apiFetch() unwraps .data.
 */

import type {
  ApiEnvelope,
  ZoneAvailabilityResponse,
  TypeAvailabilityResponse,
  CurrentParkingLocationResponse,
  SlotCategory,
  SlotCategoryPath,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}: ${await res.text()}`);

  const body: ApiEnvelope<T> = await res.json();
  if (!body.isSuccess) throw new Error(`API error on ${path}: ${body.message} (${body.code})`);
  return body.data;
}

// GET /zones/availability  — primary polling endpoint
export async function fetchAllZonesAvailability(): Promise<ZoneAvailabilityResponse[]> {
  return apiFetch<ZoneAvailabilityResponse[]>("/zones/availability");
}

// GET /zones/{zoneId}/availability
export async function fetchZoneAvailability(zoneId: number): Promise<ZoneAvailabilityResponse> {
  return apiFetch<ZoneAvailabilityResponse>(`/zones/${zoneId}/availability`);
}

// GET /zones/{zoneId}/availability/general|ev|disabled
export async function fetchZoneTypeAvailability(
  zoneId:   number,
  category: SlotCategoryPath,
): Promise<TypeAvailabilityResponse> {
  return apiFetch<TypeAvailabilityResponse>(`/zones/${zoneId}/availability/${category}`);
}

// GET /zones/{zoneId}/availability/general|ev|disabled/count
export async function fetchZoneTypeAvailableCount(
  zoneId:   number,
  category: SlotCategoryPath,
): Promise<number> {
  return apiFetch<number>(`/zones/${zoneId}/availability/${category}/count`);
}

// GET /zones/{zoneId}/availability/count
export async function fetchZoneAvailableCount(zoneId: number): Promise<number> {
  return apiFetch<number>(`/zones/${zoneId}/availability/count`);
}

// GET /zones/availability/type/{type}/count
export async function fetchTotalAvailableByType(type: SlotCategory): Promise<number> {
  return apiFetch<number>(`/zones/availability/type/${type}/count`);
}

// GET /zones/vehicles/{vehicleNum}/current-parking
export async function fetchCurrentParkingByVehicle(
  vehicleNum: string,
): Promise<CurrentParkingLocationResponse> {
  return apiFetch<CurrentParkingLocationResponse>(
    `/zones/vehicles/${encodeURIComponent(vehicleNum)}/current-parking`,
  );
}