
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import { LeadsProvider } from '@/context/LeadsContext';
import { Card, CardContent } from '@/components/ui/card';

const Leads: React.FC = () => {
  return (
    <PageLayout title="Leads">
      <div className="space-y-6">
        {/* Workflow visual */}
        <Card className="border shadow-sm bg-white">
          <CardContent className="pt-6 pb-4">
            <h3 className="font-medium text-slate-700 mb-3">Flujo de proceso de Leads</h3>
            <div className="w-full overflow-auto">
              <img 
                src="/leads-workflow.svg" 
                alt="Flujo de proceso de leads" 
                className="w-full max-w-3xl mx-auto" 
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Contenido principal */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <LeadsProvider>
            <LeadsDashboard />
          </LeadsProvider>
        </div>
      </div>
    </PageLayout>
  );
};

export default Leads;
