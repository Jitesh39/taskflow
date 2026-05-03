import React from "react";
import { ClipboardList, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  type: "total" | "completed" | "pending" | "overdue";
}

export default function StatCard({ title, value, type }: StatCardProps) {
  const getConfig = () => {
    switch (type) {
      case "total": return { icon: <ClipboardList size={24} />, color: "text-primary", bg: "bg-primary-subtle", border: "border-primary" };
      case "completed": return { icon: <CheckCircle2 size={24} />, color: "text-success", bg: "bg-success-subtle", border: "border-success" };
      case "pending": return { icon: <Clock size={24} />, color: "text-warning", bg: "bg-warning-subtle", border: "border-warning" };
      case "overdue": return { icon: <AlertTriangle size={24} />, color: "text-danger", bg: "bg-danger-subtle", border: "border-danger" };
    }
  };

  const config = getConfig();

  return (
    <div className={`card shadow-sm border-0 border-start border-4 ${config.border} h-100 stat-card`}>
      <div className="card-body d-flex align-items-center justify-content-between p-4">
        <div>
          <h6 className="text-muted fw-semibold mb-1 text-uppercase" style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}>{title}</h6>
          <h3 className="m-0 fw-bold text-dark">{value}</h3>
        </div>
        <div className={`p-3 rounded-circle ${config.bg} ${config.color} d-flex align-items-center justify-content-center`} style={{ width: "56px", height: "56px" }}>
          {config.icon}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
      `}} />
    </div>
  );
}
