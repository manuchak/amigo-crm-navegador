
import React from 'react';
import { Search, Filter, RefreshCw, Grid, Table } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ProspectFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: string | undefined;
  onFilterChange: (value: string) => void;
  showOnlyInterviewed: boolean;
  onToggleInterviewed: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onRefresh: () => void;
  refreshing: boolean;
}

const ProspectFilters: React.FC<ProspectFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  showOnlyInterviewed,
  onToggleInterviewed,
  viewMode,
  onViewModeChange,
  onRefresh,
  refreshing
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex items-center space-x-4 w-full md:w-auto">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar prospecto..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Select 
          value={filter === undefined ? 'todos' : filter} 
          onValueChange={(value) => onFilterChange(value === 'todos' ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Nuevo">Nuevos</SelectItem>
            <SelectItem value="Contactado">Contactados</SelectItem>
            <SelectItem value="Contacto Llamado">En Llamada</SelectItem>
            <SelectItem value="Calificado">Calificados</SelectItem>
            <SelectItem value="Validado">Validados</SelectItem>
            <SelectItem value="Rechazado">Rechazados</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          className={`${!showOnlyInterviewed ? 'border-primary text-primary' : ''}`}
          onClick={onToggleInterviewed}
        >
          <Filter className="h-4 w-4 mr-1" />
          {showOnlyInterviewed ? 'Mostrar todos' : 'Solo entrevistados'}
        </Button>
        
        <div className="flex rounded-md border">
          <Button
            variant="ghost" 
            size="sm" 
            className={`px-3 ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
            onClick={() => onViewModeChange('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" 
            size="sm" 
            className={`px-3 ${viewMode === 'table' ? 'bg-slate-100' : ''}`}
            onClick={() => onViewModeChange('table')}
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>
    </div>
  );
};

export default ProspectFilters;
