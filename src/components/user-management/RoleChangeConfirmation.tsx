
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserData, UserRole } from '@/types/auth';
import { UserRoleBadge } from '@/components/admin/user-management/components/UserRoleBadge';
import { Check } from 'lucide-react';

interface RoleChangeConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  newRole: UserRole | null;
}

const RoleChangeConfirmation: React.FC<RoleChangeConfirmationProps> = ({
  isOpen,
  onOpenChange,
  user,
  newRole,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Cambio de rol exitoso
          </DialogTitle>
        </DialogHeader>
        
        {user && newRole && (
          <div className="space-y-4 py-2">
            <p>
              El rol de <span className="font-medium">{user.displayName || user.email}</span> ha sido actualizado exitosamente a:
            </p>
            
            <div className="flex justify-center py-2">
              <UserRoleBadge role={newRole} size="lg" />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleChangeConfirmation;
