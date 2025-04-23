
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export default function InstallersList() {
  const [installers, setInstallers] = useState<Tables<"gps_installers">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstallers();
  }, []);

  const fetchInstallers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("gps_installers").select("*").order("created_at", { ascending: false });
    if (error) {
      toast.error("No se pudo cargar la lista de instaladores");
    } else {
      setInstallers(data || []);
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Instaladores Registrados</CardTitle>
      </CardHeader>
      <CardContent>
        {loading
          ? <div>Cargando instaladores…</div>
          : (installers.length === 0 ? <div>No hay instaladores registrados.</div>
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {installers.map(inst => (
                  <div className="border rounded p-4 bg-muted/30" key={inst.id || inst.nombre}>
                    <div className="font-semibold">{inst.nombre}</div>
                    <div className="text-xs text-muted-foreground mb-1">{inst.telefono}</div>
                    <div>{inst.certificaciones}</div>
                    {inst.taller && (
                      <>
                        <div className="mt-2 text-sm">Taller en: {inst.taller_direccion}</div>
                        <div className="flex gap-2 mt-1 overflow-auto">
                          {Array.isArray(inst.taller_images) && (inst.taller_images as string[]).map((img: string, i: number) => (
                            <img key={img+i} src={img} className="w-16 h-16 object-cover rounded border" alt="Taller" />
                          ))}
                        </div>
                      </>
                    )}
                    {inst.comentarios && <div className="mt-1 text-xs italic">{inst.comentarios}</div>}
                  </div>
                ))}
              </div>
            )
          )}
      </CardContent>
    </Card>
  );
}
