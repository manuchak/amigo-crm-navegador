
import React from 'react';
import { useAuth } from '@/context/auth';

export const LeadInitialInterview: React.FC = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Entrevista Inicial</h2>
      <p>Componente en desarrollo.</p>
    </div>
  );
};
