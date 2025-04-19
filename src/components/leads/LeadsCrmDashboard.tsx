
import React from "react";

const LeadsCrmDashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center py-8 px-2 animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2 text-primary">Flujo de Adquisición de Custodios</h2>
        <p className="text-slate-600 mb-2">
          Visualiza cada paso del proceso CRM de custodia, desde la captación hasta la aprobación.
        </p>
      </div>
      <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 w-full max-w-2xl">
        <img src="/leads-workflow.svg" alt="Flujo CRM de Custodios" className="w-full max-w-lg mb-4 rounded-lg" />
        <ol className="w-full flex flex-col space-y-3 mt-4">
          <li>
            <span className="font-semibold text-primary">1. Creación:</span> Registrar un nuevo lead/custodio en la plataforma.
          </li>
          <li>
            <span className="font-semibold text-secondary">2. Seguimiento:</span> Contacto inicial y seguimiento desde Call Center.
          </li>
          <li>
            <span className="font-semibold text-orange-500">3. Contacto:</span> Entrevista y verificación de información.
          </li>
          <li>
            <span className="font-semibold text-red-500">4. Aprobación:</span> Validar y aprobar para llegar al proceso final.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default LeadsCrmDashboard;
