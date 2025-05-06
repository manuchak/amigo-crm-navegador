
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Users, 
  X, 
  ChevronRight, 
  Filter, 
  UserPlus, 
  UserMinus, 
  AlertCircle,
  CheckCircle2,
  User,
  UsersRound,
  Info
} from 'lucide-react';

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
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [currentClient, setCurrentClient] = useState<string | undefined>(selectedClient);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [driversView, setDriversView] = useState<'all' | 'selected' | 'available'>('all');
  
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
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Filter drivers based on search term and view mode
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(driverSearchTerm.toLowerCase());
    
    if (driversView === 'selected') {
      return matchesSearch && formState.driver_ids.includes(driver.id);
    } else if (driversView === 'available') {
      return matchesSearch && !formState.driver_ids.includes(driver.id);
    }
    
    return matchesSearch;
  });
  
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
    setDriversView('all');
    setDriverSearchTerm('');
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
  
  // Add all filtered drivers
  const handleAddAllDrivers = () => {
    setFormState(prev => {
      const currentIds = new Set(prev.driver_ids);
      filteredDrivers.forEach(driver => currentIds.add(driver.id));
      return {
        ...prev,
        driver_ids: Array.from(currentIds)
      };
    });
    toast.success(`${filteredDrivers.length} conductores agregados al grupo`);
  };
  
  // Remove all filtered drivers
  const handleRemoveAllDrivers = () => {
    setFormState(prev => {
      const driverIdsToRemove = new Set(filteredDrivers.map(d => d.id));
      return {
        ...prev,
        driver_ids: prev.driver_ids.filter(id => !driverIdsToRemove.has(id))
      };
    });
    toast.success(`${filteredDrivers.length} conductores removidos del grupo`);
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
          toast.success("Grupo actualizado correctamente");
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
          toast.success("Grupo creado correctamente");
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
    
    try {
      const success = await deleteDriverGroup(selectedGroupId);
      
      if (success) {
        toast.success(`Grupo "${selectedGroup?.name}" eliminado correctamente`);
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['driver-groups'] });
        resetForm();
        setActiveTab('groups');
        setIsConfirmDeleteOpen(false);
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Error al eliminar el grupo");
      setIsConfirmDeleteOpen(false);
    }
  };
  
  // Get driver name by ID
  const getDriverNameById = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : driverId;
  };

  // Function to count drivers with score ranges
  const getDriversStatsByScores = (driverIds: string[]) => {
    const selectedDrivers = drivers.filter(d => driverIds.includes(d.id));
    
    return {
      total: selectedDrivers.length,
      highPerforming: selectedDrivers.filter(d => d.score && d.score >= 8).length,
      midPerforming: selectedDrivers.filter(d => d.score && d.score >= 6 && d.score < 8).length,
      lowPerforming: selectedDrivers.filter(d => d.score && d.score < 6).length,
      noScore: selectedDrivers.filter(d => !d.score).length
    };
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1000px] h-[90vh] flex flex-col overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center border-b p-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Gestión de Grupos de Conductores</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar */}
            <div className="w-72 border-r flex flex-col overflow-hidden">
              {/* Client selection */}
              <div className="p-4 border-b">
                <Label htmlFor="client-select" className="text-sm font-medium text-gray-500">
                  Cliente
                </Label>
                <select
                  id="client-select"
                  className="w-full h-10 px-3 py-2 border rounded-md mt-1"
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
              
              {/* Groups search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar grupos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Groups list */}
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                  <span className="font-medium text-sm text-gray-700">
                    Grupos{' '}
                    {filteredGroups.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {filteredGroups.length}
                      </Badge>
                    )}
                  </span>
                  <Button
                    onClick={handleNewGroup}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Nuevo</span>
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100%-57px)]">
                  {isLoadingGroups ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-gray-500">Cargando grupos...</p>
                    </div>
                  ) : filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      {currentClient ? (
                        <>
                          <UsersRound className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">No se encontraron grupos para este cliente</p>
                          <Button 
                            onClick={handleNewGroup} 
                            size="sm" 
                            variant="outline" 
                            className="mt-4"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            <span>Crear grupo</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Info className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">Seleccione un cliente para gestionar sus grupos</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div>
                      {filteredGroups.map((group) => {
                        const stats = getDriversStatsByScores(group.driver_ids || []);
                        
                        return (
                          <div 
                            key={group.id}
                            className={`p-3 hover:bg-muted/50 cursor-pointer border-b transition-colors ${
                              selectedGroupId === group.id ? 'bg-muted/50' : ''
                            }`}
                            onClick={() => handleSelectGroup(group)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 truncate">{group.name}</h4>
                                <div className="flex items-center gap-1 mt-1">
                                  <Users className="h-3.5 w-3.5 text-gray-500" />
                                  <span className="text-xs text-gray-500">{stats.total} conductores</span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </div>
                            
                            {group.description && (
                              <p className="text-xs mt-2 text-gray-500 line-clamp-2">
                                {group.description}
                              </p>
                            )}
                            
                            {stats.total > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                {stats.highPerforming > 0 && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 text-xs border-green-200">
                                    {stats.highPerforming} alto
                                  </Badge>
                                )}
                                {stats.midPerforming > 0 && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs border-amber-200">
                                    {stats.midPerforming} medio
                                  </Badge>
                                )}
                                {stats.lowPerforming > 0 && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 text-xs border-red-200">
                                    {stats.lowPerforming} bajo
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {currentClient ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b flex items-center justify-between">
                    <TabsList className="bg-muted">
                      <TabsTrigger value="groups" className="data-[state=active]:bg-background">
                        Vista General
                      </TabsTrigger>
                      <TabsTrigger value="edit" className="data-[state=active]:bg-background">
                        {formState.isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}
                      </TabsTrigger>
                    </TabsList>
                    
                    {activeTab === 'groups' && (
                      <Button onClick={handleNewGroup} className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Grupo</span>
                      </Button>
                    )}
                  </div>
                  
                  <TabsContent value="groups" className="flex-1 flex flex-col overflow-hidden p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col border-none">
                    {filteredGroups.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center p-8 text-center">
                        <div className="max-w-md">
                          <UsersRound className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay grupos creados</h3>
                          <p className="text-gray-500 mb-6">
                            Crea grupos para organizar a los conductores y analizar su rendimiento colectivamente.
                          </p>
                          <Button onClick={handleNewGroup}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear primer grupo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-auto">
                        {filteredGroups.map((group) => {
                          const stats = getDriversStatsByScores(group.driver_ids || []);
                          
                          return (
                            <div 
                              key={group.id} 
                              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleSelectGroup(group)}
                            >
                              <div className="bg-gray-50 border-b px-4 py-3 flex justify-between items-center">
                                <h3 className="font-medium truncate">{group.name}</h3>
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                  {stats.total} conductores
                                </Badge>
                              </div>
                              
                              <div className="p-4">
                                {group.description && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {group.description}
                                  </p>
                                )}
                                
                                {/* Performance distribution */}
                                {stats.total > 0 && (
                                  <>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                      <span>Distribución de rendimiento</span>
                                    </div>
                                    <div className="h-2 flex rounded-full overflow-hidden mb-2">
                                      {stats.highPerforming > 0 && (
                                        <div 
                                          className="bg-green-500 h-full" 
                                          style={{ width: `${(stats.highPerforming / stats.total) * 100}%` }}
                                        />
                                      )}
                                      {stats.midPerforming > 0 && (
                                        <div 
                                          className="bg-amber-500 h-full" 
                                          style={{ width: `${(stats.midPerforming / stats.total) * 100}%` }}
                                        />
                                      )}
                                      {stats.lowPerforming > 0 && (
                                        <div 
                                          className="bg-red-500 h-full" 
                                          style={{ width: `${(stats.lowPerforming / stats.total) * 100}%` }}
                                        />
                                      )}
                                      {stats.noScore > 0 && (
                                        <div 
                                          className="bg-gray-300 h-full" 
                                          style={{ width: `${(stats.noScore / stats.total) * 100}%` }}
                                        />
                                      )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span>Alto: {stats.highPerforming}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        <span>Medio: {stats.midPerforming}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span>Bajo: {stats.lowPerforming}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                                        <span>Sin score: {stats.noScore}</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              <div className="bg-gray-50 border-t px-4 py-2 text-xs text-gray-500">
                                Creado: {new Date(group.created_at || '').toLocaleDateString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="edit" className="flex-1 flex flex-col overflow-hidden p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col border-none">
                    <ScrollArea className="flex-1">
                      <div className="p-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="group-name">Nombre del Grupo</Label>
                                <Input
                                  id="group-name"
                                  value={formState.name}
                                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Nombre del grupo"
                                  className="mt-1.5"
                                  required
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="group-client">Cliente</Label>
                                <Input
                                  id="group-client"
                                  value={formState.client}
                                  className="mt-1.5 bg-gray-50"
                                  disabled
                                  readOnly
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="group-description">Descripción</Label>
                                <Textarea
                                  id="group-description"
                                  value={formState.description}
                                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Descripción opcional del grupo"
                                  className="mt-1.5"
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-1.5">
                                  <Users className="h-4 w-4" />
                                  Conductores seleccionados
                                </Label>
                                <Badge variant="outline" className="font-normal">
                                  {formState.driver_ids.length} seleccionados
                                </Badge>
                              </div>
                              
                              <div className="border rounded-lg overflow-hidden bg-gray-50">
                                <div className="bg-white border-b p-2 flex items-center gap-2">
                                  <div className="flex-1 relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                      placeholder="Buscar conductores..."
                                      className="pl-8 h-9 shadow-none border-gray-200"
                                      value={driverSearchTerm}
                                      onChange={(e) => setDriverSearchTerm(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className={`text-xs h-9 rounded-r-none border-r ${driversView === 'all' ? 'bg-muted' : ''}`}
                                      onClick={() => setDriversView('all')}
                                    >
                                      Todos
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className={`text-xs h-9 rounded-none border-r ${driversView === 'selected' ? 'bg-muted' : ''}`}
                                      onClick={() => setDriversView('selected')}
                                    >
                                      Seleccionados
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className={`text-xs h-9 rounded-l-none ${driversView === 'available' ? 'bg-muted' : ''}`}
                                      onClick={() => setDriversView('available')}
                                    >
                                      Disponibles
                                    </Button>
                                  </div>
                                </div>

                                <div className="p-2 border-b flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    {filteredDrivers.length} conductores encontrados
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 px-2 text-xs"
                                      disabled={filteredDrivers.length === 0 || driversView === 'selected'}
                                      onClick={handleAddAllDrivers}
                                    >
                                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                                      <span>Agregar todos</span>
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 px-2 text-xs"
                                      disabled={filteredDrivers.length === 0 || driversView === 'available'}
                                      onClick={handleRemoveAllDrivers}
                                    >
                                      <UserMinus className="h-3.5 w-3.5 mr-1" />
                                      <span>Remover todos</span>
                                    </Button>
                                  </div>
                                </div>
                                
                                <ScrollArea className="h-[260px]">
                                  {isLoadingDrivers ? (
                                    <div className="flex flex-col items-center justify-center p-8">
                                      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                      <p className="mt-2 text-sm text-gray-500">Cargando conductores...</p>
                                    </div>
                                  ) : filteredDrivers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                      <User className="h-8 w-8 text-gray-300 mb-2" />
                                      {driverSearchTerm ? (
                                        <p className="text-sm text-gray-500">
                                          No se encontraron conductores con ese término de búsqueda
                                        </p>
                                      ) : driversView === 'selected' ? (
                                        <p className="text-sm text-gray-500">
                                          No hay conductores seleccionados
                                        </p>
                                      ) : driversView === 'available' ? (
                                        <p className="text-sm text-gray-500">
                                          No hay conductores disponibles
                                        </p>
                                      ) : (
                                        <p className="text-sm text-gray-500">
                                          No se encontraron conductores para este cliente
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="divide-y">
                                      {filteredDrivers.map((driver) => {
                                        const isSelected = formState.driver_ids.includes(driver.id);
                                        
                                        return (
                                          <div 
                                            key={driver.id}
                                            className="flex items-center p-3 hover:bg-white transition-colors"
                                          >
                                            <Checkbox
                                              id={`driver-${driver.id}`}
                                              checked={isSelected}
                                              onCheckedChange={() => toggleDriverSelection(driver.id)}
                                              className="mr-2"
                                            />
                                            <label
                                              htmlFor={`driver-${driver.id}`}
                                              className="flex items-center justify-between w-full text-sm cursor-pointer"
                                            >
                                              <span className="flex-1 truncate">{driver.name}</span>
                                              {driver.score !== undefined && (
                                                <span 
                                                  className={`
                                                    text-xs font-medium px-2 py-0.5 rounded-full
                                                    ${driver.score >= 8 ? 'bg-green-100 text-green-800' : 
                                                      driver.score >= 6 ? 'bg-amber-100 text-amber-800' : 
                                                      'bg-red-100 text-red-800'}
                                                  `}
                                                >
                                                  {driver.score.toFixed(1)}
                                                </span>
                                              )}
                                            </label>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </ScrollArea>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </ScrollArea>
                    
                    {/* Footer with buttons */}
                    <div className="flex justify-between p-4 border-t bg-gray-50">
                      <div>
                        {formState.isEditing && (
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsConfirmDeleteOpen(true)}
                            className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
                  <div className="bg-gray-50 rounded-full p-4 mb-4">
                    <Users className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium">Seleccione un Cliente</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Para gestionar grupos de conductores, primero seleccione un cliente de la lista desplegable.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Delete Confirmation Dialog */}
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Está seguro que desea eliminar el grupo "{selectedGroup?.name}"? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsConfirmDeleteOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteGroup}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
