
import React from "react";

interface Alert {
  title: string;
  text: string;
  action: string;
  severity: "high" | "medium";
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => (
  <div className="space-y-3">
    {alerts.map((alert, idx) => (
      <div key={idx} className="border rounded-lg p-3 bg-slate-50">
        <div className={`font-semibold mb-1 ${alert.severity === "high" ? "text-red-500" : "text-secondary"}`}>
          {alert.title}
        </div>
        <div className="text-sm text-slate-700 mb-2">{alert.text}</div>
        <button className={`text-xs font-semibold px-3 py-1 rounded ${
          alert.severity === "high"
            ? "bg-red-100 text-red-600"
            : "bg-sky-100 text-sky-700"
          } hover:brightness-95`}>
          {alert.action}
        </button>
      </div>
    ))}
  </div>
);

export default AlertsPanel;
