
import React from 'react';

interface DateFormatterProps {
  dateString: string | null;
}

const DateFormatter: React.FC<DateFormatterProps> = ({ dateString }) => {
  if (!dateString) return <span>N/A</span>;
  
  const formattedDate = new Date(dateString).toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return <span>{formattedDate}</span>;
};

export default DateFormatter;
