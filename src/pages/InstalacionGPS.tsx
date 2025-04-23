import React from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import GpsInstallForm from "@/components/instalacion-gps/GpsInstallForm";
import GpsAppointmentForm from "@/components/instalacion-gps/GpsAppointmentForm";
import { InstallersList } from "@/components/instalacion-gps/installers";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FilePlus } from "lucide-react";

const InstalacionGPS = () => {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [installData, setInstallData] = React.useState<any>(null);
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin" || userData?.role === "owner";
  const navigate = useNavigate();

  const steps = [
    { label: "Formulario de instalación", completed: step > 1 },
    { label: "Agendar cita", completed: false },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20 px-2 animate-fade-in bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
      <main className="flex-1 container mx-auto py-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center w-full">
          <div className="flex w-full justify-center gap-4 mb-8">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`flex flex-col items-center flex-1 ${step === i + 1 ? "text-violet-700" : "text-gray-400"}`}
              >
                <div className={`h-2 w-full rounded bg-gradient-to-r ${step > i ? "from-violet-400 to-emerald-400" : "from-gray-300 to-gray-200"}`}></div>
                <span className="text-sm mt-1 font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <GpsInstallForm
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

          <div className="w-full flex justify-center mt-12">
            <Card
              className="w-full md:w-2/3 shadow-lg bg-white/90 border-violet-100 flex flex-row items-center p-6 hover:shadow-2xl hover:scale-[1.03] transition-all cursor-pointer gap-4"
              onClick={() => navigate("/instalacion-gps/registro-instalador")}
              tabIndex={0}
              role="button"
              aria-label="Ir a registro de instalador"
              onKeyPress={e => { if (e.key === "Enter") navigate("/instalacion-gps/registro-instalador"); }}
            >
              <div className="flex items-center justify-center rounded-full bg-violet-200 p-3 mr-4">
                <FilePlus size={36} className="text-violet-700" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold mb-1">
                  ¿Quieres registrar un nuevo instalador?
                </CardTitle>
                <div className="text-md text-muted-foreground mb-2">
                  Registra instaladores de forma integral, añadiendo dirección, contactos, certificaciones y fotos de taller.
                </div>
                <Button
                  variant="default"
                  className="mt-2"
                  onClick={e => {
                    e.stopPropagation();
                    navigate("/instalacion-gps/registro-instalador");
                  }}
                >
                  Ir al Registro de Instalador
                </Button>
              </div>
            </Card>
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
