
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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

  // Minimal Apple-inspired style: soft, flat, very rounded, glassy
  return (
    <div className="relative w-full mt-0.5">
      <button
        type="button"
        className={cn(
          "w-full text-left flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/75 border border-violet-100 shadow transition-all ring-0 focus-visible:ring-2 focus-visible:ring-violet-300 glass focus:outline-none",
          disabled && "opacity-60 pointer-events-none"
        )}
        onClick={() => setOpen(!open)}
        tabIndex={0}
        aria-label="Selecciona un instalador"
      >
        {value ? (
          <span className="flex items-center gap-2">
            <User className="w-5 h-5 text-violet-500" />
            <span className="font-medium text-primary">{value.nombre}</span>
            {value.certificaciones && (
              <Badge variant="purple" className="ml-2">{value.certificaciones}</Badge>
            )}
          </span>
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
          className="absolute left-0 z-40 mt-2 min-w-full rounded-2xl shadow-2xl glass backdrop-blur-[10px] border border-violet-100 bg-white/90 ring-1 ring-violet-50 overflow-hidden flex flex-col"
          style={{ maxHeight: 350, width: "100%" }}
        >
          <div className="p-2 border-b border-slate-100 bg-white/90 sticky top-0">
            <input
              autoFocus
              placeholder="Buscar por nombre, RFC o teléfono…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-base px-4 py-2 rounded-xl bg-white/70 border border-violet-50 focus:outline-none ring-0 focus:ring-2 focus:ring-violet-200"
            />
          </div>
          <div className="flex flex-col gap-0.5 py-2 px-1 overflow-y-auto">
            {loading ? (
              <div className="text-base text-center py-10 text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-violet-300" />
                Cargando…
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8 select-none">No se encontraron instaladores.</div>
            ) : (
              filtered.slice(0, 7).map(inst => (
                <button
                  type="button"
                  key={inst.id}
                  className={cn(
                    "w-full px-4 py-2 flex items-center hover:bg-violet-50/80 focus:bg-violet-100 rounded-xl transition group cursor-pointer", 
                    value?.id === inst.id ? "bg-violet-100 ring-2 ring-violet-300" : ""
                  )}
                  onClick={() => {
                    onChange(inst);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1 font-semibold text-violet-800 flex items-center gap-2">
                    {inst.nombre}
                    {inst.certificaciones && <Badge variant="purple">{inst.certificaciones}</Badge>}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{inst.rfc || inst.telefono}</span>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 py-2 px-4 flex flex-row justify-between items-center sticky bottom-0 bg-white/95 rounded-b-xl mt-1">
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
    </div>
  );
}
