
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
import { User, Shield } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getRoleDisplayName } from '@/hooks/useRolePermissions';

interface EditRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserData | null;
  newRole: UserRole;
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
  currentUserRole
}) => {
  if (!selectedUser) return null;

  const isOwner = currentUserRole === 'owner';
  const isHighPrivilegeChange = ['admin', 'owner'].includes(newRole);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Cambia el nivel de permiso para este usuario
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {selectedUser.photoURL ? (
                <AvatarImage src={selectedUser.photoURL} alt={selectedUser.displayName} />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h4 className="text-sm font-medium">{selectedUser.displayName}</h4>
              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="col-span-1 text-right text-sm">
              Rol actual:
            </label>
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{getRoleDisplayName(selectedUser.role)}</span>
                {selectedUser.role === 'owner' && (
                  <Shield className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="col-span-1 text-right text-sm">
              Asignar rol:
            </label>
            <div className="col-span-3">
              <Select
                value={newRole}
                onValueChange={onRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unverified">No verificado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="atención_afiliado">Atención al Afiliado</SelectItem>
                  <SelectItem value="supply">Supply</SelectItem>
                  <SelectItem value="supply_admin">Supply Admin</SelectItem>
                  <SelectItem value="afiliados">Afiliados</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  {isOwner && (
                    <SelectItem value="owner">Propietario</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isHighPrivilegeChange && !isOwner && (
            <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
              <div className="flex gap-2">
                <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-amber-800">Permisos elevados</h5>
                  <p className="text-sm text-amber-700">
                    Solo el propietario del sistema puede asignar roles de administrador o propietario.
                  </p>
                </div>
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
            disabled={!newRole || newRole === selectedUser.role || (isHighPrivilegeChange && !isOwner)}
          >
            Actualizar Rol
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
