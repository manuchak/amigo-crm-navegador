
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import GpsNavMenu from '@/components/instalacion-gps/GpsNavMenu';

const InstalacionGPS: React.FC = () => {
  return (
    <PageLayout>
      <GpsNavMenu />
      <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Instalación GPS</h1>
        <p className="text-center text-slate-500">
          Formulario de instalación GPS se mostrará aquí
        </p>
      </div>
    </PageLayout>
  );
};

export default InstalacionGPS;
