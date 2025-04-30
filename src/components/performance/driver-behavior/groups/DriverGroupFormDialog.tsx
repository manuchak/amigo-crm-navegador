
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
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { DriverGroupDetails, DriverForGroup } from "../../types/driver-behavior.types";
import { createDriverGroup, updateDriverGroup, fetchDriversByClient } from "../../services/driverBehavior/driverGroupsService";
import { fetchClientList } from "../../services/driverBehavior/dataService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Validation schema for the form
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre del grupo debe tener al menos 2 caracteres" }),
  client: z.string().min(1, { message: "Debe seleccionar un cliente" }),
  description: z.string().optional(),
  driver_ids: z.array(z.string()).optional()
});

type DriverGroupFormValues = z.infer<typeof formSchema>;

interface DriverGroupFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group?: DriverGroupDetails;
  onSuccess?: () => void;
}

export function DriverGroupFormDialog({ isOpen, onClose, group, onSuccess }: DriverGroupFormDialogProps) {
  const isEditing = !!group;
  const [selectedClient, setSelectedClient] = useState<string>(group?.client || '');
  const [selectedDrivers, setSelectedDrivers] = useState<DriverForGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [driverSelectorOpen, setDriverSelectorOpen] = useState(false);

  // Form definition
  const form = useForm<DriverGroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group?.name || '',
      client: group?.client || '',
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
  const { data: driversData = [], isLoading: isLoadingDrivers } = useQuery({
    queryKey: ['drivers-for-group', selectedClient],
    queryFn: () => fetchDriversByClient(selectedClient),
    enabled: !!selectedClient && selectedClient !== 'all',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log("Drivers data fetched:", driversData);

  // Initialize selected drivers when editing a group
  useEffect(() => {
    if (group && driversData && group.driver_ids) {
      console.log("Setting selected drivers from group.driver_ids:", group.driver_ids);
      const selectedDriversList = driversData.filter(driver => 
        group.driver_ids?.includes(driver.id)
      );
      setSelectedDrivers(selectedDriversList);
    }
  }, [group, driversData]);

  // Update selected client when form value changes
  useEffect(() => {
    const clientValue = form.watch('client');
    if (clientValue && clientValue !== selectedClient) {
      setSelectedClient(clientValue);
      // Clear selected drivers when changing client
      setSelectedDrivers([]);
      form.setValue('driver_ids', []);
    }
  }, [form.watch('client')]);

  // Handle form submission
  const onSubmit = async (values: DriverGroupFormValues) => {
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
          onSuccess();
          onClose();
        }
      } else {
        // Create new group
        const newGroup = await createDriverGroup(values);
        if (newGroup && onSuccess) {
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error("Error submitting group:", error);
      toast.error("Error al guardar el grupo", {
        description: "Hubo un problema al crear el grupo. Por favor intente nuevamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle driver selection
  const toggleDriverSelection = (driver: DriverForGroup) => {
    console.log("Toggling driver selection:", driver);
    
    // Check if driver is already selected
    const isSelected = selectedDrivers.some(d => d.id === driver.id);
    let newSelectedDrivers: DriverForGroup[];
    
    if (isSelected) {
      // Remove driver from selection
      newSelectedDrivers = selectedDrivers.filter(d => d.id !== driver.id);
    } else {
      // Add driver to selection
      newSelectedDrivers = [...selectedDrivers, driver];
    }
    
    console.log("New selected drivers:", newSelectedDrivers);
    setSelectedDrivers(newSelectedDrivers);
    
    // Update form value
    const newDriverIds = newSelectedDrivers.map(d => d.id);
    form.setValue('driver_ids', newDriverIds);
  };

  // Filter drivers based on search term
  const filteredDrivers = driversData.filter(driver => 
    driver.name.toLowerCase().includes(driverSearchTerm.toLowerCase())
  );

  console.log("Driver selection state:", {
    selectedDrivers,
    filteredDrivers,
    selectedClient,
    driversDataCount: driversData.length
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Grupo' : 'Crear Nuevo Grupo'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Actualiza la información del grupo y los conductores asignados.' 
              : 'Crea un nuevo grupo para evaluar el rendimiento colectivo de los conductores.'}
          </DialogDescription>
        </DialogHeader>
        
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
                    <SelectContent>
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
                  <FormControl>
                    <Popover open={driverSelectorOpen} onOpenChange={setDriverSelectorOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!selectedClient || isSubmitting || selectedClient === 'all'}
                          className="w-full justify-between"
                          onClick={() => {
                            console.log("Popover button clicked");
                            setDriverSelectorOpen(true);
                          }}
                        >
                          {selectedDrivers.length ? 
                            `${selectedDrivers.length} conductor(es) seleccionado(s)` : 
                            "Seleccionar conductores"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar conductores..." 
                            value={driverSearchTerm}
                            onValueChange={setDriverSearchTerm}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {isLoadingDrivers ? (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  <span className="ml-2">Cargando conductores...</span>
                                </div>
                              ) : (
                                <div className="py-6 text-center text-sm">
                                  No se encontraron conductores
                                </div>
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredDrivers.length > 0 ? (
                                filteredDrivers.map((driver) => {
                                  const isSelected = selectedDrivers.some(d => d.id === driver.id);
                                  return (
                                    <CommandItem
                                      key={driver.id}
                                      value={driver.name}
                                      onSelect={() => {
                                        toggleDriverSelection(driver);
                                      }}
                                      className="cursor-pointer flex items-center"
                                    >
                                      <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                        isSelected ? "bg-primary border-primary text-primary-foreground" : "opacity-50"
                                      )}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                      </div>
                                      <span>{driver.name}</span>
                                      {driver.score !== undefined && (
                                        <span className="ml-auto text-muted-foreground">
                                          Score: {driver.score}
                                        </span>
                                      )}
                                    </CommandItem>
                                  );
                                })
                              ) : (
                                <div className="py-6 text-center text-sm">
                                  No hay conductores disponibles para este cliente
                                </div>
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  
                  {/* Selected Drivers Display */}
                  {selectedDrivers.length > 0 && (
                    <div className="border rounded-md p-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        {selectedDrivers.length} conductor(es) seleccionado(s):
                      </div>
                      <ScrollArea className="h-[100px]">
                        <div className="flex flex-wrap gap-2">
                          {selectedDrivers.map(driver => (
                            <Badge 
                              key={driver.id} 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              {driver.name}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => toggleDriverSelection(driver)} 
                              />
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
