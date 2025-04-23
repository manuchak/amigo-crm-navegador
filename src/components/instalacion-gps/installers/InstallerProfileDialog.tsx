
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserRound, MapPin, Star, Phone, Mail, CheckCircle2, FileText, Building2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Installer = Tables<"gps_installers">;

interface InstallerProfileDialogProps {
  installer: Installer | null;
  open: boolean;
  onClose: () => void;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label?: string;
  value?: React.ReactNode;
  className?: string;
}) =>
  value ? (
    <div className={`flex items-center gap-2 text-slate-700 text-sm ${className}`}>
      <Icon className="w-4 h-4 text-violet-400" />
      {label && <span className="font-medium">{label}:</span>}
      <span className={label ? "ml-1" : ""}>{value}</span>
    </div>
  ) : null;

const InstallerProfileDialog: React.FC<InstallerProfileDialogProps> = ({ installer, open, onClose }) => {
  if (!installer) return null;

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md rounded-2xl bg-white/90 shadow-lg border-0 px-6 py-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary text-xl">
            <UserRound className="w-6 h-6" />
            {installer.nombre}
          </DialogTitle>
          <DialogDescription>Detalle del perfil del instalador</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-3">
          <InfoRow icon={MapPin} label="Dirección personal" value={installer.direccion_personal || "Sin dirección"} />
          
          <InfoRow icon={Phone} label="Teléfono" value={installer.telefono || "Sin teléfono"} />
          <InfoRow icon={Mail} label="Email" value={installer.email || "Sin email"} />
          <InfoRow icon={FileText} label="RFC" value={installer.rfc || "Sin RFC"} />

          {/* Certificaciones y comentarios */}
          <InfoRow
            icon={CheckCircle2}
            label="Certificaciones"
            value={installer.certificaciones || "Ninguna"}
          />
          {installer.comentarios && (
            <div className="text-slate-500 text-sm mt-2 border-t pt-3">
              <span className="font-semibold">Comentarios:</span>
              <span className="ml-2">{installer.comentarios}</span>
            </div>
          )}

          {/* Taller info */}
          {installer.taller ? (
            <div className="border-t pt-3 mt-2 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Building2 className="w-4 h-4 text-sky-400" />
                Instalador con taller propio
              </div>
              <InfoRow
                icon={MapPin}
                label="Dirección del taller"
                value={installer.taller_direccion || "Sin dirección de taller"}
                className="pl-5"
              />
              {Array.isArray(installer.taller_features) && installer.taller_features.length > 0 && (
                <div className="pl-5 flex flex-col gap-1">
                  <span className="font-medium text-xs text-muted-foreground">Características del taller:</span>
                  <ul className="ml-1 text-xs text-slate-700 list-disc pl-4">
                    {installer.taller_features.map((f: any, idx: number) => (
                      <li key={idx}>{String(f)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(installer.taller_images) && installer.taller_images.length > 0 && (
                <div className="pl-5">
                  <span className="font-medium text-xs text-muted-foreground">Fotos:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {installer.taller_images.map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Taller img ${i + 1}`}
                        className="rounded-lg w-16 h-16 object-cover border border-violet-100 shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Building2 className="w-4 h-4 text-slate-300" /> Sin taller propio
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t">
            <span>Creado: {installer.created_at && new Date(installer.created_at).toLocaleDateString()}</span>
            <span>|</span>
            <span>Actualizado: {installer.updated_at && new Date(installer.updated_at).toLocaleDateString()}</span>
          </div>

          {/* Calificación */}
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
