
import { useState, useMemo } from 'react';
import { Prospect } from '@/services/prospectService';

export interface ProspectFiltersState {
  filter: string | undefined;
  searchQuery: string;
  viewMode: 'grid' | 'table';
  showOnlyInterviewed: boolean;
}

export function useProspectFilters(prospects: Prospect[]) {
  const [filterState, setFilterState] = useState<ProspectFiltersState>({
    filter: "Contacto Llamado", // Default to "Contacto Llamado" status
    searchQuery: '',
    viewMode: 'table', // Default to table view
    showOnlyInterviewed: false
  });
  
  const setFilter = (filter: string | undefined) => {
    setFilterState(prev => ({ ...prev, filter }));
  };
  
  const setSearchQuery = (searchQuery: string) => {
    setFilterState(prev => ({ ...prev, searchQuery }));
  };
  
  const setViewMode = (viewMode: 'grid' | 'table') => {
    setFilterState(prev => ({ ...prev, viewMode }));
  };
  
  const toggleInterviewed = () => {
    setFilterState(prev => ({ ...prev, showOnlyInterviewed: !prev.showOnlyInterviewed }));
  };
  
  // Improved filtering logic to detect duplicates based on lead_id, validated_lead_id, and phone numbers
  const uniqueProspects = useMemo(() => {
    return prospects.reduce((unique: Prospect[], prospect) => {
      // First, normalize phone numbers for comparison by removing non-digit characters
      const normalizePhone = (phone: string | null): string => {
        if (!phone) return '';
        return phone.replace(/\D/g, '').slice(-10); // Get last 10 digits only
      };
      
      const prospectPhone = normalizePhone(prospect.lead_phone || prospect.phone_number_intl);
      
      // Check if we already have this prospect in our unique array
      const isDuplicate = unique.some(item => {
        // Same lead_id or validated_lead_id
        if ((prospect.lead_id && item.lead_id === prospect.lead_id) || 
            (prospect.validated_lead_id && item.validated_lead_id === prospect.validated_lead_id)) {
          return true;
        }
        
        // Same phone number (if available)
        if (prospectPhone && 
            (normalizePhone(item.lead_phone) === prospectPhone || 
             normalizePhone(item.phone_number_intl) === prospectPhone)) {
          return true;
        }
        
        // Same email (if available)
        if (prospect.lead_email && item.lead_email === prospect.lead_email && prospect.lead_email !== '') {
          return true;
        }
        
        return false;
      });
      
      if (!isDuplicate) {
        unique.push(prospect);
      }
      return unique;
    }, []);
  }, [prospects]);
  
  // Apply VAPI interview filter
  const filteredByVapi = useMemo(() => {
    return uniqueProspects.filter(lead => {
      if (filterState.filter === "todos") return true;
      if (filterState.filter === "con_vapi") return (lead.call_count ?? 0) > 0;
      if (filterState.filter === "sin_vapi") return !lead.call_count || lead.call_count === 0;
      return true;
    });
  }, [uniqueProspects, filterState.filter]);

  // Apply search filter and exclude "Validado" status prospects unless specifically filtered for
  const filteredLeads = useMemo(() => {
    return filteredByVapi.filter(lead => {
      // Skip prospects with "Validado" status unless we're specifically filtering for them
      if (filterState.filter !== "Validado" && lead.lead_status === "Validado") return false;
      
      // Apply interview filter if needed
      if (filterState.showOnlyInterviewed && !lead.transcript) return false;
      
      if (!filterState.searchQuery) return true;
      const searchLower = filterState.searchQuery.toLowerCase();
      return (
        lead.lead_name?.toLowerCase().includes(searchLower) || 
        lead.lead_email?.toLowerCase().includes(searchLower) ||
        lead.lead_name?.toLowerCase().includes(searchLower) || 
        lead.custodio_name?.toLowerCase().includes(searchLower) || 
        lead.lead_phone?.includes(searchLower) ||
        lead.phone_number_intl?.includes(searchLower)
      );
    });
  }, [filteredByVapi, filterState.filter, filterState.searchQuery, filterState.showOnlyInterviewed]);

  return {
    filterState,
    setFilter,
    setSearchQuery,
    setViewMode,
    toggleInterviewed,
    filteredLeads
  };
}
