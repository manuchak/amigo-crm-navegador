
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

// InfoRow simple para cualquier campo con icono y label.
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
      <span className={label ? "ml-1" : ""}>{String(value)}</span>
    </div>
  ) : null;

const FieldGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-3 mt-3">
    <div className="text-xs text-muted-foreground uppercase mb-1 font-semibold tracking-wider">
      {title}
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const InstallerProfileDialog: React.FC<InstallerProfileDialogProps> = ({ installer, open, onClose }) => {
  if (!installer) return null;

  // Desestructuramos todas las posibles variables relevantes del registro
  const {
    nombre,
    direccion_personal,
    telefono,
    email,
    rfc,
    certificaciones,
    comentarios,
    taller,
    taller_direccion,
    taller_features,
    taller_images,
    created_at,
    updated_at,
    id,
  } = installer;

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md rounded-2xl bg-white/90 shadow-lg border-0 px-6 py-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary text-xl">
            <UserRound className="w-6 h-6" />
            {nombre}
          </DialogTitle>
          <DialogDescription>Detalle del perfil del instalador</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <FieldGroup title="Información principal">
            <InfoRow icon={UserRound} label="Nombre" value={nombre} />
            <InfoRow icon={MapPin} label="Dirección personal" value={direccion_personal || "Sin dirección"} />
            <InfoRow icon={Phone} label="Teléfono" value={telefono || "Sin teléfono"} />
            <InfoRow icon={Mail} label="Email" value={email || "Sin email"} />
            <InfoRow icon={FileText} label="RFC" value={rfc || "Sin RFC"} />
            <InfoRow icon={CheckCircle2} label="Certificaciones" value={certificaciones || "Ninguna"} />
            <InfoRow icon={FileText} label="ID" value={id} />
            <InfoRow icon={Star} label="Calificación" value="Sin calificación" />
            <InfoRow icon={CheckCircle2} label="Taller propio" value={taller ? "Sí" : "No"} />
          </FieldGroup>
          <FieldGroup title="Comentarios">
            <div className="text-slate-500 text-sm">
              {comentarios || "Sin comentarios"}
            </div>
          </FieldGroup>
          {taller && (
            <FieldGroup title="Taller">
              <InfoRow icon={Building2} label="Dirección taller" value={taller_direccion || "Sin dirección de taller"} />
              {Array.isArray(taller_features) && taller_features.length > 0 && (
                <div className="pl-1 flex flex-col gap-1">
                  <span className="font-medium text-xs text-muted-foreground">Características:</span>
                  <ul className="ml-1 text-xs text-slate-700 list-disc pl-4">
                    {taller_features.map((f: any, idx: number) => (
                      <li key={idx}>{String(f)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(taller_images) && taller_images.length > 0 && (
                <div>
                  <span className="font-medium text-xs text-muted-foreground">Fotos:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {taller_images.map((img: string, i: number) => (
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
            </FieldGroup>
          )}
          <FieldGroup title="Metadatos">
            <InfoRow icon={FileText} label="Creado" value={created_at ? new Date(created_at).toLocaleDateString() : "-"} />
            <InfoRow icon={FileText} label="Actualizado" value={updated_at ? new Date(updated_at).toLocaleDateString() : "-"} />
          </FieldGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallerProfileDialog;
