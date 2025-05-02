
import React from 'react';
import { ProspectsList } from './prospects';

const ProspectsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Prospectos de Custodios</h2>
      <ProspectsList />
    </div>
  );
};

export default ProspectsPage;
