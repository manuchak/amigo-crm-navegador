
import React from "react";
import { CircleArrowUp, CircleArrowDown } from "lucide-react";
import { statusTextColor, formatPercent } from "./crmUtils";
import { STAGES } from "./crmUtils";

interface Stage {
  key: string;
  label: string;
  value: number;
}

interface MetricsCardsProps {
  byStage: Stage[];
  conversions: (number | null)[];
}

const metricCardClass = "flex flex-col bg-white shadow rounded-lg px-6 py-5 min-w-[180px] max-w-[230px] border";
const statValueClass = "text-2xl font-bold mb-1";
const statTrendClass = "flex items-center gap-1 text-xs";

export const MetricsCards: React.FC<MetricsCardsProps> = ({ byStage, conversions }) => (
  <div className="flex gap-3 flex-1 flex-wrap min-w-[360px]">
    {byStage.slice(0, 4).map((stage, i) => (
      <div key={stage.key} className={metricCardClass}>
        <div className={"mb-2 font-semibold "+statusTextColor[i]}>{stage.label}</div>
        <div className={statValueClass}>{stage.value}</div>
        {i > 0 && (
          <div className={statTrendClass}>
            {conversions[i - 1] !== null && conversions[i - 1]! >= 1 ? <CircleArrowUp className="w-3 h-3 text-green-500" /> : <CircleArrowDown className="w-3 h-3 text-red-500" />}
            <span>
              {conversions[i - 1] !== null 
                ? formatPercent(conversions[i - 1]!)
                : "--"
              } avance
            </span>
          </div>
        )}
      </div>
    ))}
  </div>
);

export default MetricsCards;
