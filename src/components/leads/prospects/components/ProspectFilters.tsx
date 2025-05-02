
import React from 'react';
import { Search, Filter, RefreshCw, LayoutGrid, Table } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
    <Card className="p-3 border shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[220px]">
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
              <SelectValue placeholder="Estado" />
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
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            className={`${!showOnlyInterviewed ? 'border-primary text-primary' : ''}`}
            onClick={onToggleInterviewed}
          >
            <Filter className="h-4 w-4 mr-1" />
            {showOnlyInterviewed ? 'Mostrar todos' : 'Solo entrevistados'}
          </Button>
          
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost" 
              size="sm" 
              className={`rounded-none ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" 
              size="sm" 
              className={`rounded-none ${viewMode === 'table' ? 'bg-slate-100' : ''}`}
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
    </Card>
  );
};

export default ProspectFilters;
