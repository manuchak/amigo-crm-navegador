
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';

const Leads: React.FC = () => {
  return (
    <PageLayout title="Leads">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p className="text-center text-slate-500">
          Contenido de la página Leads se mostrará aquí
        </p>
      </div>
    </PageLayout>
  );
};

export default Leads;
