
import React from 'react';
import Navbar from '@/components/Navbar';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Navbar />
      <div className="pt-24 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-slate-500 mb-2">Total de Clientes</div>
              <div className="text-4xl font-bold">10</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-slate-500 mb-2">Clientes Ganados</div>
              <div className="text-4xl font-bold">2</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-slate-500 mb-2">Valor Total (€)</div>
              <div className="text-4xl font-bold">96.000</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-slate-500 mb-2">Valor Activo (€)</div>
              <div className="text-4xl font-bold">93.000</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md bg-gray-100 p-1">
                <button className="px-4 py-2 rounded-md bg-white shadow-sm text-sm font-medium">Resumen</button>
                <button className="px-4 py-2 rounded-md text-sm font-medium text-slate-600">Por Clientes</button>
                <button className="px-4 py-2 rounded-md text-sm font-medium text-slate-600">Por Valor</button>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-center mb-1">Distribución de Clientes</h2>
            <p className="text-center text-slate-500 text-sm mb-6">Cantidad de clientes por etapa</p>
            
            <div className="h-64 flex items-center justify-center">
              <div className="text-sm text-slate-400">Gráfico de distribución aquí</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
