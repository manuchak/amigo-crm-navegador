
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadFiltersProps {
  filter: string;
  setFilter: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({ filter, setFilter, onRefresh, isRefreshing }) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="border-slate-200"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualizar
      </Button>
      
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] border-slate-200 text-sm">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="armados">Armados</SelectItem>
            <SelectItem value="vehiculo">Con vehículo</SelectItem>
            <SelectItem value="nuevos">Nuevos</SelectItem>
            <SelectItem value="contactados">Contactados</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LeadFilters;
