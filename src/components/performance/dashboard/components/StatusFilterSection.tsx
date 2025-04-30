
import React from 'react';
import { ServiceStatusFilter, StatusOption } from "../../filters/ServiceStatusFilter";

interface StatusFilterSectionProps {
  statusOptions: StatusOption[];
  onStatusFilterChange: (value: string, checked: boolean) => void;
}

export function StatusFilterSection({ 
  statusOptions, 
  onStatusFilterChange 
}: StatusFilterSectionProps) {
  return (
    <div className="animate-fade-in duration-300">
      <ServiceStatusFilter 
        statusOptions={statusOptions} 
        onChange={onStatusFilterChange}
      />
    </div>
  );
}
