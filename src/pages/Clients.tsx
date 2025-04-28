
import React from 'react';

// Mock clients data
export const mockClients = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    empresa: 'Tecnologías Avanzadas',
    email: 'juan@tecno.com',
    telefono: '612345678',
    etapa: 'Ganado',
    valor: 25000,
    fechaCreacion: '2024-04-15T10:30:00',
  },
  {
    id: 2,
    nombre: 'María González',
    empresa: 'Distribuciones Norte',
    email: 'maria@disnorte.com',
    telefono: '623456789',
    etapa: 'Negociación',
    valor: 15000,
    fechaCreacion: '2024-04-10T14:20:00',
  },
  {
    id: 3,
    nombre: 'Carlos Rodríguez',
    empresa: 'Sistemas Integrados',
    email: 'carlos@sistemas.com',
    telefono: '634567890',
    etapa: 'Contactado',
    valor: 8000,
    fechaCreacion: '2024-04-05T09:15:00',
  },
  {
    id: 4,
    nombre: 'Ana Martínez',
    empresa: 'Consultores Express',
    email: 'ana@consultores.com',
    telefono: '645678901',
    etapa: 'Prospecto',
    valor: 12000,
    fechaCreacion: '2024-04-01T16:45:00',
  },
  {
    id: 5,
    nombre: 'Luis Sánchez',
    empresa: 'Inversiones Globales',
    email: 'luis@inversiones.com',
    telefono: '656789012',
    etapa: 'Perdido',
    valor: 30000,
    fechaCreacion: '2024-03-28T11:30:00',
  },
  {
    id: 6,
    nombre: 'Elena López',
    empresa: 'Marketing Digital',
    email: 'elena@marketing.com',
    telefono: '667890123',
    etapa: 'Ganado',
    valor: 18000,
    fechaCreacion: '2024-03-25T13:45:00',
  },
  {
    id: 7,
    nombre: 'Pedro Ramírez',
    empresa: 'Soluciones Web',
    email: 'pedro@soluciones.com',
    telefono: '678901234',
    etapa: 'Negociación',
    valor: 22000,
    fechaCreacion: '2024-03-20T10:00:00',
  }
];

const Clients = () => {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Clientes</h1>
      <p>Esta página mostrará el listado y gestión de clientes.</p>
    </div>
  );
};

export default Clients;
