
import React from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import GpsInstallForm from "@/components/instalacion-gps/GpsInstallForm";
import GpsAppointmentForm from "@/components/instalacion-gps/GpsAppointmentForm";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { InstallerSelectMinimal } from "@/components/instalacion-gps/installers/InstallerSelectMinimal";
import InstallerRegisterForm from "@/components/instalacion-gps/installers/InstallerRegisterForm";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Star, X } from "lucide-react";

const InstalacionGPS = () => {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [installData, setInstallData] = React.useState<any>(null);
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin" || userData?.role === "owner";
  const navigate = useNavigate();
  const [showInstallerRegister, setShowInstallerRegister] = React.useState(false);
  const [selectedInstaller, setSelectedInstaller] = React.useState<any>(null);

  // Tarjeta integrando nombre, estado, dirección y calificación
  const renderSelectedInstallerCard = () => {
    if (!selectedInstaller) return null;
    const { nombre, direccion_personal, certificaciones } = selectedInstaller;
    return (
      <Card className="w-full my-5 rounded-2xl glass border-0 shadow-md bg-white/90 animate-fade-in relative">
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 text-slate-400 hover:bg-slate-100"
          aria-label="Limpiar instalador seleccionado"
          onClick={() => setSelectedInstaller(null)}
        >
          <X className="w-5 h-5" />
        </Button>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold text-primary">{nombre}</span>
              {certificaciones && (
                <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                  {certificaciones}
                </span>
              )}
            </div>
            {direccion_personal && (
              <div className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                <MapPin className="w-4 h-4 text-violet-400" />
                <span>{direccion_personal}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Sin calificación</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 px-2 animate-fade-in bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
      <main className="flex-1 container mx-auto py-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center w-full">
          <h1 className="font-playfair text-3xl md:text-4xl font-semibold text-primary/80 text-center mb-7">
            Nueva Instalación de GPS
          </h1>
          <div className="w-full flex flex-row items-center justify-between mb-4">
            <div className="w-full max-w-lg mx-auto">
              <InstallerSelectMinimal 
                value={selectedInstaller}
                onChange={inst => { setSelectedInstaller(inst); setShowInstallerRegister(false); }}
                onRegisterNew={() => setShowInstallerRegister(true)}
                disabled={step !== 1}
              />
            </div>
          </div>

          {/* Tarjeta minimalista del instalador seleccionado */}
          {renderSelectedInstallerCard()}

          {/* Registrar instalador, ahora muy integrada y centrada, arriba del form */}
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
                  onRegistered={() => {
                    setShowInstallerRegister(false);
                    setSelectedInstaller(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-10 w-full">
            {step === 1 && (
              <GpsInstallForm
                installer={selectedInstaller}
                onNext={(data) => {
                  setInstallData(data);
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <GpsAppointmentForm
                onBack={() => setStep(1)}
                onSchedule={(appt) => {
                  setInstallData({ ...installData, appointment: appt });
                  alert("¡Cita agendada exitosamente!");
                  setStep(1);
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
  );
};

export default InstalacionGPS;

