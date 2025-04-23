
import React from "react";
import GpsNavMenu from "@/components/instalacion-gps/GpsNavMenu";
import InstallersList from "@/components/instalacion-gps/installers/InstallersList";
import InstallerStats from "@/components/instalacion-gps/installers/InstallerStats";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const InstalacionGPSInstallers = () => {
  const navigate = useNavigate();

  return (
    <>
      <GpsNavMenu />
      <div className="min-h-screen flex flex-col pt-20 px-2 bg-[linear-gradient(110deg,#F1F0FB_40%,#E5DEFF_100%)]">
        <main className="container mx-auto py-10">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <h1 className="text-3xl font-semibold text-slate-800 font-playfair">
                Instaladores GPS
              </h1>
              <Button 
                onClick={() => navigate("/instalacion-gps/registro-instalador")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Registrar nuevo instalador
              </Button>
            </div>
            
            <div className="mb-8">
              <InstallerStats />
            </div>
            
            <InstallersList />
          </div>
        </main>
      </div>
    </>
  );
};

export default InstalacionGPSInstallers;
