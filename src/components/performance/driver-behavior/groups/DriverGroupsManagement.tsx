
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2, Save, Users, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchDriverGroups, 
  fetchDriversByClient, 
  createDriverGroup, 
  updateDriverGroup, 
  deleteDriverGroup 
} from '../../services/driverBehavior/driverGroupsService';
import { fetchClientList } from '../../services/driverBehavior/driverBehaviorService';
import { DriverGroupDetails, DriverForGroup } from '../../types/driver-behavior.types';

interface DriverGroupsManagementProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient?: string;
}

export function DriverGroupsManagement({ isOpen, onClose, selectedClient }: DriverGroupsManagementProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentClient, setCurrentClient] = useState<string | undefined>(selectedClient);
  
  // Form state for creating/editing groups
  const [formState, setFormState] = useState<{
    id?: string;
    name: string;
    client: string;
    description: string;
    driver_ids: string[];
    isEditing: boolean;
  }>({
    name: '',
    client: currentClient || '',
    description: '',
    driver_ids: [],
    isEditing: false
  });
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);
  
  // Update current client when selectedClient changes
  useEffect(() => {
    if (selectedClient) {
      setCurrentClient(selectedClient);
      setFormState(prev => ({ ...prev, client: selectedClient }));
    }
  }, [selectedClient]);
  
  // Fetch clients list
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-list'],
    queryFn: fetchClientList,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Fetch groups for the selected client
  const { 
    data: groups = [], 
    isLoading: isLoadingGroups,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['driver-groups', currentClient],
    queryFn: () => fetchDriverGroups(currentClient),
    enabled: !!currentClient,
    staleTime: 1000 * 60 // 1 minute
  });
  
  // Fetch drivers for the selected client
  const { 
    data: drivers = [], 
    isLoading: isLoadingDrivers 
  } = useQuery({
    queryKey: ['drivers-by-client', currentClient],
    queryFn: () => currentClient ? fetchDriversByClient(currentClient) : Promise.resolve([]),
    enabled: !!currentClient,
    staleTime: 1000 * 60 // 1 minute
  });
  
  // Filter groups based on search term
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get the currently selected group
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  
  // Handle client change
  const handleClientChange = (clientName: string) => {
    setCurrentClient(clientName);
    setFormState(prev => ({ ...prev, client: clientName }));
    setSelectedGroupId(null);
  };
  
  // Handle group selection
  const handleSelectGroup = (group: DriverGroupDetails) => {
    setSelectedGroupId(group.id);
    setFormState({
      id: group.id,
      name: group.name,
      client: group.client,
      description: group.description || '',
      driver_ids: group.driver_ids || [],
      isEditing: true
    });
    setActiveTab('edit');
  };
  
  // Handle new group button
  const handleNewGroup = () => {
    resetForm();
    setActiveTab('edit');
  };
  
  // Reset form state
  const resetForm = () => {
    setFormState({
      name: '',
      client: currentClient || '',
      description: '',
      driver_ids: [],
      isEditing: false
    });
    setSelectedGroupId(null);
  };
  
  // Handle driver selection toggle
  const toggleDriverSelection = (driverId: string) => {
    setFormState(prev => {
      const isSelected = prev.driver_ids.includes(driverId);
      return {
        ...prev,
        driver_ids: isSelected 
          ? prev.driver_ids.filter(id => id !== driverId)
          : [...prev.driver_ids, driverId]
      };
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.name || !formState.client) {
      toast.error("Datos incompletos", {
        description: "El nombre y cliente son requeridos"
      });
      return;
    }
    
    if (formState.driver_ids.length === 0) {
      toast.error("Sin conductores", {
        description: "Debe seleccionar al menos un conductor"
      });
      return;
    }
    
    try {
      if (formState.isEditing && formState.id) {
        // Update existing group
        const success = await updateDriverGroup({
          id: formState.id,
          name: formState.name,
          client: formState.client,
          description: formState.description,
          driver_ids: formState.driver_ids,
          created_at: selectedGroup?.created_at,
          updated_at: new Date().toISOString()
        });
        
        if (success) {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['driver-groups'] });
          setActiveTab('groups');
        }
      } else {
        // Create new group
        const newGroup = await createDriverGroup({
          name: formState.name,
          client: formState.client,
          description: formState.description,
          driver_ids: formState.driver_ids
        });
        
        if (newGroup) {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['driver-groups'] });
          setActiveTab('groups');
        }
      }
    } catch (error) {
      console.error("Error saving group:", error);
      toast.error("Error al guardar el grupo");
    }
  };
  
  // Handle group deletion
  const handleDeleteGroup = async () => {
    if (!selectedGroupId) return;
    
    if (confirm(`¿Está seguro que desea eliminar el grupo "${selectedGroup?.name}"?`)) {
      try {
        const success = await deleteDriverGroup(selectedGroupId);
        
        if (success) {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['driver-groups'] });
          resetForm();
          setActiveTab('groups');
        }
      } catch (error) {
        console.error("Error deleting group:", error);
        toast.error("Error al eliminar el grupo");
      }
    }
  };
  
  // Get driver name by ID
  const getDriverNameById = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : driverId;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Gestión de Grupos de Conductores</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          {/* Client selection */}
          <div className="w-full sm:w-64">
            <Label htmlFor="client-select">Cliente</Label>
            <select
              id="client-select"
              className="w-full h-10 px-3 py-2 border rounded-md"
              value={currentClient || ''}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search box */}
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar grupos o conductores..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {currentClient ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden mt-2">
            <TabsList className="mb-2">
              <TabsTrigger value="groups">Grupos</TabsTrigger>
              <TabsTrigger value="edit">
                {formState.isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="groups" className="flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">
                  Grupos para {currentClient}
                </h3>
                <Button onClick={handleNewGroup} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Grupo</span>
                </Button>
              </div>
              
              <ScrollArea className="flex-1 border rounded-md">
                {isLoadingGroups ? (
                  <div className="p-4 text-center">Cargando grupos...</div>
                ) : filteredGroups.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No se encontraron grupos para este cliente
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredGroups.map((group) => (
                      <div 
                        key={group.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer ${
                          selectedGroupId === group.id ? 'bg-muted/50' : ''
                        }`}
                        onClick={() => handleSelectGroup(group)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {group.driver_ids?.length || 0} conductores
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectGroup(group);
                            }}
                          >
                            Editar
                          </Button>
                        </div>
                        {group.description && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {group.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="edit" className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="group-name">Nombre del Grupo</Label>
                      <Input
                        id="group-name"
                        value={formState.name}
                        onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre del grupo"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="group-client">Cliente</Label>
                      <Input
                        id="group-client"
                        value={formState.client}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="group-description">Descripción</Label>
                    <Textarea
                      id="group-description"
                      value={formState.description}
                      onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción opcional del grupo"
                      rows={2}
                    />
                  </div>
                  
                  <Label>Conductores Seleccionados ({formState.driver_ids.length})</Label>
                  <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md min-h-[60px]">
                    {formState.driver_ids.length === 0 ? (
                      <div className="w-full text-center text-muted-foreground text-sm py-2">
                        No hay conductores seleccionados
                      </div>
                    ) : (
                      formState.driver_ids.map((driverId) => (
                        <Badge key={driverId} variant="secondary" className="flex items-center gap-1">
                          {getDriverNameById(driverId)}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => toggleDriverSelection(driverId)}
                          />
                        </Badge>
                      ))
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Conductores Disponibles</Label>
                      <span className="text-xs text-muted-foreground">
                        {filteredDrivers.length} conductores
                      </span>
                    </div>
                    
                    <ScrollArea className="border rounded-md h-[200px]">
                      {isLoadingDrivers ? (
                        <div className="p-4 text-center">Cargando conductores...</div>
                      ) : filteredDrivers.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No se encontraron conductores para este cliente
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredDrivers.map((driver) => (
                            <div 
                              key={driver.id}
                              className="flex items-center p-3 hover:bg-muted/50"
                            >
                              <Checkbox
                                id={`driver-${driver.id}`}
                                checked={formState.driver_ids.includes(driver.id)}
                                onCheckedChange={() => toggleDriverSelection(driver.id)}
                              />
                              <label
                                htmlFor={`driver-${driver.id}`}
                                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                              >
                                {driver.name}
                              </label>
                              {driver.score !== undefined && (
                                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {driver.score.toFixed(1)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </form>
              </ScrollArea>
              
              <div className="flex justify-between pt-4 mt-2 border-t">
                <div>
                  {formState.isEditing && (
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={handleDeleteGroup}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Eliminar</span>
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setActiveTab('groups');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Seleccione un Cliente</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Para gestionar grupos de conductores, primero seleccione un cliente de la lista desplegable.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
