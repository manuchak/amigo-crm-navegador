
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
  // Layout: Lead status select at the top, other filters below, all stacked, responsive
  return (
    <div className="mb-4 w-full">
      <div className="flex flex-col gap-3">
        <div>
          <LeadStatusSelect value={selectedState} onChange={setSelectedState} />
        </div>
        <div>
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
