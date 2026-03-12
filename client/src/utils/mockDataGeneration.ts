// //generate mock data and calculate stats

// import { 
//   BaseSlot, SlotOccupancy, SlotType, ParkingSlotData, 
//   Zone, ZoneAvailabilityResponse } from "../types.ts";




// // Random car plate generator
// const KR_MID_CHARS = [
//   "가", "나", "다", "라", "마",
//   "거", "너", "더", "러", "머", "버", "서", "어", "저",
//   "고", "노", "도", "로", "모", "보", "소", "오", "조",
//   "구", "누", "두", "루", "무", "부", "수", "우", "주",
// ];

// export function generateKPlate(): string {
//   const num1 = String(Math.floor(Math.random() * 800)).padStart(2, '0');
//   const mid  = KR_MID_CHARS[Math.floor(Math.random() * KR_MID_CHARS.length)];
//   const num2 = String(Math.floor(Math.random() * 9000) + 1000)
//   return `${num1}${mid} ${num2}`;
// }

// // random 입출차 generator until backend integration

// export function generateMockData(): {
//   zones: Zone[];
//   baseSlots: BaseSlot[];
//   occupancies: SlotOccupancy[];
// } {
//   const zones: Zone[] = Array.from({ length: TOTAL_ZONES }, (_, i) => ({
//     zone_id: i + 1,
//     zone_name: `Zone ${i + 1}`,
//   }));

//   const baseSlots: BaseSlot[] = [];
//   const occupancies: SlotOccupancy[] = [];

//   zones.forEach(({ zone_id }) => {
//     for (let i = 1; i <= SLOTS_PER_ZONE; i++) {
//       const slot_id = (zone_id - 1) * SLOTS_PER_ZONE + i;

//       // first 5 slots → EV, every 20 → EV
//       const slot_type_id = i <= 5 ? 1 : i % 20 === 0 ? 2 : 0;
//       const slot_code = `Z${zone_id}-${String(i).padStart(3, "0")}`;

//       baseSlots.push({ slot_id, zone_id, slot_type_id, slot_code, is_active: true });

//       const occupied = Math.random() < 0.45;
//       occupancies.push({
//         slot_id,
//         occupied,
//         vehicle_plate: occupied ? generateKPlate() : undefined,
//       });
//     }
//   });

//   return { zones, baseSlots, occupancies };
// }
