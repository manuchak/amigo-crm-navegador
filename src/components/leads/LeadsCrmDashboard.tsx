import React, { useMemo } from "react";
import { useLeads } from "@/context/LeadsContext";
import { BarChart, Bar, PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { CircleArrowUp, CircleArrowDown, TrendingUp, TrendingDown, Gauge, LayoutDashboard } from "lucide-react";

const COLORS = ["#8B5CF6", "#33C3F0", "#7E69AB", "#9b87f5", "#F59E42", "#38BDF8", "#FD6F3B"];

const STAGES = [
  { key: "Nuevo", label: "Nuevos" },
  { key: "Contactado", label: "Contactados" },
  { key: "En progreso", label: "En Progreso" },
  { key: "Calificado", label: "Calificados" },
  { key: "No calificado", label: "No Calificados" },
  { key: "Rechazado", label: "Rechazados" },
];

const getLabel = (estado: string) => {
  const found = STAGES.find(s => s.key.toLowerCase() === (estado || "").toLowerCase());
  return found ? found.label : estado;
};

const metricCardClass = "flex flex-col bg-white shadow rounded-lg px-6 py-5 min-w-[180px] max-w-[230px] border";
const statLabelClass = "text-xs text-slate-500 mb-1";
const statValueClass = "text-2xl font-bold mb-1";
const statTrendClass = "flex items-center gap-1 text-xs";

const formatPercent = (val: number) => (val * 100).toFixed(1) + "%";

const funnelColors = [
  "#8B5CF6", // Nuevo
  "#33C3F0", // Contactado
  "#9b87f5", // En progreso
  "#F59E42", // Calificado
  "#FD6F3B", // No calificado
  "#7E69AB", // Rechazado
];

function useFunnelStats(leads: any[]) {
  const byStage = STAGES.map((stage, idx) => ({
    ...stage,
    value: leads.filter(lead => (lead.estado || "Nuevo").toLowerCase() === stage.key.toLowerCase()).length,
    color: funnelColors[idx] || "#DDD",
  }));

  const conversions = byStage.map((s, idx, arr) => {
    if (idx === arr.length - 1 || arr[idx].value === 0) return null;
    const val = arr[idx + 1]
      ? arr[idx + 1].value / (s.value || 1)
      : null;
    return val !== null ? Number(val) : null;
  });

  const total = leads.length;

  return {
    byStage,
    conversions,
    total,
  }
}

function useTimeMetrics(leads: any[]) {
  return STAGES.map((stage, idx) => ({
    name: stage.label,
    avgDays: 1.5 + idx + Math.random(),
  }));
}

const pieColors = [ "#8B5CF6", "#33C3F0", "#9b87f5", "#F59E42" ];
const statusTextColor = ["text-primary", "text-sky-500", "text-vivid-purple", "text-orange-400", "text-red-400", "text-secondary"];

const LeadsCrmDashboard: React.FC = () => {
  const { leads } = useLeads();

  const funnel = useFunnelStats(leads);

  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        key: date.toLocaleString('es-MX', { month: 'short' }),
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    });
    return months.map(({ key, month, year }) => ({
      name: key,
      Nuevos: leads.filter(
        l => {
          if (!l.fechaCreacion) return false;
          const date = new Date(l.fechaCreacion);
          return date.getMonth() === month && date.getFullYear() === year && l.estado === "Nuevo";
        }
      ).length,
      Calificados: leads.filter(
        l => {
          if (!l.fechaCreacion) return false;
          const date = new Date(l.fechaCreacion);
          return date.getMonth() === month && date.getFullYear() === year && l.estado === "Calificado";
        }
      ).length,
    }));
  }, [leads]);

  const carTypes = [
    { name: "Con Vehículo", val: leads.filter(l => l.tieneVehiculo === "SI").length },
    { name: "Sin Vehículo", val: leads.filter(l => l.tieneVehiculo === "NO" || !l.tieneVehiculo).length },
    { name: "Armados", val: leads.filter(l => l.empresa?.includes("armado")).length },
    { name: "Sin Armamento", val: leads.filter(l => !l.empresa?.includes("armado")).length },
  ];

  const fakeAlerts = [
    {
      title: "Muchos leads pendientes",
      text: "Hay un alto número de leads en etapa 'Nuevo' sin contacto inicial.",
      action: "Contactar",
      severity: "high",
    },
    {
      title: "Baja conversión",
      text: "La tasa de conversión hacia 'Calificado' es menor al 20%.",
      action: "Ver detalles",
      severity: "medium",
    },
    {
      title: "Aprobaciones pendientes",
      text: "Hay 5 custodios en espera de aprobación.",
      action: "Aprobar",
      severity: "medium",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-6 px-2 w-full animate-fade-in">
      <div className="flex-1 w-full flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch w-full">
          <div className="flex gap-3 flex-1 flex-wrap min-w-[360px]">
            {funnel.byStage.slice(0, 4).map((stage, i) => (
              <div key={stage.key} className={metricCardClass}>
                <div className={"mb-2 font-semibold "+statusTextColor[i]}>{stage.label}</div>
                <div className={statValueClass}>
                  {stage.value}
                </div>
                {i > 0 && (
                  <div className={statTrendClass}>
                    {funnel.conversions[i - 1] !== null && funnel.conversions[i - 1]! >= 1 ? <CircleArrowUp className="w-3 h-3 text-green-500" /> : <CircleArrowDown className="w-3 h-3 text-red-500" />}
                    <span>
                      {funnel.conversions[i - 1] !== null 
                        ? formatPercent(funnel.conversions[i - 1]!)
                        : "--"
                      } avance
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="bg-white border rounded-xl shadow flex flex-col px-4 py-4 min-w-[300px] w-[350px] max-w-[420px] items-center">
            <div className="font-semibold text-primary mb-2 flex gap-2 items-center">
              <Gauge className="w-5 h-5 text-primary" /> Embudo de lead
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={funnel.byStage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 14, fontWeight: 500, fill: "#334155" }} 
                  height={36}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {funnel.byStage.map((entry, idx) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-xs text-slate-400 text-center mt-1">Visualiza cuántos leads hay en cada etapa</div>
          </div>
        </div>
        <div className="bg-white border rounded-xl shadow px-6 py-5 w-full flex flex-col">
          <div className="flex gap-2 items-center mb-2">
            <LayoutDashboard className="w-4 h-4 text-secondary" />
            <span className="font-semibold">Rendimiento mensual onboarding de leads</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyTrend}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 14, fontWeight: 500, fill: "#334155" }} 
                height={36}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Nuevos" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Calificados" stroke="#33C3F0" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col md:flex-row gap-6 mt-1 w-full">
          <div className="flex-1 bg-white border rounded-xl shadow p-6 flex flex-col min-w-[280px] items-center">
            <div className="font-semibold mb-2">Distribución perfiles</div>
            <ResponsiveContainer width="99%" height={160}>
              <PieChart>
                <Pie
                  data={carTypes}
                  dataKey="val"
                  nameKey="name"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={35}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                  {carTypes.map((entry, idx) => (
                    <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 bg-white border rounded-xl shadow p-6 flex flex-col min-w-[280px] items-center">
            <div className="font-semibold mb-2">Tiempo en cada etapa</div>
            <ResponsiveContainer width="98%" height={140}>
              <BarChart data={useTimeMetrics(leads)}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 14, fontWeight: 500, fill: "#334155" }} 
                  height={36}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgDays" fill="#F59E42" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="md:w-[350px] w-full max-w-full flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white border rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="font-semibold text-lg mb-2">Alertas & Recomendaciones</div>
          {fakeAlerts.map((alert, idx) => (
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
        <div className="bg-white border rounded-xl shadow p-6 flex flex-col gap-3 mt-3">
          <div className="font-semibold text-lg mb-2 text-primary">Leads recientemente añadidos</div>
          {(leads.slice(0, 3)).map((lead, idx) => (
            <div key={lead.id} className="flex flex-col gap-1 border-b border-slate-100 pb-2 mb-1 last:border-0 last:mb-0 last:pb-0">
              <span className="font-medium">{lead.nombre}</span>
              <span className="text-xs text-slate-400">{lead.empresa}</span>
              <span className="text-xs text-slate-500">Estado: <b>{lead.estado}</b></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadsCrmDashboard;
