
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Cambia el nivel de permiso para {selectedUser?.displayName || 'este usuario'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="col-span-1 text-right">
              Rol:
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
                  {currentUserRole === 'owner' && (
                    <SelectItem value="owner">Propietario</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onUpdateRole} disabled={!newRole || newRole === selectedUser?.role}>
            Actualizar Rol
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
