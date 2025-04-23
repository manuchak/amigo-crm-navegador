
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserRound, MapPin, Star, Phone } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Installer = Tables<"gps_installers">;

interface InstallerProfileDialogProps {
  installer: Installer | null;
  open: boolean;
  onClose: () => void;
}

const InstallerProfileDialog: React.FC<InstallerProfileDialogProps> = ({ installer, open, onClose }) => {
  if (!installer) return null;

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md rounded-2xl bg-white/90 shadow-lg border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary text-xl">
            <UserRound className="w-6 h-6" />
            {installer.nombre}
          </DialogTitle>
          <DialogDescription>
            Detalle del perfil del instalador
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-3">
          <div className="flex items-center gap-2 text-slate-700 text-sm">
            <MapPin className="w-4 h-4 text-violet-400" />
            <span>{installer.direccion_personal || "Sin dirección"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 text-sm">
            <Phone className="w-4 h-4 text-sky-400" />
            <span>{installer.telefono || "Sin teléfono"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 text-sm">
            <span className="font-medium">Certificaciones:</span>
            <span>{installer.certificaciones || "Ninguna"}</span>
          </div>
          {installer.comentarios && (
            <div className="text-slate-500 text-sm mt-3 border-t pt-3">
              <span className="font-semibold">Comentarios:</span>
              <span className="ml-2">{installer.comentarios}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Sin calificación</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallerProfileDialog;
