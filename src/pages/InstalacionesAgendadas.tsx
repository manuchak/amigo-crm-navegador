
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import GpsNavMenu from "@/components/instalacion-gps/GpsNavMenu";
import { AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Installation = {
  id: string;
  date: string;
  time: string;
  timezone: string;
  vehicles: Vehicle[];
  status: string | null;
  owner_name: string;
  email: string | null;
  install_address: {
    street: string;
    number: string;
    colonia: string;
    city: string;
    state: string;
  };
  installer: {
    nombre: string;
    telefono: string;
  };
};

type Vehicle = {
  brand: string;
  model: string;
  year: number;
  color: string;
};

export default function InstalacionesAgendadas() {
  const { data: installations, isLoading, error } = useQuery({
    queryKey: ['installations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gps_installations')
        .select(`
          *,
          installer_id,
          installer:gps_installers(nombre, telefono)
        `)
        .order('date', { ascending: true });

      if (error) {
        console.error("Error fetching installations:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }

      return data.map((installation): Installation => ({
        id: installation.id,
        date: installation.date,
        time: installation.time,
        timezone: installation.timezone || 'GMT-6 México',
        vehicles: installation.vehicles as Vehicle[],
        status: installation.status,
        owner_name: installation.owner_name,
        email: installation.email,
        install_address: installation.install_address as Installation['install_address'],
        installer: installation.installer || { nombre: 'No asignado', telefono: 'N/A' },
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
        <div className="animate-pulse text-primary/80">Cargando instalaciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <GpsNavMenu />
        <div className="min-h-screen pt-20 px-4 animate-fade-in bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
          <div className="container mx-auto py-10">
            <Card className="w-full bg-red-50 shadow-xl border-0">
              <CardContent className="flex items-center gap-3 p-6">
                <AlertTriangle className="text-red-500 h-6 w-6" />
                <div>
                  <h3 className="font-medium text-red-800">Error al cargar instalaciones</h3>
                  <p className="text-sm text-red-600">{(error as Error).message}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GpsNavMenu />
      <div className="min-h-screen pt-20 px-4 animate-fade-in bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
        <main className="container mx-auto py-10">
          <h1 className="font-playfair text-3xl md:text-4xl font-semibold text-primary/80 text-center mb-10">
            Instalaciones Agendadas
          </h1>

          <Card className="w-full bg-white/95 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-gray-800">
                Calendario de Instalaciones {installations && installations.length > 0 ? `(${installations.length})` : '(0)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!installations || installations.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No hay instalaciones agendadas en este momento.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Instalador</TableHead>
                        <TableHead>Dirección</TableHead>
                        <TableHead>Vehículos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installations.map((inst) => (
                        <TableRow key={inst.id}>
                          <TableCell className="font-medium">
                            <div>{inst.owner_name}</div>
                            {inst.email && <div className="text-xs text-muted-foreground">{inst.email}</div>}
                          </TableCell>
                          <TableCell>
                            {format(new Date(inst.date), 'PPP', { locale: es })}
                          </TableCell>
                          <TableCell>
                            {inst.time} ({inst.timezone})
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{inst.installer.nombre}</div>
                              <div className="text-sm text-muted-foreground">{inst.installer.telefono}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {inst.install_address ? 
                              `${inst.install_address.street} ${inst.install_address.number}, ${inst.install_address.colonia}, ${inst.install_address.city}, ${inst.install_address.state}` : 
                              'Dirección no disponible'
                            }
                          </TableCell>
                          <TableCell>
                            {inst.vehicles ? `${inst.vehicles.length} vehículo(s)` : '0 vehículos'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
