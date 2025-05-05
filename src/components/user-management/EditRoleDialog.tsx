
import React from 'react';
import { UserData, UserRole } from '@/types/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserRoleBadge } from '@/components/admin/user-management/components/UserRoleBadge';
import { Shield, AlertTriangle } from 'lucide-react';

interface EditRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserData | null;
  newRole: string | null;
  onRoleChange: (role: UserRole) => void;
  onUpdateRole: () => void;
  currentUserRole: UserRole;
}

const EditRoleDialog = ({
  isOpen,
  onOpenChange,
  selectedUser,
  newRole,
  onRoleChange,
  onUpdateRole,
  currentUserRole
}: EditRoleDialogProps) => {
  const userCanAssignOwner = currentUserRole === 'owner';
  
  const availableRoles: { value: UserRole; label: string }[] = [
    { value: 'unverified', label: 'No Verificado' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'soporte', label: 'Soporte' },
    { value: 'supply', label: 'Supply' },
    { value: 'supply_admin', label: 'Supply Admin' },
    { value: 'bi', label: 'Business Intelligence' },
    { value: 'monitoring', label: 'Monitoreo' },
    { value: 'monitoring_supervisor', label: 'Supervisor Monitoreo' },
    { value: 'admin', label: 'Administrador' },
  ];
  
  // Only show owner role if current user is owner
  if (userCanAssignOwner) {
    availableRoles.push({ value: 'owner', label: 'Propietario' });
  }
  
  // Determine if selected role is more powerful than current user
  const isRoleTooHigh = 
    newRole === 'owner' && currentUserRole !== 'owner';
  
  // Display a warning for sensitive roles
  const showRoleWarning = 
    newRole === 'admin' || 
    newRole === 'owner';
  
  const handleRoleChange = (value: string) => {
    onRoleChange(value as UserRole);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Actualizando rol para {selectedUser?.displayName || selectedUser?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="role">Rol actual</Label>
              <div className="mt-1">
                {selectedUser?.role && (
                  <UserRoleBadge role={selectedUser.role} />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="newRole">Nuevo rol</Label>
              <Select value={newRole || ''} onValueChange={handleRoleChange}>
                <SelectTrigger id="newRole">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isRoleTooHigh && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No tienes permisos para asignar este rol</p>
                <p>Solo un usuario con rol de Propietario puede asignar el rol de Propietario.</p>
              </div>
            </div>
          )}
          
          {showRoleWarning && !isRoleTooHigh && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm flex items-start gap-2">
              <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Estás asignando un rol con permisos elevados</p>
                <p>Este rol tiene acceso a funciones administrativas y datos sensibles del sistema. Asegúrate de que este usuario es de confianza.</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onUpdateRole} 
            disabled={!newRole || newRole === selectedUser?.role || isRoleTooHigh}
          >
            Actualizar Rol
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
