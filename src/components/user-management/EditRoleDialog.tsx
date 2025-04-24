
import React from 'react';
import {
  Dialog,
  DialogContent,
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
import { UserData, UserRole } from '@/types/auth';
import { ROLES, getRoleDisplayName } from '@/hooks/useRolePermissions';

interface EditRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserData | null;
  newRole: string;
  onRoleChange: (value: UserRole) => void;
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
  const [loading, setLoading] = React.useState(false);

  // Filter out roles based on user's own role
  const availableRoles = ROLES.filter(role => {
    // Only owner can assign owner role
    if (role === 'owner') {
      return currentUserRole === 'owner';
    }
    
    // Admin can't assign admin roles (only owner can)
    if (role === 'admin') {
      return currentUserRole === 'owner';
    }
    
    // Everyone can see other roles
    return true;
  });

  const handleSave = async () => {
    setLoading(true);
    await onUpdateRole();
    setLoading(false);
  };
  
  if (!selectedUser) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Rol de Usuario</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Usuario</p>
              <p className="text-base">{selectedUser.displayName || selectedUser.email}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Email</p>
              <p className="text-base">{selectedUser.email}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Rol
              </label>
              <Select 
                value={newRole}
                onValueChange={(value) => onRoleChange(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
