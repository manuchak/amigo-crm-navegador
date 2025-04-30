
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
import { Pencil, Trash, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductivityParameter } from "../../types/productivity.types";
import { ProductivityParametersDialog } from "./ProductivityParametersDialog";
import { deleteProductivityParameter } from "../../services/productivity/productivityService";

interface ProductivityParametersTableProps {
  parameters: ProductivityParameter[];
  clients: string[];
  driverGroups: string[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ProductivityParametersTable({
  parameters,
  clients,
  driverGroups,
  isLoading,
  onRefresh
}: ProductivityParametersTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<ProductivityParameter | undefined>();
  const [deletingParameter, setDeletingParameter] = useState<ProductivityParameter | undefined>();
  
  const handleEditParameter = (parameter: ProductivityParameter) => {
    setEditingParameter(parameter);
    setIsAddDialogOpen(true);
  };
  
  const handleDeleteParameter = (parameter: ProductivityParameter) => {
    setDeletingParameter(parameter);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteParameter = async () => {
    if (!deletingParameter) return;
    
    try {
      await deleteProductivityParameter(deletingParameter.id);
      toast.success("Parámetro eliminado", {
        description: `Los parámetros para ${deletingParameter.client} ${deletingParameter.driver_group ? `(${deletingParameter.driver_group})` : ''} han sido eliminados.`
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting parameter:", error);
      toast.error("Error al eliminar parámetro", {
        description: "Ha ocurrido un error al eliminar el parámetro de productividad."
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingParameter(undefined);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Parámetros de Productividad</CardTitle>
          <CardDescription>Define los parámetros de productividad por cliente y grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Parámetros de Productividad</CardTitle>
            <CardDescription>Define los parámetros de productividad por cliente y grupo</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingParameter(undefined);
            setIsAddDialogOpen(true);
          }}>
            Agregar parámetros
          </Button>
        </CardHeader>
        <CardContent>
          {parameters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md border-dashed">
              <AlertCircle className="w-10 h-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No hay parámetros definidos</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Agrega parámetros de productividad para empezar a medir el rendimiento de tus conductores.
              </p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => {
                  setEditingParameter(undefined);
                  setIsAddDialogOpen(true);
                }}
              >
                Agregar parámetros
              </Button>
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
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.map((param) => (
                    <TableRow key={param.id}>
                      <TableCell className="font-medium">{param.client}</TableCell>
                      <TableCell>{param.driver_group || 'Todos'}</TableCell>
                      <TableCell className="text-right">{param.expected_daily_distance}</TableCell>
                      <TableCell className="text-right">
                        {Math.floor(param.expected_daily_time_minutes / 60)}h {param.expected_daily_time_minutes % 60}m
                      </TableCell>
                      <TableCell className="text-right">${param.fuel_cost_per_liter.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{param.expected_fuel_efficiency.toFixed(1)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditParameter(param)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteParameter(param)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {isAddDialogOpen && (
        <ProductivityParametersDialog
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setEditingParameter(undefined);
          }}
          onParameterSaved={onRefresh}
          clients={clients}
          driverGroups={driverGroups}
          editParameter={editingParameter}
        />
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará los parámetros de productividad para
              {deletingParameter && (
                <span className="font-semibold">
                  {` ${deletingParameter.client} ${deletingParameter.driver_group ? `(${deletingParameter.driver_group})` : ''}`}
                </span>
              )}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteParameter}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
