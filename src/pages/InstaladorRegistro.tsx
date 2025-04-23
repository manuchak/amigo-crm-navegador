
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GpsNavMenu from "@/components/instalacion-gps/GpsNavMenu";
import { InstallerRegisterForm } from "@/components/instalacion-gps/installers";

export default function InstaladorRegistro() {
  return (
    <>
      <GpsNavMenu />
      <div className="min-h-screen flex flex-col pt-20 px-2 bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
        <main className="container mx-auto py-10">
          <div className="max-w-3xl mx-auto w-full">
            <h1 className="text-3xl font-semibold text-slate-800 font-playfair mb-8">
              Registro de Instalador
            </h1>

            <Card className="bg-white/90 shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl">Información del Instalador</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Por favor, rellena todos los datos requeridos. Los campos marcados con * son obligatorios.
                </p>
              </CardHeader>
              <CardContent>
                <InstallerRegisterForm />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
