
import React from 'react';
import BooleanDisplay from './BooleanDisplay';

interface SedenaInfoProps {
  sedenaId?: string | null;
  hasSecurityExperience?: boolean | null;
  hasFirearmLicense?: boolean | null;
}

const SedenaInfo: React.FC<SedenaInfoProps> = ({ 
  sedenaId,
  hasSecurityExperience,
  hasFirearmLicense 
}) => {
  return (
    <div className="space-y-1 text-sm">
      {sedenaId ? (
        <div>ID: {sedenaId}</div>
      ) : (
        <div className="text-slate-400">Sin ID</div>
      )}
      
      {typeof hasSecurityExperience !== 'undefined' && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Exp. Seguridad:</span>
          <BooleanDisplay value={hasSecurityExperience} />
        </div>
      )}
      
      {typeof hasFirearmLicense !== 'undefined' && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Armas:</span>
          <BooleanDisplay value={hasFirearmLicense} />
        </div>
      )}
    </div>
  );
};

export default SedenaInfo;
