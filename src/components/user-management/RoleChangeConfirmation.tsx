
import React from 'react';
import { UserData } from '@/types/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2 } from 'lucide-react';
import { getRoleDisplayName } from '@/hooks/useRolePermissions';

interface RoleChangeConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  newRole: string;
}

const RoleChangeConfirmation: React.FC<RoleChangeConfirmationProps> = ({
  isOpen,
  onOpenChange,
  user,
  newRole,
}) => {
  if (!user) return null;
  
  const roleDisplayName = getRoleDisplayName(newRole as any);
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Rol actualizado con éxito
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user.displayName || user.email} ahora tiene el rol de <span className="font-semibold">{roleDisplayName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Aceptar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RoleChangeConfirmation;
