
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { ProductivityParameter } from '../../types/productivity.types';
import { ProductivityParametersDialog } from './ProductivityParametersDialog';
import { deleteProductivityParameter } from '../../services/productivity/productivityService';

interface ProductivityParametersTableProps {
  parameters: ProductivityParameter[];
  clients: string[];
  driverGroups: string[];
  isLoading: boolean;
  onRefresh: () => void;
  currentFuelPrice?: number | null;
}

export function ProductivityParametersTable({
  parameters,
  clients,
  driverGroups,
  isLoading,
  onRefresh,
  currentFuelPrice
}: ProductivityParametersTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editParameter, setEditParameter] = useState<ProductivityParameter | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleOpenDialog = () => {
    setEditParameter(undefined);
    setIsDialogOpen(true);
  };
  
  const handleEditParameter = (parameter: ProductivityParameter) => {
    setEditParameter(parameter);
    setIsDialogOpen(true);
  };
  
  const handleDeleteParameter = async (parameter: ProductivityParameter) => {
    if (!confirm(`¿Estás seguro que deseas eliminar los parámetros para ${parameter.client}${parameter.driver_group ? ` - ${parameter.driver_group}` : ''}?`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await deleteProductivityParameter(parameter.id);
      toast.success("Parámetros eliminados", {
        description: `Se eliminaron los parámetros para ${parameter.client}${parameter.driver_group ? ` - ${parameter.driver_group}` : ''}`
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting parameter:", error);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar los parámetros."
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditParameter(undefined);
  };
  
  const handleParameterSaved = () => {
    onRefresh();
  };

  // Check if any parameter has outdated fuel price
  const hasOutdatedFuelPrice = currentFuelPrice && parameters.some(
    param => Math.abs(param.fuel_cost_per_liter - currentFuelPrice) > 0.5
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Parámetros de Productividad</CardTitle>
            <CardDescription>Define los valores esperados por cliente y grupo</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasOutdatedFuelPrice && (
              <div className="flex items-center text-amber-500 text-sm mr-2">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Precios de combustible desactualizados</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button size="sm" onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Parámetro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Cargando parámetros...
            </div>
          ) : parameters.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No hay parámetros definidos.
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={handleOpenDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar nuevo parámetro
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Distancia diaria (km)</TableHead>
                    <TableHead className="text-right">Tiempo diario</TableHead>
                    <TableHead className="text-right">Costo combustible</TableHead>
                    <TableHead className="text-right">Rendimiento (km/l)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.map(param => {
                    const outdatedFuelPrice = currentFuelPrice && 
                      Math.abs(param.fuel_cost_per_liter - currentFuelPrice) > 0.5;
                    
                    return (
                      <TableRow key={param.id}>
                        <TableCell>{param.client}</TableCell>
                        <TableCell>{param.driver_group || 'Todos'}</TableCell>
                        <TableCell className="text-right">{param.expected_daily_distance}</TableCell>
                        <TableCell className="text-right">
                          {Math.floor(param.expected_daily_time_minutes / 60)}h {param.expected_daily_time_minutes % 60}m
                        </TableCell>
                        <TableCell className={`text-right ${outdatedFuelPrice ? 'text-amber-500 font-medium' : ''}`}>
                          ${param.fuel_cost_per_liter.toFixed(2)}/litro
                          {outdatedFuelPrice && <AlertTriangle className="inline-block ml-1 h-4 w-4" />}
                        </TableCell>
                        <TableCell className="text-right">{param.expected_fuel_efficiency}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditParameter(param)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteParameter(param)}
                              disabled={isDeleting}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductivityParametersDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onParameterSaved={handleParameterSaved}
        clients={clients}
        driverGroups={driverGroups}
        editParameter={editParameter}
        currentFuelPrice={currentFuelPrice}
      />
    </>
  );
}
