import { ParkingSquare, Activity } from 'lucide-react';
import './styles/global.css';
import logo from "./assets/logo.png";

import { getParkingData } from './hooks/getParkingData';
import { useSearch } from "./hooks/useSearch";
import { useZoom } from "./hooks/useZoom";

import { StatDisplay } from './components/Dashboard/StatDisplay';
import { ParkingZoneDisplay } from "./components/ParkingZoneDisplay";

export const TOTAL_ZONES = 100;
export const SLOTS_PER_ZONE = 100;

export default function App() {
  const {
    zones,
    zoneSlots,
    globalStats,
    lastUpdated,
    autoRefresh,
    toggleAutoRefresh,
    selectedZoneId,
    setSelectedZoneId,
    isLoading, 
    error
  } = getParkingData();


  const { searchQuery, setSearchQuery, isValidPlate, searchError, highlightedSlotId, handleSearch } = useSearch();
  const { zoomLevel, zoomIn, zoomOut, zoomReset } = useZoom();
  
  const selectedZone = zones.find((z) => z.zoneId === selectedZoneId);

  if (isLoading) {
    return <div>Loading parking data...</div>;
  }

  if (error) {
    return <div>Failed to load: {error}</div>;
  }
  
  return (
    <div className="app">
      <div className="app__inner">

        {/* Header */}
        <header className="app__header">
          <div className="app__brand">
            <div className="app__brand-icon">
              <img src={logo} alt="Logo" />
            </div>
            <div>
              <h1 className="app__title">park<span className="app__title-highlight">f</span>low</h1>
              <p className="app__subtitle">실시간 주차 관리 시스템</p>
            </div>
          </div>

          <div className="app__header-actions">
            <button
              className={`btn-live ${autoRefresh ? "btn-live--active" : "btn-live--paused"}`}
              onClick={toggleAutoRefresh}
            >
              <Activity size={16} className={autoRefresh ? "icon-pulse" : ""} />
              {autoRefresh ? "실시간" : "일시정지"}
            </button>
            <span className="app__updated">
              업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}
            </span>
          </div>
        </header>

        {/* Stats Dashboard */}
        <StatDisplay
          globalStats={globalStats}
          searchQuery={searchQuery}
          isValidPlate={isValidPlate}
          searchError={searchError}
          onSearchChange={setSearchQuery}
          onSearch={()=> handleSearch(setSelectedZoneId)}
        />

        {/* Parking Zone Grid Display */}
        {selectedZone && (
          <ParkingZoneDisplay
            selectedZoneId={selectedZoneId}
            onZoneChange={setSelectedZoneId}
            zone={selectedZone}
            zoneSlots={zoneSlots}
            highlightedSlotId={highlightedSlotId}
            zoomLevel={zoomLevel}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomReset={zoomReset}
          />
        )}
      </div>
    </div>
  );
}