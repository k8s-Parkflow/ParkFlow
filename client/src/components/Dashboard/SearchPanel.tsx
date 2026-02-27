import { Search } from "lucide-react";
import "../../styles/SearchPanel.css";

interface SearchPanelProps {
  query:       string;
  onChange:    (q: string) => void;
  onSearch:    () => void;
}

export function SearchPanel({ query, onChange, onSearch }: SearchPanelProps) {
  return (
    <div className="stat-panel stat-panel--search">
      <p className="stat-panel__label" style={{ marginBottom: "0.5rem" }}>번호판 검색</p>
      <div className="search-row">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="예: 12가 3456"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </div>
        <button className="btn-search" onClick={onSearch}>검색</button>
      </div>
    </div>
  );
}