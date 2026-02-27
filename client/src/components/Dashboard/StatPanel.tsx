import { LucideIcon } from 'lucide-react';
import "../../styles/StatPanel.css";

interface StatPanelProps {
  label: string;
  value: number;
  total?: number;
  sub?: string;
  icon: LucideIcon;
  iconClass?: string;
  hero?: boolean;
}

export function StatPanel({ label, value, total, sub, icon: Icon, iconClass="", hero=false }: StatPanelProps) {
  return (
    <div className={`stat-panel${hero ? " stat-panel--hero" : ""}`}>
      <div className="stat-panel__body">
        <p className="stat-panel__label">{label}</p>
        <p className={`stat-panel__value${hero ? " stat-panel__value--hero" : ""}`}>
          {value}
          {total !== undefined && (
            <span className="stat-panel__denom">/{total}</span>
          )}
        </p>
        {sub && <p className="stat-panel__sub">{sub}</p>}
      </div>
      <div className={`stat-panel__icon ${iconClass}`}>
        <Icon size={hero ? 40 : 24} />
      </div>
    </div>
  );
}
