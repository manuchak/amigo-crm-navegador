
import React from "react";
import LeadFilterPanel from "./LeadFilterPanel";
import LeadStatusSelect from "./LeadStatusSelect";

interface ExtraLeadFilters {
  carYear?: string;
  hasSedenaId?: string;
  carType?: string;
  fromYear?: number;
  toYear?: number;
  selectedYears?: number[];
}

interface LeadFilterSectionProps {
  carMinYear: number;
  carMaxYear: number;
  selectedState: string;
  setSelectedState: (s: string) => void;
  extraFilters: ExtraLeadFilters;
  setExtraFilters: React.Dispatch<React.SetStateAction<ExtraLeadFilters>>;
}

const LeadFilterSection: React.FC<LeadFilterSectionProps> = ({
  carMinYear,
  carMaxYear,
  selectedState,
  setSelectedState,
  extraFilters,
  setExtraFilters,
}) => {
  return (
    <div className="mb-4">
      <div className="flex flex-col gap-2 md:flex-row md:gap-6 md:items-end">
        <div className="min-w-[180px]">
          <LeadStatusSelect value={selectedState} onChange={setSelectedState} />
        </div>
        <div className="flex-1">
          <LeadFilterPanel
            carMinYear={carMinYear}
            carMaxYear={carMaxYear}
            extraFilters={extraFilters}
            setExtraFilters={setExtraFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default LeadFilterSection;
