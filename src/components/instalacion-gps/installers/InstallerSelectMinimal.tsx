
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { InstallersList } from ".";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Installer = Tables<"gps_installers">;

interface Props {
  value: Installer | null;
  onChange: (installer: Installer | null) => void;
  onRegisterNew?: () => void;
}

export function InstallerSelectMinimal({ value, onChange, onRegisterNew }: Props) {
  const [open, setOpen] = useState(false);
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    supabase.from("gps_installers").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setInstallers(data || []))
      .finally(() => setLoading(false));
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

  return (
    <div className="relative w-full">
      <button
        type="button"
        className={cn(
          "w-full text-left flex items-center gap-3 px-5 py-3 rounded-xl bg-white/60 border border-violet-100/50 shadow-sm hover:shadow-md transition-all ring-0",
          "focus-visible:ring-2 focus-visible:ring-violet-300 glass"
        )}
        onClick={() => setOpen(!open)}
        tabIndex={0}
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
          <span className="text-slate-500 font-normal flex items-center gap-2">
            <User className="w-5 h-5 opacity-60" />
            Selecciona un instalador…
          </span>
        )}
        <ChevronDown className="ml-auto text-violet-400" />
      </button>
      {open && (
        <div
          ref={popoverRef}
          className="absolute left-0 z-30 mt-1 w-full min-w-[270px] rounded-xl shadow-xl glass backdrop-blur-md border border-violet-100 bg-white/90 ring-1 ring-violet-50"
          style={{ maxHeight: 330, overflowY: "auto" }}
        >
          <div className="p-3 border-b border-slate-100 bg-white/90 sticky top-0">
            <Input
              autoFocus
              placeholder="Buscar nombre, RFC, teléfono…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm rounded-xl bg-white/70"
            />
          </div>
          <div className="flex flex-col gap-0.5 py-1">
            {loading ? (
              <div className="text-sm text-center py-16 text-slate-400">Cargando…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-8 select-none">No se encontraron instaladores.</div>
            ) : (
              filtered.slice(0, 6).map(inst => (
                <button
                  type="button"
                  key={inst.id}
                  className={cn(
                    "w-full px-3 py-2 flex flex-col items-start hover:bg-violet-50/70 focus:bg-violet-100 rounded-lg transition group",
                    value?.id === inst.id && "bg-violet-100 ring-2 ring-violet-300"
                  )}
                  onClick={() => {
                    onChange(inst);
                    setOpen(false);
                  }}
                >
                  <span className="font-semibold text-violet-800 flex items-center gap-2">
                    {inst.nombre}
                    {inst.certificaciones && <Badge variant="purple">{inst.certificaciones}</Badge>}
                  </span>
                  <span className="text-xs text-muted-foreground">{inst.telefono}</span>
                  {inst.rfc && <span className="text-[10px] text-gray-400 font-mono">{inst.rfc}</span>}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 p-2 flex flex-row gap-2 justify-between sticky bottom-0 bg-white/80 rounded-b-lg">
            <Button
              size="sm"
              className="flex items-center gap-2 px-2 py-1 rounded-full text-violet-700 font-medium bg-violet-50 hover:bg-violet-100/90"
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
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
