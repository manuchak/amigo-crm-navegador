
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { ActiveServicesDashboard } from '@/components/performance/dashboard/ActiveServicesDashboard';

const ActiveServices: React.FC = () => {
  return (
    <PageLayout title="Servicios Activos">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <ActiveServicesDashboard />
      </div>
    </PageLayout>
  );
};

export default ActiveServices;
