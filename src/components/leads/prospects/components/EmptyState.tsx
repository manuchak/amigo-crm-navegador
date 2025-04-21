
import React from 'react';

interface EmptyStateProps {
  showOnlyInterviewed: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ showOnlyInterviewed }) => {
  return (
    <div className="text-center py-12 text-slate-500">
      {showOnlyInterviewed ? (
        <p>No se encontraron prospectos con entrevistas</p>
      ) : (
        <p>No se encontraron prospectos</p>
      )}
    </div>
  );
};

export default EmptyState;
