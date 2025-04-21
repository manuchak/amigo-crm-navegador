
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProspectsList from './prospects/ProspectsList';

const ProspectsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Prospectos Unificados</CardTitle>
          <CardDescription>
            Vista consolidada de prospectos con datos de validación y llamadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProspectsList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProspectsPage;
