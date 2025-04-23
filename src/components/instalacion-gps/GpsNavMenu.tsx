
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Calendar, Users, MapPin } from "lucide-react";

export default function GpsNavMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    {
      label: "Nueva Instalación",
      path: "/instalacion-gps",
      icon: Car,
    },
    {
      label: "Instalaciones Agendadas",
      path: "/instalacion-gps/agendadas",
      icon: Calendar,
    },
    {
      label: "Instaladores",
      path: "/instalacion-gps/instaladores",
      icon: Users,
    },
    {
      label: "Registrar Instalador",
      path: "/instalacion-gps/registro-instalador",
      icon: MapPin,
    }
  ];

  return (
    <div className="w-full sticky top-16 z-40 bg-white/80 backdrop-blur-sm border-b">
      <nav className="container mx-auto py-2">
        <ul className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Button
                variant={location.pathname === item.path ? "subtle" : "ghost"}
                className={`
                  gap-2 rounded-lg px-4 transition-all duration-200
                  ${location.pathname === item.path 
                    ? "bg-slate-100 text-slate-900 hover:bg-slate-200/90"
                    : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
                  }
                `}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
