
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LeadsDashboard from '@/components/leads/LeadsDashboard';

const Leads: React.FC = () => {
  return (
    <PageLayout title="Leads">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <LeadsDashboard />
      </div>
    </PageLayout>
  );
};

export default Leads;
