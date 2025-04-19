
import React from "react";
import VehicleYearFilter from "./VehicleYearFilter";

interface ExtraLeadFilters {
  carYear?: string;
  hasSedenaId?: string;
  carType?: string;
  fromYear?: number;
  toYear?: number;
  selectedYears?: number[];
}

interface LeadFilterPanelProps {
  carMinYear: number;
  carMaxYear: number;
  extraFilters: ExtraLeadFilters;
  setExtraFilters: React.Dispatch<React.SetStateAction<ExtraLeadFilters>>;
}

const LeadFilterPanel: React.FC<LeadFilterPanelProps> = ({
  carMinYear,
  carMaxYear,
  extraFilters,
  setExtraFilters,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 z-50 relative">
      <div>
        <label className="text-xs font-medium mb-1 block">Año vehículo</label>
        <VehicleYearFilter
          minYear={carMinYear}
          maxYear={carMaxYear}
          fromYear={extraFilters.fromYear}
          toYear={extraFilters.toYear}
          selectedYears={extraFilters.selectedYears}
          onChange={(years, from, to) =>
            setExtraFilters((f) => ({
              ...f,
              selectedYears: years,
              fromYear: from,
              toYear: to,
            }))
          }
        />
      </div>
      <div>
        <label className="text-xs font-medium">Credencial SEDENA</label>
        <select
          className="w-full rounded border px-2 py-1 text-xs bg-white"
          value={extraFilters.hasSedenaId || ""}
          onChange={(e) =>
            setExtraFilters((f) => ({
              ...f,
              hasSedenaId: e.target.value || undefined,
            }))
          }
        >
          <option value="">Todos</option>
          <option value="yes">Sí</option>
          <option value="no">No</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">Tipo de Auto</label>
        <select
          className="w-full rounded border px-2 py-1 text-xs bg-white"
          value={extraFilters.carType || ""}
          onChange={(e) =>
            setExtraFilters((f) => ({
              ...f,
              carType: e.target.value || undefined,
            }))
          }
        >
          <option value="">Todos</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Sedán">Sedán</option>
          <option value="SUV">SUV</option>
          <option value="Pickup">Pickup</option>
        </select>
      </div>
    </div>
  );
};

export default LeadFilterPanel;

