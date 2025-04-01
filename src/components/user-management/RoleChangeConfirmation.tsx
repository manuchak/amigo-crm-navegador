
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
import { Check } from 'lucide-react';

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
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            Rol actualizado con éxito
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user?.displayName} ahora tiene el rol de <span className="font-semibold">{newRole}</span>.
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
