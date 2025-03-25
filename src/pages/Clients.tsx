
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import ClientForm from '@/components/ClientForm';
import KanbanBoard from '@/components/KanbanBoard';
import ClientCard, { ClientData } from '@/components/ClientCard';

// Mock data for demonstration purposes
export const mockClients: ClientData[] = [
  {
    id: '1',
    nombre: 'Ana Rodríguez',
    email: 'ana@empresa.es',
    telefono: '+34 666 123 456',
    empresa: 'Tecnología S.L.',
    etapa: 'Prospecto',
    fechaCreacion: '2023-09-15T10:00:00.000Z',
    valor: 10000
  },
  {
    id: '2',
    nombre: 'Carlos Jiménez',
    email: 'carlos@corporacion.com',
    telefono: '+34 655 789 012',
    empresa: 'Corporación ABC',
    etapa: 'Contactado',
    fechaCreacion: '2023-09-25T14:30:00.000Z',
    valor: 25000
  },
  {
    id: '3',
    nombre: 'María López',
    email: 'maria@startup.es',
    telefono: '+34 633 456 789',
    empresa: 'Startup Innovadora',
    etapa: 'Negociación',
    fechaCreacion: '2023-10-05T09:15:00.000Z',
    valor: 15000
  },
  {
    id: '4',
    nombre: 'Javier Martínez',
    email: 'javier@grupo.es',
    telefono: '+34 622 345 678',
    empresa: 'Grupo Industrial',
    etapa: 'Ganado',
    fechaCreacion: '2023-10-15T16:45:00.000Z',
    valor: 50000
  },
  {
    id: '5',
    nombre: 'Laura Sánchez',
    email: 'laura@comercio.es',
    telefono: '+34 644 567 890',
    empresa: 'Comercio Online',
    etapa: 'Perdido',
    fechaCreacion: '2023-10-18T11:30:00.000Z',
    valor: 8000
  },
  {
    id: '6',
    nombre: 'Miguel Fernández',
    email: 'miguel@consultora.es',
    telefono: '+34 688 901 234',
    empresa: 'Consultora Digital',
    etapa: 'Prospecto',
    fechaCreacion: '2023-10-20T13:20:00.000Z',
    valor: 12000
  },
  {
    id: '7',
    nombre: 'Sofía Gutiérrez',
    email: 'sofia@agencia.es',
    telefono: '+34 677 123 456',
    empresa: 'Agencia Marketing',
    etapa: 'Contactado',
    fechaCreacion: '2023-10-22T10:10:00.000Z',
    valor: 18000
  },
  {
    id: '8',
    nombre: 'David Torres',
    email: 'david@soluciones.es',
    telefono: '+34 699 234 567',
    empresa: 'Soluciones Empresariales',
    etapa: 'Negociación',
    fechaCreacion: '2023-10-25T15:30:00.000Z',
    valor: 35000
  }
];

const Clients = () => {
  const [clients, setClients] = useState<ClientData[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');
  
  const handleClientClick = (client: ClientData) => {
    setSelectedClient(client);
    setClientDialogOpen(true);
  };
  
  const handleClientAdded = () => {
    // In a real implementation, we would fetch the updated clients list from Supabase
    // For now, we just leave the mock data as is
    console.log('Cliente agregado - En una implementación real, actualizaríamos la lista');
  };

  return (
    <div className="container mx-auto py-24 px-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Clientes</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm onClientAdded={handleClientAdded} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="kanban" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="kanban">Vista Kanban</TabsTrigger>
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="w-full overflow-hidden">
          <KanbanBoard 
            clients={clients}
            onClientClick={handleClientClick}
          />
        </TabsContent>
        
        <TabsContent value="list">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard 
                key={client.id}
                client={client}
                onClick={() => handleClientClick(client)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Client detail dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{selectedClient.nombre}</h2>
                <div className="text-sm px-3 py-1 rounded-full bg-secondary">
                  {selectedClient.etapa}
                </div>
              </div>
              
              <div className="text-lg">{selectedClient.empresa}</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div>{selectedClient.email}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Teléfono</div>
                  <div>{selectedClient.telefono}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Fecha de registro</div>
                  <div>{new Date(selectedClient.fechaCreacion).toLocaleDateString('es-ES')}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Valor potencial</div>
                  <div className="font-medium">€{selectedClient.valor.toLocaleString('es-ES')}</div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setClientDialogOpen(false)}>
                  Cerrar
                </Button>
                <Button>
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
