
import React from 'react';
import { cn } from '@/lib/utils';

export interface ClientData {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  etapa: 'Prospecto' | 'Contactado' | 'Negociación' | 'Ganado' | 'Perdido';
  fechaCreacion: string;
  valor: number;
}

interface ClientCardProps {
  client: ClientData;
  onClick?: () => void;
}

const etapaColors = {
  'Prospecto': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contactado': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Negociación': 'bg-amber-50 text-amber-700 border-amber-200',
  'Ganado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Perdido': 'bg-rose-50 text-rose-700 border-rose-200',
};

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  return (
    <div 
      className="glass rounded-xl p-4 transition-all-medium hover:shadow-md cursor-pointer animate-fade-up"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-base">{client.nombre}</h3>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full border",
          etapaColors[client.etapa]
        )}>
          {client.etapa}
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground mb-3">
        {client.empresa}
      </div>
      
      <div className="text-sm mb-1 flex items-center">
        <span className="text-muted-foreground">Email:</span>
        <span className="ml-2 truncate">{client.email}</span>
      </div>
      
      <div className="text-sm mb-3 flex items-center">
        <span className="text-muted-foreground">Teléfono:</span>
        <span className="ml-2">{client.telefono}</span>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-sm">
        <div className="text-muted-foreground">
          {new Date(client.fechaCreacion).toLocaleDateString('es-ES')}
        </div>
        <div className="font-medium">
          ${client.valor.toLocaleString('es-ES')}
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
