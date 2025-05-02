
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CircleArrowUp, CircleArrowDown, HelpCircle } from "lucide-react";
import { statusTextColor, formatPercent } from "./crmUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Stage {
  key: string;
  label: string;
  value: number;
}

interface MetricsCardsProps {
  byStage: Stage[];
  conversions: (number | null)[];
}

const getStageDescription = (label: string): string => {
  switch (label) {
    case "Nuevos":
      return "Leads que acaban de ingresar al sistema y aún no han sido contactados.";
    case "Contactados":
      return "Leads que han sido contactados por teléfono o email.";
    case "Calificados":
      return "Leads que han pasado el proceso de calificación y cumplen con los requisitos.";
    case "Contratados":
      return "Leads que han sido contratados y están listos para empezar a trabajar.";
    default:
      return "Información sobre esta etapa del embudo de conversión.";
  }
};

const MetricsCards: React.FC<MetricsCardsProps> = ({ byStage, conversions }) => (
  <>
    {byStage.map((stage, i) => {
      // Calculate the correct conversion index based on stage position
      const conversionIndex = i > 0 ? i - 1 : null;
      const conversionValue = conversionIndex !== null ? conversions[conversionIndex] : null;
      
      return (
        <Card key={stage.key} className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className={`mb-2 font-semibold ${statusTextColor[byStage.indexOf(stage)]}`}>{stage.label}</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-white p-3 text-sm shadow-lg rounded-lg border">
                    <p>{getStageDescription(stage.label)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-bold mb-1">{stage.value}</div>
            {conversionValue !== null && (
              <div className="flex items-center gap-1 text-xs">
                {conversionValue !== null && conversionValue >= 1 ? 
                  <CircleArrowUp className="w-3 h-3 text-green-500" /> : 
                  <CircleArrowDown className="w-3 h-3 text-red-500" />
                }
                <span>
                  {conversionValue !== null 
                    ? formatPercent(conversionValue)
                    : "--"
                  } avance
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      );
    })}
  </>
);

export default MetricsCards;
