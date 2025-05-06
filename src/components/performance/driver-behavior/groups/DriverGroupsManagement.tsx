
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
    isLoading: isLoadingGroups
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
      <DialogContent className="sm:max-w-[900px] h-[85vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Gestión de Grupos de Conductores</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-4 h-full">
            {/* Sidebar (1/4 width) */}
            <div className="col-span-1 border-r h-full overflow-hidden flex flex-col bg-gray-50">
              {/* Client selector */}
              <div className="p-3 border-b bg-white">
                <Label htmlFor="client-select" className="text-xs font-medium text-gray-500 mb-1 block">
                  Cliente
                </Label>
                <select
                  id="client-select"
                  className="w-full h-9 px-3 py-1 text-sm border rounded-md"
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
              
              {/* Groups search and list */}
              <div className="flex flex-col overflow-hidden flex-1">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar grupos..."
                      className="pl-8 h-9 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 px-3 bg-white border-b">
                  <span className="text-sm font-medium">
                    Grupos{' '}
                    {filteredGroups.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                        {filteredGroups.length}
                      </Badge>
                    )}
                  </span>
                  <Button
                    onClick={handleNewGroup}
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Nuevo</span>
                  </Button>
                </div>
                
                {/* Groups list */}
                <ScrollArea className="flex-1">
                  {isLoadingGroups ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-gray-500">Cargando grupos...</p>
                    </div>
                  ) : filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      {currentClient ? (
                        <>
                          <Users className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">No se encontraron grupos para este cliente</p>
                          <Button 
                            onClick={handleNewGroup} 
                            size="sm" 
                            variant="outline" 
                            className="mt-4 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            <span>Crear grupo</span>
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">Seleccione un cliente para ver sus grupos</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {filteredGroups.map((group) => {
                        const stats = getDriversStatsByScores(group.driver_ids || []);
                        
                        return (
                          <div 
                            key={group.id}
                            className={`p-2.5 border-b hover:bg-gray-100 cursor-pointer transition-colors ${
                              selectedGroupId === group.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleSelectGroup(group)}
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-800 truncate text-sm">{group.name}</h4>
                              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </div>
                            
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3 text-gray-500 flex-shrink-0" />
                              <span className="text-xs text-gray-500">{stats.total} conductores</span>
                            </div>
                            
                            {stats.total > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                {stats.highPerforming > 0 && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 text-[9px] h-4 px-1 border-green-200 font-normal">
                                    {stats.highPerforming} alto
                                  </Badge>
                                )}
                                {stats.midPerforming > 0 && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[9px] h-4 px-1 border-amber-200 font-normal">
                                    {stats.midPerforming} medio
                                  </Badge>
                                )}
                                {stats.lowPerforming > 0 && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 text-[9px] h-4 px-1 border-red-200 font-normal">
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
            
            {/* Main content area (3/4 width) */}
            <div className="col-span-3 flex flex-col h-full overflow-hidden">
              {currentClient ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-2 border-b flex items-center justify-between bg-white">
                    <TabsList className="bg-muted">
                      <TabsTrigger value="groups" className="data-[state=active]:bg-background text-xs py-1.5">
                        Vista General
                      </TabsTrigger>
                      <TabsTrigger value="edit" className="data-[state=active]:bg-background text-xs py-1.5">
                        {formState.isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}
                      </TabsTrigger>
                    </TabsList>
                    
                    {activeTab === 'groups' && (
                      <Button onClick={handleNewGroup} size="sm" className="h-8 text-xs">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        <span>Nuevo Grupo</span>
                      </Button>
                    )}
                  </div>
                  
                  {/* Vista General content */}
                  <TabsContent value="groups" className="flex-1 p-4 m-0 overflow-auto">
                    {filteredGroups.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-xs">
                          <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay grupos creados</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Crea grupos para organizar a los conductores y analizar su rendimiento colectivamente.
                          </p>
                          <Button onClick={handleNewGroup} size="sm" className="text-xs">
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Crear primer grupo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredGroups.map((group) => {
                          const stats = getDriversStatsByScores(group.driver_ids || []);
                          
                          return (
                            <div 
                              key={group.id} 
                              className="border rounded-md overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
                              onClick={() => handleSelectGroup(group)}
                            >
                              <div className="bg-gray-50 border-b p-3 flex justify-between items-center">
                                <h3 className="font-medium text-sm truncate">{group.name}</h3>
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs px-1.5 py-0">
                                  {stats.total} conductores
                                </Badge>
                              </div>
                              
                              <div className="p-3">
                                {group.description && (
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    {group.description}
                                  </p>
                                )}
                                
                                {/* Performance distribution */}
                                {stats.total > 0 && (
                                  <>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                      <span className="text-[11px]">Rendimiento</span>
                                      <span className="text-[10px] text-gray-400">Actualizado: {new Date(group.updated_at || '').toLocaleDateString()}</span>
                                    </div>
                                    <div className="h-2 flex rounded-full overflow-hidden mb-2 bg-gray-100">
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
                                    
                                    <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 text-[10px]">
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                        <span>Alto: {stats.highPerforming}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                        <span>Medio: {stats.midPerforming}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                        <span>Bajo: {stats.lowPerforming}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                                        <span>Sin score: {stats.noScore}</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Edit Form content */}
                  <TabsContent value="edit" className="flex-1 p-0 m-0 overflow-hidden">
                    <form onSubmit={handleSubmit} className="h-full flex flex-col">
                      <div className="flex-1 overflow-auto p-4">
                        <div className="grid grid-cols-3 gap-4">
                          {/* Column 1: Group Information */}
                          <div>
                            <div className="bg-white p-4 rounded-md border mb-4">
                              <h3 className="text-xs font-medium mb-3 text-gray-700">Información del Grupo</h3>
                              
                              <div className="space-y-3">
                                <div>
                                  <Label htmlFor="group-name" className="text-xs mb-1 block">Nombre del Grupo</Label>
                                  <Input
                                    id="group-name"
                                    value={formState.name}
                                    onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nombre del grupo"
                                    className="h-9 text-sm"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="group-client" className="text-xs mb-1 block">Cliente</Label>
                                  <Input
                                    id="group-client"
                                    value={formState.client}
                                    className="h-9 text-sm bg-gray-50"
                                    disabled
                                    readOnly
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="group-description" className="text-xs mb-1 block">Descripción</Label>
                                  <Textarea
                                    id="group-description"
                                    value={formState.description}
                                    onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descripción opcional del grupo"
                                    className="resize-none text-xs"
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Stats for selected drivers */}
                            <div className="bg-white p-4 rounded-md border">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-medium text-gray-700">Conductores Seleccionados</h3>
                                <Badge variant="outline" className="font-normal text-[10px] px-1.5 py-0">
                                  {formState.driver_ids.length} seleccionados
                                </Badge>
                              </div>
                              
                              {formState.driver_ids.length > 0 ? (
                                <>
                                  {(() => {
                                    const stats = getDriversStatsByScores(formState.driver_ids);
                                    return (
                                      <>
                                        <div className="h-2 flex rounded-full overflow-hidden mb-3 bg-gray-100">
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

                                        <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px]">
                                          <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                            <span>Alto: {stats.highPerforming}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                            <span>Medio: {stats.midPerforming}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                            <span>Bajo: {stats.lowPerforming}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                                            <span>Sin score: {stats.noScore}</span>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </>
                              ) : (
                                <div className="text-center py-3 border border-dashed rounded-md">
                                  <User className="h-6 w-6 text-gray-300 mx-auto mb-1.5" />
                                  <p className="text-xs text-gray-500">
                                    No hay conductores seleccionados
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Column 2-3: Drivers selection */}
                          <div className="col-span-2">
                            <div className="bg-white rounded-md border flex flex-col h-full overflow-hidden">
                              <div className="p-4 border-b">
                                <h3 className="text-xs font-medium mb-3 text-gray-700">Seleccionar Conductores</h3>
                                
                                <div className="space-y-2.5">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <Input
                                      placeholder="Buscar conductores..."
                                      className="pl-8 h-8 text-xs"
                                      value={driverSearchTerm}
                                      onChange={(e) => setDriverSearchTerm(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={driversView === 'all' ? 'default' : 'outline'}
                                      className="flex-1 h-7 text-xs py-0"
                                      onClick={() => setDriversView('all')}
                                    >
                                      Todos
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={driversView === 'selected' ? 'default' : 'outline'}
                                      className="flex-1 h-7 text-xs py-0"
                                      onClick={() => setDriversView('selected')}
                                    >
                                      Seleccionados
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={driversView === 'available' ? 'default' : 'outline'}
                                      className="flex-1 h-7 text-xs py-0"
                                      onClick={() => setDriversView('available')}
                                    >
                                      Disponibles
                                    </Button>
                                  </div>
                                  
                                  {/* Actions bar */}
                                  <div className="flex justify-between items-center py-2 px-1 text-sm">
                                    <span className="text-[10px] text-gray-500">
                                      {filteredDrivers.length} conductores
                                    </span>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={filteredDrivers.length === 0 || driversView === 'selected'}
                                        onClick={handleAddAllDrivers}
                                        className="h-6 text-[10px] py-0"
                                      >
                                        <UserPlus className="h-3 w-3 mr-1" />
                                        Agregar todos
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={filteredDrivers.length === 0 || driversView === 'available'}
                                        onClick={handleRemoveAllDrivers}
                                        className="h-6 text-[10px] py-0"
                                      >
                                        <UserMinus className="h-3 w-3 mr-1" />
                                        Remover todos
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Drivers list */}
                              <ScrollArea className="flex-1 border-t">
                                {isLoadingDrivers ? (
                                  <div className="flex flex-col items-center justify-center p-8">
                                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-2 text-sm text-gray-500">Cargando conductores...</p>
                                  </div>
                                ) : filteredDrivers.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <User className="h-8 w-8 text-gray-300 mb-2" />
                                    {driverSearchTerm ? (
                                      <p className="text-xs text-gray-500">
                                        No se encontraron conductores con ese término de búsqueda
                                      </p>
                                    ) : driversView === 'selected' ? (
                                      <p className="text-xs text-gray-500">
                                        No hay conductores seleccionados
                                      </p>
                                    ) : driversView === 'available' ? (
                                      <p className="text-xs text-gray-500">
                                        No hay conductores disponibles
                                      </p>
                                    ) : (
                                      <p className="text-xs text-gray-500">
                                        No se encontraron conductores para este cliente
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 divide-x divide-y">
                                    {filteredDrivers.map((driver) => {
                                      const isSelected = formState.driver_ids.includes(driver.id);
                                      
                                      return (
                                        <div 
                                          key={driver.id}
                                          className={`flex items-center p-2 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                        >
                                          <Checkbox
                                            id={`driver-${driver.id}`}
                                            checked={isSelected}
                                            onCheckedChange={() => toggleDriverSelection(driver.id)}
                                            className="mr-2 h-3 w-3"
                                          />
                                          <label
                                            htmlFor={`driver-${driver.id}`}
                                            className="flex items-center justify-between w-full text-xs cursor-pointer"
                                          >
                                            <span className="flex-1 truncate text-[11px]">{driver.name}</span>
                                            {driver.score !== undefined && (
                                              <span 
                                                className={`
                                                  ml-2 text-[9px] font-medium px-1.5 py-0 rounded-full
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
                      </div>
                      
                      {/* Footer buttons */}
                      <div className="flex justify-between items-center p-3 border-t bg-gray-50">
                        <div>
                          {formState.isEditing && (
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setIsConfirmDeleteOpen(true)}
                              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
                            className="h-8 text-xs"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit"
                            className="flex items-center gap-1 h-8 text-xs"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Guardar</span>
                          </Button>
                        </div>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
                  <div className="bg-gray-50 rounded-full p-4 mb-4">
                    <Users className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-base font-medium">Seleccione un Cliente</h3>
                  <p className="text-xs text-gray-500 mt-2 max-w-md">
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
            <div className="bg-white rounded-lg shadow-lg p-5 max-w-sm w-full mx-4">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 text-red-500 mr-3">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">Confirmar eliminación</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    ¿Está seguro que desea eliminar el grupo "{selectedGroup?.name}"? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteGroup}
                  className="text-xs"
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

