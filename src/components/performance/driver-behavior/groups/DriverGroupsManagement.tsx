
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDriverGroups, deleteDriverGroup } from '../../services/driverBehavior/driverGroupsService';
import { DriverGroupDetails } from '../../types/driver-behavior.types';
import { DriverGroupFormDialog } from './DriverGroupFormDialog';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Edit, Trash2, Users } from 'lucide-react';

interface DriverGroupsManagementProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient?: string;
}

export function DriverGroupsManagement({ 
  isOpen, 
  onClose, 
  selectedClient 
}: DriverGroupsManagementProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DriverGroupDetails | undefined>(undefined);
  const [groupToDelete, setGroupToDelete] = useState<DriverGroupDetails | null>(null);
  
  // Log the selected client value for debugging
  console.log("DriverGroupsManagement - selectedClient:", selectedClient);
  
  // Fetch driver groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['driver-groups', selectedClient],
    queryFn: () => fetchDriverGroups(selectedClient),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter groups by search term
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle creating a new group
  const handleCreateGroup = () => {
    setSelectedGroup(undefined);
    setIsFormOpen(true);
  };

  // Handle editing a group
  const handleEditGroup = (group: DriverGroupDetails) => {
    console.log("Editing group:", group);
    setSelectedGroup(group);
    setIsFormOpen(true);
  };

  // Handle confirming group deletion
  const handleConfirmDelete = async () => {
    if (groupToDelete) {
      // Convert id to string if it's a number
      const groupId = typeof groupToDelete.id === 'number' 
        ? groupToDelete.id.toString() 
        : groupToDelete.id;
        
      const success = await deleteDriverGroup(groupId);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['driver-groups'] });
      }
      setGroupToDelete(null);
    }
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['driver-groups'] });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Gestión de Grupos de Conductores</SheetTitle>
            <SheetDescription>
              Crea, edita y elimina grupos para evaluar el rendimiento colectivo de los conductores.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 mt-4">
            {/* Search and Create */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar grupos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateGroup}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Crear Grupo
              </Button>
            </div>
            
            {/* Groups List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Grupos</CardTitle>
                <CardDescription>
                  {filteredGroups.length} {filteredGroups.length === 1 ? 'grupo' : 'grupos'} encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Cargando grupos...</p>
                    </div>
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/60" />
                    <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay grupos</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No se encontraron grupos con ese término de búsqueda" : "Comienza creando un grupo de conductores"}
                    </p>
                    {!searchTerm && (
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={handleCreateGroup}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Crear Grupo
                      </Button>
                    )}
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Conductores</TableHead>
                          <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGroups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{group.name}</div>
                                {group.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {group.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{group.client}</Badge>
                            </TableCell>
                            <TableCell>
                              {group.driver_ids?.length || 0} conductor(es)
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleEditGroup(group)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => setGroupToDelete(group)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
              {filteredGroups.length > 0 && (
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {filteredGroups.length} de {groups.length} grupos
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Create/Edit Group Dialog */}
      <DriverGroupFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        group={selectedGroup}
        onSuccess={handleFormSuccess}
        preSelectedClient={selectedClient} // Pass the selected client to the form
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el grupo "{groupToDelete?.name}". 
              Los conductores no serán eliminados, solo la agrupación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
