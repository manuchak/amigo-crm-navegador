
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserData, UserRole } from '@/types/auth';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoleDisplayName } from '@/hooks/useRolePermissions';
import { UserRoleBadge } from '@/components/admin/user-management/components/UserRoleBadge';

interface EditRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserData | null;
  newRole: UserRole | null;
  onRoleChange: (role: UserRole) => void;
  onUpdateRole: () => Promise<void>;
  currentUserRole: UserRole;
}

const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedUser,
  newRole,
  onRoleChange,
  onUpdateRole,
  currentUserRole,
}) => {
  const availableRoles: UserRole[] = [
    'unverified',
    'pending',
    'supply',
    'supply_admin',
    'soporte',
    'monitoring',
    'monitoring_supervisor',
    'bi',
    'admin'
  ];

  // If current user is owner, allow assigning owner role
  if (currentUserRole === 'owner') {
    availableRoles.push('owner');
  }

  const handleRoleUpdate = async () => {
    await onUpdateRole();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar rol de usuario</DialogTitle>
        </DialogHeader>
        
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Usuario:</p>
              <p className="text-base">{selectedUser.displayName || selectedUser.email}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Rol Actual:</p>
              <UserRoleBadge role={selectedUser.role} size="md" />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Asignar Nuevo Rol:</p>
              <Select 
                value={newRole || undefined} 
                onValueChange={(value) => onRoleChange(value as UserRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles disponibles</SelectLabel>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex justify-between gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleRoleUpdate}
            disabled={!newRole || newRole === selectedUser?.role}
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
