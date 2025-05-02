
import React from 'react';
import ProspectsList from '../components/leads/prospects/ProspectsList';

const Prospects = () => {
  return (
    <div className="container mx-auto p-4 py-6">
      <h2 className="text-2xl font-semibold mb-6">Prospectos de Custodios</h2>
      <ProspectsList />
    </div>
  );
};

export default Prospects;
