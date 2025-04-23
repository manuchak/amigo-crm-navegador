
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MenubarMenu, Menubar, MenubarContent, MenubarTrigger, MenubarItem } from "@/components/ui/menubar";
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
      <div className="container mx-auto">
        <Menubar className="border-0 bg-transparent">
          <MenubarMenu>
            {menuItems.map((item) => (
              <MenubarTrigger
                key={item.path}
                className={`gap-2 ${
                  location.pathname === item.path
                    ? "bg-primary/5 text-primary"
                    : "hover:bg-primary/5 hover:text-primary"
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </MenubarTrigger>
            ))}
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
}
