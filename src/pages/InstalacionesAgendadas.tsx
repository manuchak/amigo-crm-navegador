
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Installation = {
  id: string;
  ownerName: string;
  date: string;
  time: string;
  timezone: string;
  vehicles: any[];
  installer: {
    nombre: string;
    telefono: string;
  };
  installAddress: {
    street: string;
    number: string;
    colonia: string;
    city: string;
    state: string;
  };
};

export default function InstalacionesAgendadas() {
  const { data: installations, isLoading } = useQuery({
    queryKey: ['installations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gps_installations')
        .select(`
          *,
          installer:gps_installers(nombre, telefono)
        `)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Installation[];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
        <div className="animate-pulse text-primary/80">Cargando instalaciones...</div>
      </div>
    );
  }

  const formatAddress = (address: Installation['installAddress']) => {
    return `${address.street} ${address.number}, ${address.colonia}, ${address.city}, ${address.state}`;
  };

  return (
    <div className="min-h-screen pt-20 px-4 animate-fade-in bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
      <main className="container mx-auto py-10">
        <h1 className="font-playfair text-3xl md:text-4xl font-semibold text-primary/80 text-center mb-10">
          Instalaciones Agendadas
        </h1>

        <Card className="w-full bg-white/95 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-800">
              Calendario de Instalaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  {installations?.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.ownerName}</TableCell>
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
                        {formatAddress(inst.installAddress)}
                      </TableCell>
                      <TableCell>
                        {inst.vehicles.length} vehículo(s)
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
