
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

  // Journey visual indicator (very simple for now)
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
                // Aquí debería guardarse la info en backend
                setInstallData({ ...installData, appointment: appt });
                alert("¡Cita agendada exitosamente!");
                setStep(1);
              }}
            />
          )}

          {/* NUEVO: Card/banner para registrar instalador */}
          <div className="w-full flex flex-col md:flex-row gap-6 justify-between mt-12">
            <Card className="w-full md:w-1/2 mx-auto shadow-lg bg-white/90 border-violet-100 flex flex-row items-center p-4 hover:shadow-xl transition hover:scale-[1.02] cursor-pointer"
              onClick={() => navigate("/instalacion-gps/registro-instalador")}>
              <div className="flex items-center justify-center rounded-full bg-violet-200 mr-4 p-2">
                <FilePlus size={32} className="text-violet-700" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold mb-1">¿Quieres registrar un nuevo instalador?</CardTitle>
                <div className="text-sm text-muted-foreground mb-2">
                  Regístralo de forma integral, añade taller, fotos y todos los datos de contacto.
                </div>
                <Button
                  variant="default"
                  onClick={e => {
                    e.stopPropagation();
                    navigate("/instalacion-gps/registro-instalador");
                  }}
                >
                  Registrar Instalador
                </Button>
              </div>
            </Card>
          </div>

          {isAdmin && (
            <div className="w-full flex flex-col md:flex-row gap-6 justify-between mt-8">
              {/* Panel de gestión de instaladores SOLO: Listado */}
              <div className="md:w-1/2 w-full">
                <InstallersList />
              </div>
            </div>
          )}

          {/* Message for next integration */}
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
