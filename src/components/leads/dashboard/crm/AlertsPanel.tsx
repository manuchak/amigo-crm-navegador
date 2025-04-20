
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
  <div className="bg-white border rounded-xl shadow p-6 flex flex-col gap-4">
    <div className="font-semibold text-lg mb-2">Alertas & Recomendaciones</div>
    {alerts.map((alert, idx) => (
      <div key={idx} className="border rounded-lg p-4 bg-slate-50 mb-1">
        <div className={`font-semibold mb-1 ${alert.severity === "high" ? "text-red-500" : "text-secondary"}`}>{alert.title}</div>
        <div className="text-sm text-slate-700 mb-2">{alert.text}</div>
        <button className={`text-xs font-semibold mt-1 px-3 py-1 rounded ${alert.severity === "high"
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
