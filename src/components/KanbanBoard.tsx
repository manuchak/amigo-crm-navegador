
import React from 'react';
import { ClientData } from './ClientCard';
import ClientCard from './ClientCard';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  clients: ClientData[];
  onClientClick: (client: ClientData) => void;
}

const etapas = [
  { id: 'Prospecto', color: 'border-blue-400' },
  { id: 'Contactado', color: 'border-indigo-400' },
  { id: 'Negociación', color: 'border-amber-400' },
  { id: 'Ganado', color: 'border-emerald-400' },
  { id: 'Perdido', color: 'border-rose-400' }
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ clients, onClientClick }) => {
  const clientsByStage = (etapa: string) => {
    return clients.filter(client => client.etapa === etapa);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pb-8 w-full overflow-x-auto">
      {etapas.map((etapa, index) => (
        <div 
          key={etapa.id}
          className={cn(
            "flex flex-col h-full min-w-[300px] rounded-xl glass animate-fade-up",
            `animate-delay-${index * 100}`
          )}
        >
          <div className={cn(
            "px-4 py-3 font-medium border-b",
            etapa.color
          )}>
            <h3 className="text-center">{etapa.id}</h3>
            <div className="mt-1 text-sm text-center text-muted-foreground">
              {clientsByStage(etapa.id).length} cliente(s)
            </div>
          </div>
          
          <div className="p-3 flex-1 overflow-y-auto max-h-[calc(100vh-240px)]">
            <div className="space-y-3">
              {clientsByStage(etapa.id).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No hay clientes en esta etapa
                </div>
              ) : (
                clientsByStage(etapa.id).map(client => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onClick={() => onClientClick(client)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
