//generate mock data and calculate stats

import { 
  SlotType, Slot, 
  Zone, ZoneAvailabilityResponse } from "../types.ts";

interface BaseSlot {
  slotId:      number;
  zoneId:      number;
  slotTypeId: number;
  slotCode:    string;
}

interface SlotOccupancy {
  slotId:       number;
  occupied:      boolean;
  vehicle_plate?: string;
}

const TOTAL_ZONES = 100;
const SLOTS_PER_ZONE = 100;

const SLOT_CATEGORY_MAP: Record<number, SlotType> = {
  0: "GENERAL",
  1: "EV",
  2: "DISABLED",
};

// Random car plate generator
const KR_MID_CHARS = [
  "가", "나", "다", "라", "마",
  "거", "너", "더", "러", "머", "버", "서", "어", "저",
  "고", "노", "도", "로", "모", "보", "소", "오", "조",
  "구", "누", "두", "루", "무", "부", "수", "우", "주",
];

export function generateKPlate(): string {
  const num1 = String(Math.floor(Math.random() * 800)).padStart(2, '0');
  const mid  = KR_MID_CHARS[Math.floor(Math.random() * KR_MID_CHARS.length)];
  const num2 = String(Math.floor(Math.random() * 9000) + 1000)
  return `${num1}${mid} ${num2}`;
}

// random 입출차 generator until backend integration

export function generateMockData(): {
  zones: Zone[];
  baseSlots: BaseSlot[];
  occupancies: SlotOccupancy[];
} {
  const zones: Zone[] = Array.from({ length: TOTAL_ZONES }, (_, i) => ({
    zoneId: i + 1,
    zoneName: `Zone ${i + 1}`,
  }));

  const baseSlots: BaseSlot[] = [];
  const occupancies: SlotOccupancy[] = [];

  zones.forEach(({ zoneId }) => {
    for (let i = 1; i <= SLOTS_PER_ZONE; i++) {
      const slotId = (zoneId - 1) * SLOTS_PER_ZONE + i;

      // first 5 slots → EV, every 20 → EV
      const slotTypeId = i <= 5 ? 1 : i % 20 === 0 ? 2 : 0;
      const slotCode = `Z${zoneId}-${String(i).padStart(3, "0")}`;

      baseSlots.push({ slotId, zoneId, slotTypeId, slotCode });

      const occupied = Math.random() < 0.45;
      occupancies.push({
        slotId,
        occupied,
        vehicle_plate: occupied ? generateKPlate() : undefined,
      });
    }
  });

  return { zones, baseSlots, occupancies };
}

// Mapping from DB

export function mapToParkingSlotData(
  BaseSlots: BaseSlot[],
  occupancies: SlotOccupancy[]
): Slot[] {
  const occMap = new Map(occupancies.map((o) => [o.slotId, o]));

  return BaseSlots.map((slot) => {
    const occ = occMap.get(slot.slotId);
    return {
      slotId: slot.slotId,
      slotCode: slot.slotCode,
      zoneId: slot.zoneId,
      category: SLOT_CATEGORY_MAP[slot.slotTypeId] ?? "standard",
      isActive: occ?.occupied ?? false,
      licensePlate: occ?.vehicle_plate,
    };
  });
}

// Zone별 availability 

export function calcZoneAvailability(slots: Slot[]): ZoneAvailabilityResponse {
  const general  = slots.filter((s) => s.category === "GENERAL");
  const ev       = slots.filter((s) => s.category === "EV");
  const disabled = slots.filter((s) => s.category === "DISABLED");

  return {
    zoneId:           slots[0]?.zoneId ?? 0,
    zoneName: "",
    totalSlots:       slots.length,
    occupiedSlots:    slots.filter((s) =>  s.isActive).length,
    availableSlots:   slots.filter((s) => !s.isActive).length,
    generalAvailable:   general.filter((s) =>  s.isActive).length,
    evAvailable:      ev.filter((s) => !s.isActive).length,
    disabledAvailable:disabled.filter((s) => !s.isActive).length,
  };
}

// 합산 stat

export interface GlobalStats {
  totalSlots: number;
  totalAvailable: number;
  generalTotal: number;
  generalAvailable: number;
  evTotal: number;
  evAvailable: number;
  disabledTotal: number;
  disabledAvailable: number;
}

export function calcGlobalStats(allSlots: Slot[]): GlobalStats {
  const general  = allSlots.filter((s) => s.category === "GENERAL");
  const ev       = allSlots.filter((s) => s.category === "EV");
  const disabled = allSlots.filter((s) => s.category === "DISABLED");

  return {
    totalSlots:        allSlots.length,
    totalAvailable:    allSlots.filter((s) => !s.isActive).length,
    generalTotal:      general.length,
    generalAvailable:  general.filter((s) => !s.isActive).length,
    evTotal:           ev.length,
    evAvailable:       ev.filter((s) => !s.isActive).length,
    disabledTotal:     disabled.length,
    disabledAvailable: disabled.filter((s) => !s.isActive).length,
  };
}
