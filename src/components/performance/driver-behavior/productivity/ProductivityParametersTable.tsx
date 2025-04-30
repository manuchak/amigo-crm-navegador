
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Search, ArrowDownToLine } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductivityParameter } from '../../types/productivity.types';
import { deleteProductivityParameter, updateAllFuelPrices } from '../../services/productivity/productivityService';
import { toast } from 'sonner';

interface ProductivityParametersTableProps {
  parameters: ProductivityParameter[];
  clients: string[];
  driverGroups: string[];
  isLoading: boolean;
  onRefresh: () => void;
  selectedClient?: string;
}

export function ProductivityParametersTable({
  parameters,
  isLoading,
  onRefresh,
  selectedClient
}: ProductivityParametersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Filter parameters by search term and selected client
  const filteredParameters = React.useMemo(() => {
    let filtered = parameters;
    
    // Apply client filter if specified in props
    if (selectedClient) {
      filtered = filtered.filter(param => param.client === selectedClient);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(param => 
        param.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (param.driver_group && param.driver_group.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [parameters, searchTerm, selectedClient]);
  
  // Handle delete confirmation
  const confirmDelete = async () => {
    if (deletingId === null) return;
    
    try {
      await deleteProductivityParameter(deletingId);
      toast.success('Parámetro eliminado');
      onRefresh();
    } catch (error) {
      console.error('Error deleting parameter:', error);
      toast.error('Error al eliminar el parámetro');
    } finally {
      setDeletingId(null);
    }
  };
  
  // Handle update all fuel prices
  const handleUpdateAllFuelPrices = async () => {
    try {
      const result = await updateAllFuelPrices();
      toast.success(`Precios de combustible actualizados a $${result.nationalPrice.toFixed(2)}`, {
        description: `${result.recordsUpdated} parámetros actualizados`
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating fuel prices:', error);
      toast.error('Error al actualizar los precios de combustible');
    }
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Distancia Diaria</TableHead>
              <TableHead>Tiempo Diario</TableHead>
              <TableHead>Costo Combustible</TableHead>
              <TableHead>Rendimiento</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(7)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente o grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-gray-200"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleUpdateAllFuelPrices}
          className="flex items-center gap-2 bg-white hover:bg-gray-50"
        >
          <ArrowDownToLine className="h-4 w-4" />
          <span>Actualizar Precios de Combustible</span>
        </Button>
      </div>
      
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium">Cliente</TableHead>
                <TableHead className="font-medium">Grupo</TableHead>
                <TableHead className="font-medium">Distancia Diaria</TableHead>
                <TableHead className="font-medium">Tiempo Diario</TableHead>
                <TableHead className="font-medium">Costo Combustible</TableHead>
                <TableHead className="font-medium">Rendimiento</TableHead>
                <TableHead className="font-medium">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParameters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No se encontraron parámetros
                  </TableCell>
                </TableRow>
              ) : (
                filteredParameters.map((param) => {
                  const hours = Math.floor(param.expected_daily_time_minutes / 60);
                  const minutes = param.expected_daily_time_minutes % 60;
                  
                  return (
                    <TableRow key={param.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{param.client}</TableCell>
                      <TableCell>{param.driver_group || <em className="text-gray-400">Todos</em>}</TableCell>
                      <TableCell>{param.expected_daily_distance} km</TableCell>
                      <TableCell>{hours}h {minutes}m</TableCell>
                      <TableCell>${param.fuel_cost_per_liter.toFixed(2)}</TableCell>
                      <TableCell>{param.expected_fuel_efficiency} km/l</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingId(param.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente este parámetro
              de productividad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
