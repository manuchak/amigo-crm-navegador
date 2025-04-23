
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, Phone, Mail, MapPin, Building, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function getNiceAddress(addrRaw: string | null | undefined) {
  if (!addrRaw) return null;
  try {
    if (typeof addrRaw === "object") return null;
    const addr = JSON.parse(addrRaw);
    const parts = [
      [addr.street, addr.number].filter(Boolean).join(" "),
      addr.colonia,
      addr.city,
      addr.state,
      addr.postalCode ? `CP ${addr.postalCode}` : null,
    ].filter(Boolean);
    return parts.join(", ");
  } catch (e) {
    if (typeof addrRaw === "string" && addrRaw.length < 80 && !addrRaw.startsWith("{")) {
      return addrRaw;
    }
    return null;
  }
}

export default function InstallersList() {
  const [installers, setInstallers] = useState<Tables<"gps_installers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState(false);
  
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

  const handleDeleteInstaller = async (id: number) => {
    try {
      setDeleting(true);
      const { error } = await supabase
        .from("gps_installers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setInstallers(installers.filter(inst => inst.id !== id));
      toast.success("Instalador eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting installer:", error);
      toast.error("No se pudo eliminar el instalador");
    } finally {
      setDeleting(false);
    }
  };

  const filteredInstallers = installers.filter(inst => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (inst.nombre || "").toLowerCase().includes(searchLower) ||
      (inst.telefono || "").includes(searchLower) ||
      (inst.email || "").toLowerCase().includes(searchLower) ||
      (inst.direccion_personal_state || "").toLowerCase().includes(searchLower) ||
      (inst.direccion_personal_city || "").toLowerCase().includes(searchLower)
    );
  });

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
    <Card className="max-w-4xl mx-auto bg-white/90 border-0 shadow-xl overflow-hidden">
      <CardHeader className="border-b bg-slate-50/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl font-playfair tracking-tight text-primary flex items-center">
            <span>Instaladores Registrados</span>
          </CardTitle>
          <Input
            placeholder="Buscar por nombre, teléfono, ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-violet-400 mb-2" size={38} />
            <span className="text-lg text-slate-500 font-semibold">Cargando instaladores…</span>
          </div>
        ) : filteredInstallers.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-2">
            <img src="/placeholder.svg" className="w-24 opacity-30" alt="Sin instaladores" />
            <div className="text-center">
              <div className="text-slate-400 font-medium text-lg">
                {searchTerm ? "No se encontraron instaladores" : "No hay instaladores registrados"}
              </div>
              <div className="text-sm text-slate-400">
                {!searchTerm && (
                  <>Utiliza <span className="font-semibold text-violet-700">Registrar nuevo instalador</span> para añadir uno.</>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {filteredInstallers.map((inst) => {
              const personalAddress = getNiceAddress(inst.direccion_personal);
              const workshopAddress = inst.taller_direccion ? getNiceAddress(inst.taller_direccion) : null;
              
              return (
                <div
                  key={inst.id || inst.nombre}
                  tabIndex={0}
                  className="group p-4 hover:bg-slate-50 transition-all focus:bg-slate-50"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {inst.foto_instalador ? (
                        <img 
                          src={inst.foto_instalador} 
                          alt={inst.nombre || "Instalador"}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-violet-500">
                            {(inst.nombre || "").substring(0, 1).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{inst.nombre || "Sin nombre"}</h3>
                          <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
                            {inst.telefono && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> 
                                <span>{inst.telefono}</span>
                              </div>
                            )}
                            {inst.email && (
                              <div className="flex items-center gap-1 ml-4">
                                <Mail className="w-3.5 h-3.5" /> 
                                <span>{inst.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {inst.certificaciones && (
                            <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-200">
                              {inst.certificaciones}
                            </Badge>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente el registro
                                  del instalador {inst.nombre} y toda su información asociada.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteInstaller(inst.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  disabled={deleting}
                                >
                                  {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Eliminar"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                        {personalAddress && (
                          <div className="flex items-start gap-1.5 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                            <span>{personalAddress}</span>
                          </div>
                        )}
                        
                        {inst.taller && (
                          <div className="mt-2">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                              <Building className="w-4 h-4 text-emerald-500" />
                              <span>Taller propio</span>
                            </div>
                            
                            {workshopAddress && (
                              <div className="ml-6 text-xs text-slate-500 mt-1">{workshopAddress}</div>
                            )}
                            
                            {Array.isArray(inst.taller_features) && inst.taller_features.length > 0 && (
                              <div className="flex flex-wrap gap-1 ml-6 mt-2">
                                {(inst.taller_features as string[]).map((fv, idx) => (
                                  <Badge variant="outline" className="text-xs bg-slate-50" key={idx}>
                                    {featureDict[fv] || fv}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {Array.isArray(inst.taller_images) && inst.taller_images.length > 0 && (
                              <div className="flex gap-2 mt-2 ml-6 overflow-x-auto">
                                {(inst.taller_images as string[]).map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    className="w-14 h-14 object-cover rounded-md border border-white/70 shadow-sm"
                                    alt="Taller"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {inst.comentarios && (
                          <div className="text-sm text-slate-500 italic mt-2">
                            "{inst.comentarios}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
