import React from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import GpsInstallForm from "@/components/instalacion-gps/GpsInstallForm";
import GpsAppointmentForm from "@/components/instalacion-gps/GpsAppointmentForm";
import { InstallersList } from "@/components/instalacion-gps/installers";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FilePlus } from "lucide-react";
import { InstallerSelectMinimal } from "@/components/instalacion-gps/installers/InstallerSelectMinimal";
import InstallerRegisterForm from "@/components/instalacion-gps/installers/InstallerRegisterForm";

const InstalacionGPS = () => {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [installData, setInstallData] = React.useState<any>(null);
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin" || userData?.role === "owner";
  const navigate = useNavigate();
  const [showInstallerRegister, setShowInstallerRegister] = React.useState(false);
  const [selectedInstaller, setSelectedInstaller] = React.useState(null);

  const steps = [
    { label: "Formulario de instalación", completed: step > 1 },
    { label: "Agendar cita", completed: false },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20 px-2 animate-fade-in bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
      <main className="flex-1 container mx-auto py-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center w-full">

          <div className="w-full mb-8">
            <h1 className="font-playfair text-3xl md:text-4xl font-semibold text-primary/80 text-center mb-3">
              Nueva Instalación de GPS
            </h1>
            <div className="w-full flex flex-row items-center mb-7 gap-6">
              <div className="w-full max-w-lg mx-auto">
                <InstallerSelectMinimal
                  value={selectedInstaller}
                  onChange={setSelectedInstaller}
                  onRegisterNew={() => setShowInstallerRegister(true)}
                />
                {showInstallerRegister && (
                  <div className="mt-4 bg-white/75 glass p-2 rounded-xl shadow-lg animate-fade-in">
                    <InstallerRegisterForm
                      onRegistered={() => {
                        setShowInstallerRegister(false);
                        setSelectedInstaller(null);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 w-full">
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

          <div className="w-full flex justify-center mt-12">
            {/* Moved 'Registrar instalador' card into compact selector UI above.
            This section removed for less clutter */}
          </div>

          {isAdmin && (
            <div className="w-full flex flex-col md:flex-row gap-6 justify-between mt-8">
              <div className="md:w-1/2 w-full">
                <InstallersList />
              </div>
            </div>
          )}

          <Card className="w-full mt-8 bg-white/75 border-0 shadow-none">
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
