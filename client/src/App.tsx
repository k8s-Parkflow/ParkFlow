import { useState, useEffect } from 'react';
import { 
  ParkingSquare, 
  CheckCircle, 
  Activity, 
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Zap, Accessibility 
} from 'lucide-react';
import mockDb from '../sample-db/parking_data.json';
import './styles/global.css';
import { ParkingSlotData, SlotType, SLOT_TYPE_MAP } from "./components/ParkingSlot";
import { StatCard } from './components/StatCard';
import { ParkingGrid } from './components/ParkingGrid';

interface Zone {
  zone_id: number;
  zone_name: string;
}

interface SlotOccupancy {
  slot_id: number;
  occupied: boolean;
  vehicle_plate?: string;
}

interface ZoneAvailability {
  zone_id: number;
  total_slots: number;
  occupied_slots: number;
  available_slots: number;
  ev_total: number;
  ev_occupied: number;
  ev_available: number;
  disabled_total: number;
  disabled_occupied: number;
  disabled_available: number;
}

interface BaseSlot {
  slot_id: number;
  zone_id: number;
  slot_type_id: number; // 0=standard 1=EV 2=handicapped
  slot_code: string;
  is_active: boolean;   // true = slot itself is enabled (NOT occupancy)
}

const TOTAL_ZONES = 100;
const SLOTS_PER_ZONE = 100;

//Generate License Plates
const KR_MID_CHARS = ["가", "나", "다", "라", "마", "거", "너", "더", "러", "머", "버", "서", "어", "저", "고", "노", "도", "로", "모", "보", "소", "오", "조", "구", "누", "두", "루", "무", "부", "수", "우", "주"];

function generateKPlate(): string {
  const num1 = String(Math.floor(Math.random() * 89) + 11); // 11–99
  const mid = KR_MID_CHARS[Math.floor(Math.random() * KR_MID_CHARS.length)];
  const num2 = String(Math.floor(Math.random() * 9000) + 1000); // 1000–9999
  return `${num1}${mid} ${num2}`;
}

function generateMockData(): {
  zones: Zone[];
  baseSlots: BaseSlot[];
  occupancies: SlotOccupancy[];
} {
  const zones: Zone[] = Array.from({ length: TOTAL_ZONES }, (_, i) => ({
    zone_id: i + 1,
    zone_name: `Zone ${i + 1}`,
  }));

  const baseSlots: BaseSlot[] = [];
  const occupancies: SlotOccupancy[] = [];

  zones.forEach(({ zone_id }) => {
    for (let i = 1; i <= SLOTS_PER_ZONE; i++) {
      const slot_id = (zone_id - 1) * SLOTS_PER_ZONE + i;
      const slot_type_id = i <= 5 ? 2 : i % 20 === 0 ? 1 : 0; // first 5 = handicapped, every 20th = EV
      const slot_code = `Z${zone_id}-${String(i).padStart(3, "0")}`;

      baseSlots.push({ slot_id, zone_id, slot_type_id, slot_code, is_active: true });

      const occupied = Math.random() < 0.45;
      occupancies.push({
        slot_id,
        occupied,
        vehicle_plate: occupied ? generateKPlate() : undefined,
      });
    }
  });

  return { zones, baseSlots, occupancies };
}


function mapToParkingSlotData(
  rawSlots: BaseSlot[],
  occupancies: SlotOccupancy[]
): ParkingSlotData[] {
  const occMap = new Map(occupancies.map((o) => [o.slot_id, o]));

  return rawSlots.map((slot) => {
    const occ = occMap.get(slot.slot_id);
    return {
      slotId: slot.slot_id,
      slotCode: slot.slot_code,
      zoneId: slot.zone_id,
      slotType: SLOT_TYPE_MAP[slot.slot_type_id] ?? "standard",
      isActive: occ?.occupied ?? false,
      licensePlate: occ?.vehicle_plate,
    };
  });
}

function calcZoneAvailability(slots: ParkingSlotData[]): ZoneAvailability {
  const ev = slots.filter((s) => s.slotType === "EV");
  const disabled = slots.filter((s) => s.slotType === "handicapped");

  return {
    zone_id: slots[0]?.zoneId ?? 0,
    total_slots: slots.length,
    occupied_slots: slots.filter((s) => s.isActive).length,
    available_slots: slots.filter((s) => !s.isActive).length,
    ev_total: ev.length,
    ev_occupied: ev.filter((s) => s.isActive).length,
    ev_available: ev.filter((s) => !s.isActive).length,
    disabled_total: disabled.length,
    disabled_occupied: disabled.filter((s) => s.isActive).length,
    disabled_available: disabled.filter((s) => !s.isActive).length,
  };
}

