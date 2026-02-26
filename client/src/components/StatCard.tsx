import { LucideIcon } from 'lucide-react';
import "../styles/StatCard.css";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        {description && <p className="stat-desc">{description}</p>}
      </div>
      <div className="stat-icon-wrapper">
        <Icon size={24} />
      </div>
    </div>
  );
}
