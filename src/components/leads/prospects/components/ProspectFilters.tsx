
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface ProspectFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter?: string;
  onFilterChange: (filter: string | undefined) => void;
  showOnlyInterviewed: boolean;
  onToggleInterviewed: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onRefresh: () => void;
  refreshing: boolean;
  hideFilters?: boolean;
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
  refreshing,
  hideFilters = false
}) => {
  return (
    <Card className="p-4 border shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="w-full md:w-1/3 flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, teléfono, ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh} 
            disabled={refreshing}
            className="flex-shrink-0"
          >
            <Loader2 className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {!hideFilters && (
          <div className="flex flex-col md:flex-row gap-2 items-start md:items-center w-full md:w-auto">
            <Select value={filter || 'all'} onValueChange={(value) => onFilterChange(value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="Contactado">Contactado</SelectItem>
                <SelectItem value="1er Contacto">1er Contacto</SelectItem>
                <SelectItem value="Contacto Llamado">Contacto Llamado</SelectItem>
                <SelectItem value="Calificado">Calificado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={showOnlyInterviewed ? "default" : "outline"}
              size="sm"
              onClick={onToggleInterviewed}
            >
              {showOnlyInterviewed ? 'Solo con entrevista' : 'Todos los contactos'}
            </Button>
          </div>
        )}
        
        <div className="flex-shrink-0">
          <Tabs defaultValue={viewMode} onValueChange={(v) => onViewModeChange(v as 'grid' | 'table')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Tarjetas</TabsTrigger>
              <TabsTrigger value="table">Tabla</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </Card>
  );
};

export default ProspectFilters;
