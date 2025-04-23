
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, MapPin, Calendar, CheckSquare } from "lucide-react";

export default function InstallerStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['installer-stats'],
    queryFn: async () => {
      // Get total installers
      const { data: installers, error: installersError } = await supabase
        .from('gps_installers')
        .select('id, direccion_personal_state, taller');
      
      if (installersError) throw installersError;

      // Get total installations
      const { count: totalInstallations, error: installationsError } = await supabase
        .from('gps_installations')
        .select('*', { count: 'exact', head: true });
      
      if (installationsError) throw installationsError;
      
      // Calculate states breakdown
      const states: Record<string, number> = {};
      installers.forEach((installer) => {
        if (installer.direccion_personal_state) {
          states[installer.direccion_personal_state] = 
            (states[installer.direccion_personal_state] || 0) + 1;
        }
      });
      
      // Calculate workshop count
      const workshopCount = installers.filter(i => i.taller).length;
      
      return {
        totalInstallers: installers.length,
        totalInstallations: totalInstallations || 0,
        workshopCount,
        states
      };
    }
  });
  
  const statsItems = [
    {
      title: "Total Instaladores",
      value: data?.totalInstallers || 0,
      icon: Users,
      color: "bg-violet-50 text-violet-600"
    },
    {
      title: "Con Taller",
      value: data?.workshopCount || 0,
      icon: MapPin,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Instalaciones",
      value: data?.totalInstallations || 0,
      icon: CheckSquare,
      color: "bg-amber-50 text-amber-600"
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsItems.map((item, i) => (
          <Card key={i} className="border-0 shadow-md bg-white/90">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`${item.color} p-3 rounded-xl`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {isLoading ? "..." : item.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.states && Object.keys(data.states).length > 0 && (
        <Card className="border-0 shadow-md bg-white/90">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Distribución por Estado</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.states)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([state, count], i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-sm font-medium">{state}</span>
                    <span className="text-sm bg-slate-200 px-2 py-0.5 rounded">
                      {count} {(count as number) > 1 ? 'instaladores' : 'instalador'}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
