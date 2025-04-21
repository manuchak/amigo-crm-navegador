
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Lead } from "@/context/LeadsContext";

// Helper para agrupar leads por día y fuente de ingreso
function getLeadsByDayAndSource(leads: Lead[]) {
  // Creamos un mapa intermedio: { fecha: { fuente: count } }
  const grouped: Record<string, Record<string, number>> = {};
  leads.forEach((lead) => {
    // fecha en formato YYYY-MM-DD (solo día)
    let fecha = "";
    if (lead.fechaCreacion?.length === 10) {
      fecha = lead.fechaCreacion;
    } else if (lead.fechaCreacion) {
      try {
        const d = new Date(lead.fechaCreacion);
        fecha = d.toISOString().slice(0, 10);
      } catch {
        fecha = "Sin fecha";
      }
    }
    const fuente = (lead as any).fuente || "Desconocida";
    if (!grouped[fecha]) grouped[fecha] = {};
    grouped[fecha][fuente] = (grouped[fecha][fuente] || 0) + 1;
  });
  // Extracción de todas las fuentes
  const allSources: string[] = Array.from(
    new Set(
      leads.map((l) =>
        (l as any).fuente
          ? (l as any).fuente
          : "Desconocida"
      )
    )
  );
  // Convertir a array de objetos para recharts
  const rows = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, fuentes]) => ({
      fecha,
      ...Object.fromEntries(
        allSources.map((source) => [source, fuentes[source] || 0])
      ),
    }));
  return { data: rows, sources: allSources };
}

interface LeadsByDaySourceChartProps {
  leads: Lead[];
}

const COLORS = [
  "#1890ff", // Landing
  "#52c41a", // Form
  "#faad14", // Webhook
  "#ff4d4f", // Desconocida
  "#722ed1", // Otros
];

const getColor = (i: number) => COLORS[i % COLORS.length];

const sourceLabels: Record<string, string> = {
  "Landing": "Landing",
  "Form": "Formulario",
  "Webhook": "Webhook",
  "Desconocida": "Desconocida",
};

const LeadsByDaySourceChart: React.FC<LeadsByDaySourceChartProps> = ({ leads }) => {
  const { data, sources } = useMemo(() => getLeadsByDayAndSource(leads), [leads]);
  if (data.length === 0) return null;

  // Configuración para el ChartContainer y leyenda
  const chartConfig = useMemo(() => {
    const conf: any = {};
    sources.forEach((src, idx) => {
      conf[src] = {
        label: sourceLabels[src] || src,
        color: getColor(idx),
      };
    });
    return conf;
  }, [sources]);

  return (
    <Card className="w-full bg-white shadow-sm mt-2">
      <CardHeader>
        <CardTitle className="text-base">Leads por día y fuente de ingreso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-72">
          <ChartContainer config={chartConfig}>
            <BarChart data={data}>
              <XAxis dataKey="fecha" angle={-30} textAnchor="end" height={40} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<ChartTooltipContent nameKey="" />} />
              <Legend />
              {sources.map((src, idx) => (
                <Bar
                  key={src}
                  dataKey={src}
                  stackId="a"
                  fill={getColor(idx)}
                  radius={[2, 2, 0, 0]}
                  name={sourceLabels[src] || src}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsByDaySourceChart;
