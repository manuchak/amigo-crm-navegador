
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, User, Star, MapPin, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import InstallerProfileDialog from "./InstallerProfileDialog";

type Installer = Tables<"gps_installers">;

interface Props {
  value: Installer | null;
  onChange: (installer: Installer | null) => void;
  onRegisterNew?: () => void;
  disabled?: boolean;
}

export function InstallerSelectMinimal({ value, onChange, onRegisterNew, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileDialogInstaller, setProfileDialogInstaller] = useState<Installer | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    async function loadInstallers() {
      setLoading(true);
      const { data } = await supabase
        .from("gps_installers")
        .select("*")
        .order("created_at", { ascending: false });
      if (!ignore) setInstallers(data || []);
      setLoading(false);
    }
    loadInstallers();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = installers.filter(inst =>
    inst.nombre?.toLowerCase().includes(search.toLowerCase())
    || inst.telefono?.includes(search)
    || inst.rfc?.toLowerCase().includes(search.toLowerCase())
  );

  // Muestra nombre, dirección y calificación en el dropdown, y un botón perfil
  const renderInstallerLabel = (inst: Installer) => (
    <div className="flex flex-col items-start gap-0 min-w-0">
      <div className="flex items-center gap-1">
        <span className="font-semibold text-primary">{inst.nombre}</span>
        {inst.certificaciones && (
          <Badge variant="purple" className="ml-1">{inst.certificaciones}</Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
        {inst.direccion_personal && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-violet-300" />
            {inst.direccion_personal}
          </span>
        )}
        <span className="flex items-center gap-1 ml-2">
          <Star className="w-3 h-3 text-yellow-400" />
          Sin calificación
        </span>
      </div>
    </div>
  );

  return (
    <div className="relative w-full mt-0.5">
      <button
        type="button"
        className={cn(
          "w-full text-left flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-violet-100 shadow transition-all ring-0 focus-visible:ring-2 focus-visible:ring-violet-300 bg-white/75 focus:outline-none",
          disabled && "opacity-60 pointer-events-none"
        )}
        onClick={() => setOpen(!open)}
        tabIndex={0}
        aria-label="Selecciona un instalador"
      >
        {value ? (
          <>
            <User className="w-5 h-5 text-violet-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">{renderInstallerLabel(value)}</div>
          </>
        ) : (
          <span className="text-slate-400 font-semibold flex items-center gap-2">
            <User className="w-5 h-5 opacity-50" />
            Elegir instalador
          </span>
        )}
        <ChevronDown className="ml-auto text-violet-400" />
      </button>
      {open && (
        <div
          ref={popoverRef}
          className={cn(
            "absolute left-0 z-50 mt-2 rounded-2xl shadow-2xl border border-violet-100 bg-white backdrop-blur-2xl transition-all",
            "flex flex-col min-w-full", // seguro que no se rompe el dropdown en responsivo
          )}
          style={{ maxHeight: 360, width: "100%" }}
        >
          <div className="p-2 border-b border-slate-100 bg-white sticky top-0 z-10">
            <input
              autoFocus
              placeholder="Buscar por nombre, RFC o teléfono…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-base px-4 py-2 rounded-xl bg-white border border-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-200 transition"
            />
          </div>
          <div className="flex flex-col gap-0.5 py-2 px-1 overflow-y-auto scrollbar-none">
            {loading ? (
              <div className="text-base text-center py-10 text-slate-400 flex flex-col items-center justify-center gap-2">
                <svg className="animate-spin text-violet-300" width="24" height="24" />
                Cargando…
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8 select-none">No se encontraron instaladores.</div>
            ) : (
              filtered.slice(0, 7).map(inst => (
                <div
                  key={inst.id}
                  className={cn(
                    "w-full flex items-center group transition px-4 py-2 rounded-xl cursor-pointer hover:bg-violet-50/90 focus:bg-violet-100",
                    value?.id === inst.id ? "bg-violet-100 ring-2 ring-violet-300" : ""
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChange(inst);
                      setOpen(false);
                    }}
                    className="flex-1 flex items-center min-w-0 text-left focus:outline-none bg-transparent border-0"
                  >
                    {renderInstallerLabel(inst)}
                  </button>
                  <Button 
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="ml-1 text-violet-400 hover:bg-violet-100 rounded-full p-1"
                    tabIndex={0}
                    onClick={e => {
                      e.stopPropagation();
                      setProfileDialogInstaller(inst);
                    }}
                    aria-label="Ver perfil"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 py-2 px-4 flex flex-row justify-between items-center sticky bottom-0 bg-white rounded-b-xl mt-1 z-10">
            <Button
              size="sm"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-violet-700 font-semibold bg-violet-50 hover:bg-violet-100/90 transition"
              variant="secondary"
              onClick={() => {
                setOpen(false);
                onRegisterNew?.();
              }}
              tabIndex={0}
            >
              <Plus className="w-4 h-4" />
              Registrar nuevo instalador
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                onChange(null);
              }}
              className="text-slate-400 px-2"
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}
      <InstallerProfileDialog 
        installer={profileDialogInstaller}
        open={!!profileDialogInstaller}
        onClose={() => setProfileDialogInstaller(null)}
      />
    </div>
  );
}

// El archivo tiene más de 200 líneas, sugerimos refactorizar a componentes pequeños tras este cambio.
