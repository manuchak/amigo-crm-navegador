
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PeriodOption = "3m" | "6m" | "1y" | "2y" | "ytd" | "all";

interface PeriodFilterProps {
  value: PeriodOption;
  onChange: (value: PeriodOption) => void;
  className?: string;
  label?: boolean;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({ value, onChange, className, label = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-sm text-muted-foreground">Periodo:</span>}
      <Select value={value} onValueChange={(val) => onChange(val as PeriodOption)}>
        <SelectTrigger className="w-[110px] h-8 text-xs">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3m">Últimos 3 meses</SelectItem>
          <SelectItem value="6m">Últimos 6 meses</SelectItem>
          <SelectItem value="1y">Último año</SelectItem>
          <SelectItem value="2y">Últimos 2 años</SelectItem>
          <SelectItem value="ytd">Año actual</SelectItem>
          <SelectItem value="all">Todo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PeriodFilter;
