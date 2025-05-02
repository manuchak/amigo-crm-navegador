
import React from 'react';

interface DateFormatterProps {
  dateString: string | null;
}

const DateFormatter: React.FC<DateFormatterProps> = ({ dateString }) => {
  if (!dateString) return <span className="text-slate-400">N/A</span>;
  
  try {
    const date = new Date(dateString);
    
    // Verificar si es una fecha válida
    if (isNaN(date.getTime())) {
      return <span className="text-slate-400">Fecha inválida</span>;
    }
    
    // Formato corto para tabla
    const formattedDate = date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
    
    return <span className="text-xs">{formattedDate}</span>;
  } catch (error) {
    return <span className="text-slate-400">Error de formato</span>;
  }
};

export default DateFormatter;
