
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  UserRound,
  MapPin,
  Star,
  Phone,
  Mail,
  CheckCircle2,
  FileText,
  Building2,
} from "lucide-react";
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

// Nuevo: Estilos mejorados de ancho, centrado y padding
const InstallerProfileDialog: React.FC<InstallerProfileDialogProps> = ({
  installer,
  open,
  onClose,
}) => {
  if (!installer) return null;

  // Extraemos TODAS las variables del registro del instalador (incluyendo desconocidas)
  // Versión flexible: se listan todas las claves, valor por valor
  const allFieldsRows = Object.entries(installer)
    .filter(([key]) => !["taller_images", "taller_features", "comentarios", "certificaciones", "created_at", "updated_at"].includes(key))
    .map(([key, value]) => (
      <InfoRow
        key={key}
        icon={FileText}
        label={key.replace(/_/g, " ")}
        value={typeof value === "boolean" ? (value ? "Sí" : "No") : value || "-"}
      />
    ));

  // Desestructuramos variables usadas para tileado especial (fotos, taller, etc)
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
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="w-full max-w-2xl lg:max-w-3xl overflow-visible rounded-2xl shadow-xl px-0 pb-0 pt-0 bg-white/90 border-0"
        style={{
          top: "48%",
          transform: "translate(-50%, -48%)",
          marginTop: "2rem", // Extra margen superior
          marginBottom: "2rem", // Extra margen inferior
          maxHeight: "90vh", // NUNCA topa con window
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="flex flex-col h-full max-h-[85vh] px-10 pb-8 pt-7">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary text-2xl mb-1">
              <UserRound className="w-7 h-7" />
              {nombre}
            </DialogTitle>
            <DialogDescription className="mb-3">
              Detalle completo del perfil del instalador
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 flex flex-col gap-6 max-h-[65vh]">
            <FieldGroup title="Información principal">
              <InfoRow icon={UserRound} label="Nombre" value={nombre} />
              <InfoRow
                icon={MapPin}
                label="Dirección personal"
                value={direccion_personal || "Sin dirección"}
              />
              <InfoRow
                icon={Phone}
                label="Teléfono"
                value={telefono || "Sin teléfono"}
              />
              <InfoRow icon={Mail} label="Email" value={email || "Sin email"} />
              <InfoRow icon={FileText} label="RFC" value={rfc || "Sin RFC"} />
              <InfoRow
                icon={CheckCircle2}
                label="Certificaciones"
                value={certificaciones || "Ninguna"}
              />
              <InfoRow icon={FileText} label="ID" value={id} />
              <InfoRow icon={Star} label="Calificación" value="Sin calificación" />
              <InfoRow
                icon={CheckCircle2}
                label="Taller propio"
                value={taller ? "Sí" : "No"}
              />
            </FieldGroup>
            {/* Mostrar todos los campos brutos extras que no tienen tileado especial */}
            <FieldGroup title="Extras registro bruto">
              {allFieldsRows}
            </FieldGroup>
            <FieldGroup title="Comentarios">
              <div className="text-slate-500 text-sm">
                {comentarios || "Sin comentarios"}
              </div>
            </FieldGroup>
            {taller && (
              <FieldGroup title="Taller">
                <InfoRow
                  icon={Building2}
                  label="Dirección taller"
                  value={taller_direccion || "Sin dirección de taller"}
                />
                {Array.isArray(taller_features) && taller_features.length > 0 && (
                  <div className="pl-1 flex flex-col gap-1">
                    <span className="font-medium text-xs text-muted-foreground">
                      Características:
                    </span>
                    <ul className="ml-1 text-xs text-slate-700 list-disc pl-4">
                      {taller_features.map((f: any, idx: number) => (
                        <li key={idx}>{String(f)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(taller_images) && taller_images.length > 0 && (
                  <div>
                    <span className="font-medium text-xs text-muted-foreground">
                      Fotos:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {taller_images.map((img: string, i: number) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Taller img ${i + 1}`}
                          className="rounded-lg w-20 h-20 object-cover border border-violet-100 shadow"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </FieldGroup>
            )}
            <FieldGroup title="Metadatos">
              <InfoRow
                icon={FileText}
                label="Creado"
                value={
                  created_at
                    ? new Date(created_at).toLocaleString("es-MX")
                    : "-"
                }
              />
              <InfoRow
                icon={FileText}
                label="Actualizado"
                value={
                  updated_at
                    ? new Date(updated_at).toLocaleString("es-MX")
                    : "-"
                }
              />
            </FieldGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallerProfileDialog;
