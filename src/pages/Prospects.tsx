
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ProspectsPage from '@/components/leads/ProspectsPage';
import { LeadsProvider } from '@/context/LeadsContext';

const Prospects: React.FC = () => {
  return (
    <PageLayout title="Prospectos">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <LeadsProvider>
          <ProspectsPage />
        </LeadsProvider>
      </div>
    </PageLayout>
  );
};

export default Prospects;
