
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import InstallerRegisterForm from "@/components/instalacion-gps/installers/InstallerRegisterForm";
import InstallersList from "@/components/instalacion-gps/installers/InstallersList";

const InstalacionGPSInstallers = () => {
  return (
    <div className="min-h-screen flex flex-col pt-20 px-2 bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
      <main className="flex-1 container mx-auto py-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
          <Card className="w-full mb-8 bg-white/80">
            <CardHeader>
              <CardTitle>Registro de Instaladores de GPS</CardTitle>
            </CardHeader>
            <CardContent>
              <InstallerRegisterForm />
            </CardContent>
          </Card>
          <InstallersList />
        </div>
      </main>
    </div>
  );
};
export default InstalacionGPSInstallers;
