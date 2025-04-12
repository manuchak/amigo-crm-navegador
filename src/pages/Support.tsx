
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SupportDashboard from '@/components/support/SupportDashboard';
import TicketList from '@/components/support/TicketList';
import NewTicketForm from '@/components/support/NewTicketForm';
import { SupportProvider } from '@/context/SupportContext';
import { LifeBuoy, MessageSquare, PieChart, Users } from 'lucide-react';

const AtencionAlAfiliado = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState("tickets");
  
  const isAgent = userData && ['admin', 'owner', 'atención_afiliado'].includes(userData.role);
  
  return (
    <SupportProvider>
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-2.5 flex items-center justify-center">
            <LifeBuoy size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">Atención al Afiliado</h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Centro de atención para inquietudes y solicitudes de servicio. Resolvemos tus problemas de la manera más rápida posible.
        </p>
        
        <Tabs defaultValue="tickets" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="new-ticket" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Nuevo Ticket</span>
            </TabsTrigger>
            {isAgent && (
              <>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Equipo</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="tickets" className="space-y-4">
            <Card className="p-6">
              <TicketList />
            </Card>
          </TabsContent>
          
          <TabsContent value="new-ticket">
            <Card className="p-6">
              <NewTicketForm onSuccess={() => setActiveTab("tickets")} />
            </Card>
          </TabsContent>
          
          {isAgent && (
            <>
              <TabsContent value="dashboard">
                <Card className="p-6">
                  <SupportDashboard />
                </Card>
              </TabsContent>
              
              <TabsContent value="team">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Administración de Equipo</h2>
                  <p className="text-muted-foreground">
                    Gestionar asignaciones y rendimiento del equipo de soporte.
                  </p>
                  <Separator className="my-4" />
                  <p>Funcionalidad de equipo en desarrollo.</p>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </SupportProvider>
  );
};

export default AtencionAlAfiliado;
