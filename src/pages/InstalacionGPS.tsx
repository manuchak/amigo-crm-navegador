
import React from "react";
import { Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const InstalacionGPS = () => {
  return (
    <div className="min-h-screen flex flex-col pt-20 animate-fade-in">
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="bg-gradient-to-br from-primary to-accent rounded-full p-3 mb-4 flex items-center justify-center">
            <Car size={38} className="text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-center">
            Instalación de GPS para Clientes y Custodios
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-6">
            Gestiona y registra la instalación de dispositivos GPS para tu flota de clientes y custodios.
          </p>
          <Card className="w-full md:w-3/4 mb-6 shadow-md">
            <CardContent className="py-8 flex flex-col items-center justify-center">
              {/* Aquí puedes integrar un formulario para registrar nuevas instalaciones */}
              <p className="text-center text-sm text-muted-foreground">
                Esta sección te permitirá agregar, ver y editar registros de instalación de GPS.<br/>
                🚧 <span className="font-medium">Próximamente integración con sistemas de gestión y seguimiento de dispositivos.</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InstalacionGPS;
