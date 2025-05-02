
import React from "react";
import { Alert } from "@/components/ui/alert";
import { AlertCircle, Info, CheckCircle } from "lucide-react";

interface AlertItem {
  title: string;
  text: string;
  action: string;
  severity: "high" | "medium" | "low";
}

// Sample alerts data
const sampleAlerts: AlertItem[] = [
  {
    title: "Leads sin procesar",
    text: "Hay 12 leads nuevos que llevan más de 48 horas sin procesar",
    action: "Ver leads pendientes",
    severity: "high"
  },
  {
    title: "Oportunidad de conversión",
    text: "5 custodios calificados están listos para validación",
    action: "Revisar custodios",
    severity: "medium"
  },
  {
    title: "Métricas actualizadas",
    text: "Las métricas del mes actual han sido actualizadas",
    action: "Ver dashboard",
    severity: "low"
  }
];

const AlertsPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      {sampleAlerts.map((alert, idx) => (
        <div key={idx} className={`border rounded-lg p-4 ${
          alert.severity === "high" 
            ? "border-red-200 bg-red-50" 
            : alert.severity === "medium"
              ? "border-amber-200 bg-amber-50"
              : "border-blue-200 bg-blue-50"
        }`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {alert.severity === "high" ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : alert.severity === "medium" ? (
                <Info className="h-5 w-5 text-amber-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${
                alert.severity === "high" 
                  ? "text-red-700" 
                  : alert.severity === "medium"
                    ? "text-amber-700"
                    : "text-blue-700"
              }`}>
                {alert.title}
              </h4>
              <p className="text-sm text-slate-600 mb-3">{alert.text}</p>
              <button 
                className={`px-3 py-1 text-xs font-medium rounded ${
                  alert.severity === "high" 
                    ? "bg-red-100 text-red-700 hover:bg-red-200" 
                    : alert.severity === "medium"
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {alert.action}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsPanel;
