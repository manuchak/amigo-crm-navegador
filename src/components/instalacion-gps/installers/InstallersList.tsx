
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight } from "lucide-react";

export default function InstallersList() {
  const [installers, setInstallers] = useState<Tables<"gps_installers">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstallers();
    // eslint-disable-next-line
  }, []);

  const fetchInstallers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gps_installers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("No se pudo cargar la lista de instaladores");
    } else {
      setInstallers(data || []);
    }
    setLoading(false);
  };

  // For mapping workshop features to readable labels
  const featureDict: Record<string, string> = {
    area_techada: "Área techada",
    agua_energia: "Agua/Energía",
    iluminacion_ventilacion: "Iluminación/Ventilación",
    herramientas_equipo: "Herramientas/Equipo",
    zona_recepcion: "Zona recepción",
    limpieza_senalizacion: "Limpieza/Señalización",
    infraestructura_electrica: "Infraestructura eléctrica",
    documentacion_visible: "Doc. visible",
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8 glass border-0 shadow-xl p-0 bg-white/80">
      <CardHeader>
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <CardTitle className="text-2xl md:text-3xl font-playfair tracking-tight text-primary flex items-center">
            <span>Instaladores Registrados</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-violet-400 mb-2" size={38} />
            <span className="text-lg text-slate-500 font-semibold">Cargando instaladores…</span>
          </div>
        ) : installers.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-2">
            <img src="/placeholder.svg" className="w-24 opacity-30" alt="Sin instaladores" />
            <div className="text-center">
              <div className="text-slate-400 font-medium text-lg">No hay instaladores registrados.</div>
              <div className="text-sm text-slate-400">Utiliza <span className="font-semibold text-violet-700">Registrar nuevo instalador</span> para añadir uno.</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {installers.map((inst, idx) => (
              <div
                key={inst.id || inst.nombre}
                tabIndex={0}
                className={`
                  group bg-white/80 glass rounded-2xl p-6 relative flex flex-col gap-2
                  shadow-lg outline-none hover:shadow-[0_8px_32px_0_rgba(98,48,218,0.14)] transition-all
                  border border-white/50 hover:border-violet-200 focus:border-violet-400
                  hover:bg-gradient-to-tr hover:from-[#f5f3fe] hover:to-[#e5deff]
                  focus:bg-gradient-to-tr focus:from-[#f1f0fb] focus:to-[#e5deff]
                  cursor-pointer
                `}
                style={{ minHeight: 190 }}
              >
                <div className="flex gap-3 items-center">
                  <div className="rounded-full bg-gradient-to-tr from-[#e5deff] to-[#f1f0fb] shadow-lg flex items-center justify-center w-12 h-12">
                    <span className="font-bold text-xl text-violet-700">
                      {(inst.nombre || "N/A").split(" ").map(p => p[0]).join("").slice(0,2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-primary">{inst.nombre || "Sin nombre"}</div>
                    <div className="text-xs text-secondary-foreground mb-1">{inst.telefono}</div>
                    {inst.certificaciones && (
                      <Badge variant="purple" className="mt-1">{inst.certificaciones}</Badge>
                    )}
                  </div>
                  <ChevronRight className="absolute right-4 top-6 text-muted-foreground opacity-0 group-hover:opacity-70 group-focus:opacity-90 transition" size={22} />
                </div>
                <div className="text-xs text-gray-500">{inst.email}</div>
                <div className="text-sm text-slate-700">{inst.direccion_personal}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {inst.rfc && <Badge variant="outline" className="font-mono">{inst.rfc}</Badge>}
                  {inst.comentarios && <Badge variant="info">{inst.comentarios}</Badge>}
                </div>
                {inst.taller && (
                  <div className="mt-2 px-1">
                    <div className="text-[13px] font-semibold text-violet-700 mb-1">Taller propio</div>
                    {inst.taller_direccion && (
                      <div className="text-xs text-gray-600 mb-1">{inst.taller_direccion}</div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(inst.taller_features) &&
                        (inst.taller_features as string[]).map(fv =>
                          <Badge variant="secondary" key={fv}>
                            {featureDict[fv] || fv}
                          </Badge>
                        )}
                    </div>
                    {Array.isArray(inst.taller_images) && inst.taller_images.length > 0 && (
                      <div className="flex gap-2 mt-1 overflow-x-auto">
                        {inst.taller_images.map((img: string, i: number) => (
                          <img
                            key={img+i}
                            src={img}
                            className="w-20 h-20 object-cover rounded-xl border-2 border-white/40 shadow-md bg-slate-100 transition hover:scale-105"
                            style={{ background: "#f2fce2" }}
                            alt="Taller"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
