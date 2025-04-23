import React, { useEffect } from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import GpsInstallForm from "@/components/instalacion-gps/GpsInstallForm";
import GpsAppointmentForm from "@/components/instalacion-gps/GpsAppointmentForm";
import GpsNavMenu from "@/components/instalacion-gps/GpsNavMenu";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { InstallerSelectMinimal } from "@/components/instalacion-gps/installers/InstallerSelectMinimal";
import InstallerRegisterForm from "@/components/instalacion-gps/installers/InstallerRegisterForm";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Star, X, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

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

const InstalacionGPS = () => {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [installData, setInstallData] = React.useState<any>(null);
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin" || userData?.role === "owner";
  const navigate = useNavigate();
  const [showInstallerRegister, setShowInstallerRegister] = React.useState(false);
  const [selectedInstaller, setSelectedInstaller] = React.useState<Tables<"gps_installers"> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const setupRlsPolicies = async () => {
      try {
        const response = await fetch("https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/setup-rls-policies", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
          }
        });
        
        if (!response.ok) {
          console.error("Failed to setup RLS policies:", response.statusText);
        }
      } catch (error) {
        console.error("Error setting up RLS policies:", error);
      }
    };
    
    setupRlsPolicies();
  }, []);

  return (
    <>
      <GpsNavMenu />
      <div className="min-h-screen flex flex-col pt-20 px-2 animate-fade-in bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
        <main className="flex-1 container mx-auto py-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center w-full">
            <div className="w-full flex flex-row items-center justify-between mb-7">
              <h1 className="font-playfair text-3xl md:text-4xl font-semibold text-primary/80">
                Nueva Instalación de GPS
              </h1>
              <Button
                variant="outline"
                onClick={() => navigate('/instalacion-gps/agendadas')}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Ver Agendadas
              </Button>
            </div>

            {showInstallerRegister && (
              <Card className="w-full max-w-lg mx-auto glass border-0 shadow-lg bg-white/90 transition-all animate-fade-in mb-8">
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  <Plus className="w-6 h-6 text-violet-500" />
                  <CardTitle className="text-lg font-semibold text-primary/80">
                    Registrar un nuevo instalador
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowInstallerRegister(false)}
                    className="ml-auto text-muted-foreground"
                  >
                    Cancelar
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  <InstallerRegisterForm
                    onRegistered={(newInstaller) => {
                      setShowInstallerRegister(false);
                      if (newInstaller) {
                        setSelectedInstaller(newInstaller);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col gap-10 w-full">
              {step === 1 && (
                <GpsInstallForm
                  installer={selectedInstaller}
                  onInstallerSelect={(installer) => setSelectedInstaller(installer)}
                  onNext={(data) => {
                    const finalData = {
                      ...data,
                      installer_id: selectedInstaller?.id || data.installerId
                    };
                    setInstallData(finalData);
                    setStep(2);
                  }}
                />
              )}
              {step === 2 && installData && (
                <GpsAppointmentForm
                  installData={installData}
                  onBack={() => setStep(1)}
                  onSchedule={(appt) => {
                    const completeData = { ...installData, appointment: appt };
                    setInstallData(completeData);
                    toast({
                      variant: "default",
                      title: "¡Excelente!",
                      description: "Cita agendada exitosamente.",
                    });
                    setTimeout(() => {
                      setInstallData(null);
                      setSelectedInstaller(null);
                      setStep(1);
                    }, 2000);
                  }}
                />
              )}
            </div>

            <Card className="w-full mt-12 bg-white/80 border-0 shadow-none">
              <CardContent className="py-8 flex flex-col items-center justify-center text-muted-foreground">
                🚧 <span>En próximas versiones: historial de instalaciones, integración con sistemas de gestión y seguimiento de dispositivos.</span>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default InstalacionGPS;
