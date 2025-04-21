
import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
import { Lead } from "@/context/LeadsContext";
import DateRangePicker from "./DateRangePicker";
import { isValid, parseISO } from "date-fns";

const DARK_GRAY = "#222222";

function getLeadsByDayAndSource(leads: Lead[]) {
  const leadsWithValidDate = leads.filter((lead) => {
    if (!lead.fechaCreacion) return false;
    if (lead.fechaCreacion.length === 10) return isValid(parseISO(lead.fechaCreacion));
    try {
      return isValid(new Date(lead.fechaCreacion));
    } catch {
      return false;
    }
  });

  const grouped: Record<string, Record<string, number>> = {};
  leadsWithValidDate.forEach((lead) => {
    let fecha = "";
    if (lead.fechaCreacion?.length === 10) {
      fecha = lead.fechaCreacion;
    } else if (lead.fechaCreacion) {
      try {
        const d = new Date(lead.fechaCreacion);
        fecha = d.toISOString().slice(0, 10);
      } catch {
        return;
      }
    }
    const fuente = (lead as any).fuente || "Desconocida";
    if (!grouped[fecha]) grouped[fecha] = {};
    grouped[fecha][fuente] = (grouped[fecha][fuente] || 0) + 1;
  });

  const allSources: string[] = Array.from(
    new Set(
      leadsWithValidDate.map((l) =>
        (l as any).fuente
          ? (l as any).fuente
          : "Desconocida"
      )
    )
  );
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

const sourceLabels: Record<string, string> = {
  "Landing": "Landing",
  "Form": "Formulario",
  "Webhook": "Webhook",
  "Desconocida": "Desconocida",
};

const LeadsByDaySourceChart: React.FC<LeadsByDaySourceChartProps> = ({ leads }) => {
  const [dateRange, setDateRange] = useState<{ from: Date | null, to: Date | null }>({
    from: null,
    to: null,
  });

  const { data, sources } = useMemo(() => getLeadsByDayAndSource(leads), [leads]);

  const filteredData = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return data;
    const fromMs = dateRange.from.setHours(0,0,0,0);
    const toMs = dateRange.to.setHours(23,59,59,999);
    return data.filter(({ fecha }) => {
      const fechaMs = new Date(fecha).getTime();
      return fechaMs >= fromMs && fechaMs <= toMs;
    });
  }, [data, dateRange]);

  if (data.length === 0) return null;

  const chartConfig = useMemo(() => {
    const conf: any = {};
    sources.forEach((src) => {
      conf[src] = {
        label: sourceLabels[src] || src,
        color: DARK_GRAY,
      };
    });
    return conf;
  }, [sources]);

  return (
    <div className="w-full h-full">
      <div className="flex justify-end mb-4">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <BarChart 
          data={filteredData} 
          margin={{ top: 10, right: 20, left: 10, bottom: 50 }}
        >
          <XAxis 
            dataKey="fecha" 
            angle={-20} 
            textAnchor="end" 
            height={50} 
            fontSize={12}
          />
          <YAxis allowDecimals={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          {sources.map((src) => (
            <Bar
              key={src}
              dataKey={src}
              fill={DARK_GRAY}
              radius={[4, 4, 0, 0]}
              name={sourceLabels[src] || src}
            >
              <LabelList dataKey={src} position="top" fontSize={13} fill="#222" formatter={(val: number) => val ? val : ""} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadsByDaySourceChart;
