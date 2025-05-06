
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import { LeadsProvider } from '@/context/LeadsContext';

const Leads: React.FC = () => {
  return (
    <PageLayout title="Leads">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <LeadsProvider>
          <LeadsDashboard />
        </LeadsProvider>
      </div>
    </PageLayout>
  );
};

export default Leads;
