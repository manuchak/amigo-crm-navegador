
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Search, X } from "lucide-react";
import { DriverGroupDetails, DriverForGroup } from "../../types/driver-behavior.types";
import { createDriverGroup, updateDriverGroup, fetchDriversByClient } from "../../services/driverBehavior/driverGroupsService";
import { fetchClientList } from "../../services/driverBehavior/dataService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Validation schema for the form
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre del grupo debe tener al menos 2 caracteres" }),
  client: z.string().min(1, { message: "Debe seleccionar un cliente" }),
  description: z.string().optional(),
  driver_ids: z.array(z.string()).min(1, { message: "Debe seleccionar al menos un conductor" })
});

type DriverGroupFormValues = z.infer<typeof formSchema>;

interface DriverGroupFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group?: DriverGroupDetails;
  onSuccess?: () => void;
  preSelectedClient?: string; // New prop for pre-selected client
}

export function DriverGroupFormDialog({ 
  isOpen, 
  onClose, 
  group, 
  onSuccess,
  preSelectedClient 
}: DriverGroupFormDialogProps) {
  const isEditing = !!group;
  // Initialize selectedClient with preSelectedClient if provided or group.client if editing, otherwise empty string
  const [selectedClient, setSelectedClient] = useState<string>(
    group?.client || preSelectedClient || ''
  );
  const [selectedDrivers, setSelectedDrivers] = useState<DriverForGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDriversList, setShowDriversList] = useState(false);

  // Form definition with default values
  const form = useForm<DriverGroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name || '',
      // Initialize client with preSelectedClient or group.client or empty string
      client: group?.client || preSelectedClient || '',
      description: group?.description || '',
      driver_ids: group?.driver_ids || []
    }
  });

  // Fetch clients for dropdown
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['driver-behavior-clients-for-groups'],
    queryFn: fetchClientList,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch drivers for selected client
  const { 
    data: drivers = [], 
    isLoading: isLoadingDrivers, 
    error: driversError, 
    refetch: refetchDrivers,
    isFetched
  } = useQuery({
    queryKey: ['drivers-for-group', selectedClient],
    queryFn: () => fetchDriversByClient(selectedClient),
    enabled: !!selectedClient && selectedClient !== 'all',
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  // When the dialog opens and we have a preSelectedClient or group.client, set the client value in the form
  useEffect(() => {
    if (isOpen) {
      const clientToUse = group?.client || preSelectedClient;
      if (clientToUse) {
        form.setValue('client', clientToUse, { shouldValidate: true });
        setSelectedClient(clientToUse);
      }
    }
  }, [isOpen, group, preSelectedClient, form]);
  
  // If there's an error fetching drivers, show a toast
  useEffect(() => {
    if (driversError) {
      toast.error("Error al cargar conductores", {
        description: "Intente seleccionar otro cliente o reintentar más tarde"
      });
    }
  }, [driversError]);

  // Initialize selected drivers when editing a group or when drivers data is loaded
  useEffect(() => {
    if (group && group.driver_ids && group.driver_ids.length > 0 && drivers && drivers.length > 0) {
      // Find the drivers that match the IDs in the group
      const driverMatches = drivers.filter(driver => 
        group.driver_ids?.includes(driver.id)
      );
      
      if (driverMatches.length > 0) {
        setSelectedDrivers(driverMatches);
      }
    }
  }, [group, drivers]);

  // Update selected client when form value changes
  useEffect(() => {
    const clientValue = form.watch('client');
    if (clientValue && clientValue !== selectedClient) {
      setSelectedClient(clientValue);
      setSelectedDrivers([]);
      form.setValue('driver_ids', []);
      
      // Close the drivers list when changing clients
      setShowDriversList(false);
    }
  }, [form.watch('client')]);

  // Set form driver_ids when selectedDrivers changes
  useEffect(() => {
    const driverIds = selectedDrivers.map(driver => driver.id);
    form.setValue('driver_ids', driverIds, { shouldValidate: true });
  }, [selectedDrivers]);

  // Handle form submission
  const onSubmit = async (values: DriverGroupFormValues) => {
    if (!values.driver_ids || values.driver_ids.length === 0) {
      toast.warning("Debe seleccionar al menos un conductor");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && group) {
        // Update existing group
        const updatedGroup = {
          ...group,
          name: values.name,
          description: values.description,
          driver_ids: values.driver_ids 
        };
        
        const success = await updateDriverGroup(updatedGroup);
        if (success && onSuccess) {
          toast.success("Grupo actualizado exitosamente");
          onSuccess();
          onClose();
        }
      } else {
        // Create new group
        const newGroup = await createDriverGroup(values);
        if (newGroup && onSuccess) {
          toast.success("Grupo creado exitosamente");
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      toast.error("Error al guardar el grupo", {
        description: "Hubo un problema al procesar la solicitud. Por favor intente nuevamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle driver selection
  const toggleDriverSelection = (driver: DriverForGroup) => {
    // Check if driver is already selected
    const isAlreadySelected = selectedDrivers.some(d => d.id === driver.id);
    
    if (isAlreadySelected) {
      // Remove driver from selection
      setSelectedDrivers(prev => prev.filter(d => d.id !== driver.id));
    } else {
      // Add driver to selection
      setSelectedDrivers(prev => [...prev, driver]);
    }
  };

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle drivers list visibility
  const toggleDriversList = () => {
    if (!selectedClient || selectedClient === 'all') {
      toast.info("Seleccione un cliente primero");
      return;
    }
    
    if (showDriversList && selectedClient) {
      // If we're closing the list, refetch drivers to ensure we have the latest data
      refetchDrivers();
    }
    
    setShowDriversList(!showDriversList);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden flex flex-col h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Grupo' : 'Crear Nuevo Grupo'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Actualiza la información del grupo y los conductores asignados.' 
              : 'Crea un nuevo grupo para evaluar el rendimiento colectivo de los conductores.'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="p-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Group Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Grupo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre del grupo" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Client Selection - Disabled when editing */}
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        disabled={isEditing || isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          {isLoadingClients ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
                            </div>
                          ) : (
                            clientsData?.map((client: string) => (
                              <SelectItem key={client} value={client}>{client}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción del grupo (opcional)"
                          className="resize-none"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Driver Selection */}
                <FormField
                  control={form.control}
                  name="driver_ids"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Conductores</FormLabel>
                      <div className="space-y-4">
                        {/* Driver Selection Button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                          onClick={toggleDriversList}
                          disabled={!selectedClient || selectedClient === 'all' || isSubmitting}
                        >
                          {selectedDrivers.length > 0 ? 
                            `${selectedDrivers.length} conductor(es) seleccionado(s)` : 
                            "Seleccionar conductores"}
                          {showDriversList ? <X className="ml-2 h-4 w-4" /> : <Search className="ml-2 h-4 w-4" />}
                        </Button>
                        
                        {/* Selected Drivers Display */}
                        {selectedDrivers.length > 0 && (
                          <div className="border rounded-md p-3 bg-muted/30">
                            <div className="text-sm text-muted-foreground mb-2">
                              Conductores seleccionados:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedDrivers.map(driver => (
                                <Badge 
                                  key={driver.id} 
                                  variant="secondary" 
                                  className="flex items-center gap-1 py-1 px-2"
                                >
                                  <span className="truncate max-w-[200px]" title={driver.name}>{driver.name}</span>
                                  <X 
                                    className="h-3 w-3 cursor-pointer ml-1 flex-shrink-0" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDriverSelection(driver);
                                    }} 
                                  />
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Drivers Dropdown Panel */}
                        {showDriversList && (
                          <div className="border rounded-md overflow-hidden mt-2">
                            {/* Search Bar */}
                            <div className="p-2 border-b bg-muted/30 sticky top-0 z-10">
                              <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Buscar conductores..."
                                  className="pl-8"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            {/* Drivers List */}
                            <ScrollArea className="h-[200px] w-full">
                              {isLoadingDrivers ? (
                                <div className="flex flex-col items-center justify-center h-full p-4">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                  <p className="mt-2 text-sm text-muted-foreground">Cargando conductores...</p>
                                </div>
                              ) : filteredDrivers.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                  {searchTerm ? 
                                    "No se encontraron conductores con ese término de búsqueda" : 
                                    "No hay conductores disponibles para este cliente"}
                                </div>
                              ) : (
                                <div className="divide-y">
                                  {filteredDrivers.map((driver) => {
                                    const isSelected = selectedDrivers.some(d => d.id === driver.id);
                                    return (
                                      <div 
                                        key={driver.id}
                                        className={cn(
                                          "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                                          isSelected && "bg-primary/10"
                                        )}
                                        onClick={() => toggleDriverSelection(driver)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={cn(
                                            "flex h-5 w-5 items-center justify-center rounded border",
                                            isSelected 
                                              ? "bg-primary border-primary text-primary-foreground" 
                                              : "border-input"
                                          )}>
                                            {isSelected && <Check className="h-3 w-3" />}
                                          </div>
                                          <span className="font-medium truncate max-w-[280px]" title={driver.name}>{driver.name}</span>
                                        </div>
                                        {driver.score !== undefined && (
                                          <span className="text-sm text-muted-foreground">
                                            Score: {driver.score}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </ScrollArea>
                          </div>
                        )}
                        
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>
            
        <DialogFooter className="pt-4 mt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="ml-2"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
