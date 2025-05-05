
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <Link 
      to="/" 
      className="font-medium text-lg tracking-tight flex items-center gap-2"
    >
      <div className="bg-primary rounded-full p-1.5 flex items-center justify-center">
        <Shield size={18} className="text-white" />
      </div>
      <span className="flex flex-col items-start">
        <span className="font-semibold text-slate-800">CustodiosCRM</span>
        <span className="text-xs text-slate-400">by Detecta</span>
      </span>
    </Link>
  );
};
