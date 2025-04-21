
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CircleArrowUp, CircleArrowDown } from "lucide-react";
import { statusTextColor, formatPercent } from "./crmUtils";

interface Stage {
  key: string;
  label: string;
  value: number;
}

interface MetricsCardsProps {
  byStage: Stage[];
  conversions: (number | null)[];
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ byStage, conversions }) => (
  <>
    {byStage.slice(0, 4).map((stage, i) => (
      <Card key={stage.key} className="shadow-sm">
        <CardContent className="p-4">
          <div className={`mb-2 font-semibold ${statusTextColor[i]}`}>{stage.label}</div>
          <div className="text-2xl font-bold mb-1">{stage.value}</div>
          {i > 0 && (
            <div className="flex items-center gap-1 text-xs">
              {conversions[i - 1] !== null && conversions[i - 1]! >= 1 ? 
                <CircleArrowUp className="w-3 h-3 text-green-500" /> : 
                <CircleArrowDown className="w-3 h-3 text-red-500" />
              }
              <span>
                {conversions[i - 1] !== null 
                  ? formatPercent(conversions[i - 1]!)
                  : "--"
                } avance
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    ))}
  </>
);

export default MetricsCards;