export default function App() {
  const [{ zones, baseSlots, occupancies }, setDb] = useState(generateMockData);

  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedSlotId, setHighlightedSlotId] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // ── Simulated real-time occupancy updates ────────────────────────────────
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setDb((prev) => {
        const newOccupancies = [...prev.occupancies];
        const numEvents = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < numEvents; i++) {
          const idx = Math.floor(Math.random() * newOccupancies.length);
          const current = newOccupancies[idx];
          newOccupancies[idx] = current.occupied
            ? { ...current, occupied: false, vehicle_plate: undefined }
            : { ...current, occupied: true, vehicle_plate: generateKPlate() };
        }

        return { ...prev, occupancies: newOccupancies };
      });
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const allSlots = mapToParkingSlotData(baseSlots, occupancies);
  const zoneSlots = allSlots.filter((s) => s.zoneId === selectedZoneId);
  const zoneStats = calcZoneAvailability(zoneSlots);

  // Global stats (all zones)
  const totalAvailable = allSlots.filter((s) => !s.isActive).length;
  const totalSlots = allSlots.length;

  const globalEV = allSlots.filter((s) => s.slotType === "EV");
  const globalDisabled = allSlots.filter((s) => s.slotType === "handicapped");
  const availableEV = globalEV.filter((s) => !s.isActive).length;
  const availableDisabled = globalDisabled.filter((s) => !s.isActive).length;

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const found = allSlots.find((s) =>
      s.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setSelectedZoneId(found.zoneId);
      setHighlightedSlotId(found.slotCode);
      setTimeout(() => setHighlightedSlotId(""), 5000);
    } else {
      alert("해당 번호판을 찾을 수 없습니다.");
    }
  };

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 2));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.5));
  const zoomReset = () => setZoomLevel(1);

  const selectedZone = zones.find((z) => z.zone_id === selectedZoneId);

  return (
    <div className="app">
      <div className="app__inner">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="app__header">
          <div className="app__brand">
            <div className="app__brand-icon">
              <ParkingSquare size={32} />
            </div>
            <div>
              <h1 className="app__title">ParkFlow</h1>
              <p className="app__subtitle">실시간 주차 관리 시스템</p>
            </div>
          </div>

          <div className="app__header-actions">
            <button
              className={`btn-live ${autoRefresh ? "btn-live--active" : "btn-live--paused"}`}
              onClick={() => setAutoRefresh((v) => !v)}
            >
              <Activity size={16} className={autoRefresh ? "icon-pulse" : ""} />
              {autoRefresh ? "실시간" : "일시정지"}
            </button>
            <span className="app__updated">
              업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}
            </span>
          </div>
        </header>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <section className="stats-row">
          {/* Main available card */}
          <div className="stat-card stat-card--hero">
            <div className="stat-card__body">
              <p className="stat-card__label">전체 가용 슬롯</p>
              <p className="stat-card__value stat-card__value--hero">{totalAvailable}</p>
              <p className="stat-card__sub">
                전체 용량의 {((totalAvailable / totalSlots) * 100).toFixed(0)}% 여유
              </p>
            </div>
            <div className="stat-card__icon stat-card__icon--hero">
              <CheckCircle size={40} />
            </div>
          </div>

          {/* Handicap card */}
          <div className="stat-card">
            <div className="stat-card__body">
              <p className="stat-card__label">장애인 슬롯</p>
              <p className="stat-card__value">{availableDisabled}<span className="stat-card__denom">/{globalDisabled.length}</span></p>
              <p className="stat-card__sub">가용</p>
            </div>
            <div className="stat-card__icon stat-card__icon--blue">
              <Accessibility size={24} />
            </div>
          </div>

          {/* EV card */}
          <div className="stat-card">
            <div className="stat-card__body">
              <p className="stat-card__label">EV 충전 슬롯</p>
              <p className="stat-card__value">{availableEV}<span className="stat-card__denom">/{globalEV.length}</span></p>
              <p className="stat-card__sub">가용</p>
            </div>
            <div className="stat-card__icon stat-card__icon--purple">
              <Zap size={24} fill="currentColor" />
            </div>
          </div>

          {/* Search card */}
          <div className="stat-card stat-card--search">
            <p className="stat-card__label" style={{ marginBottom: "0.5rem" }}>번호판 검색</p>
            <div className="search-row">
              <div className="search-input-wrap">
                <Search size={14} className="search-icon" />
                <input
                  className="search-input"
                  type="text"
                  placeholder="예: 서울 12가 3456"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button className="btn-search" onClick={handleSearch}>검색</button>
            </div>
          </div>
        </section>

        {/* ── Zone Selector ──────────────────────────────────────────────── */}
        <section className="zone-selector">
          <div className="zone-selector__quick">
            <h3 className="zone-selector__title">구역 선택</h3>
          </div>

          <div className="zone-selector__manual">
            <span className="zone-selector__or">(1–100):</span>
            <input
              className="zone-input"
              type="number"
              min={1}
              max={TOTAL_ZONES}
              value={selectedZoneId}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 1 && v <= TOTAL_ZONES) setSelectedZoneId(v);
              }}
            />
          </div>
        </section>

        {/* ── Zone Grid Panel ────────────────────────────────────────────── */}
        {selectedZone && (
          <section className="zone-panel">
            <div className="zone-panel__header">
              <div className="zone-panel__group">
                <span className="zone-badge">{selectedZoneId}</span>
                <div>
                  <h2 className="zone-panel__title">{selectedZone.zone_name}</h2>
                  <p className="zone-panel__sub">
                    {zoneStats.available_slots}개 가용 / {zoneStats.total_slots}개 전체
                    &nbsp;·&nbsp; EV {zoneStats.ev_available}/{zoneStats.ev_total}
                    &nbsp;·&nbsp; 장애인 {zoneStats.disabled_available}/{zoneStats.disabled_total}
                  </p>
                </div>
              </div>
              
              <div className="zone-panel__controls">
                <div className="zoom-controls">
                  <button className="zoom-btn" onClick={zoomOut} disabled={zoomLevel <= 0.5} aria-label="축소">
                    <ZoomOut size={16} />
                  </button>
                  <button className="zoom-btn" onClick={zoomReset} aria-label="원래 크기">
                    <Maximize2 size={16} />
                  </button>
                  <button className="zoom-btn" onClick={zoomIn} disabled={zoomLevel >= 2} aria-label="확대">
                    <ZoomIn size={16} />
                  </button>
                  <span className="zoom-label">{Math.round(zoomLevel * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="zone-panel__grid">
              <ParkingGrid
                slots={zoneSlots}
                highlightedSlotId={highlightedSlotId}
                zoomLevel={zoomLevel}
              />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}