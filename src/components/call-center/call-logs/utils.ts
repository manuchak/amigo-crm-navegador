
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { VapiCallLog } from './types';
import { CallFilters } from '../VapiCallFilters';

export const formatDuration = (seconds: number | null) => {
  if (seconds === null || seconds === undefined) return '00:00';
  
  // If duration is 0, check if it might be a processing issue
  if (seconds === 0) {
    console.log('Zero duration detected, this might indicate a calculation issue');
  }
  
  // If the duration is very large (typically means it's in milliseconds), convert to seconds
  if (seconds > 100000) {
    seconds = Math.floor(seconds / 1000);
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const formatCost = (cost: number | null) => {
  if (cost === null || cost === undefined) return 'N/A';
  return `$${cost.toFixed(3)} USD`;
};

export const applyFilters = (logs: VapiCallLog[], activeFilters: CallFilters) => {
  let filtered = [...logs];
  
  if (activeFilters.status) {
    filtered = filtered.filter(log => 
      log.status?.toLowerCase() === activeFilters.status
    );
  }
  
  if (activeFilters.direction) {
    filtered = filtered.filter(log => 
      log.direction?.toLowerCase() === activeFilters.direction
    );
  }
  
  if (activeFilters.duration) {
    const durationSeconds = activeFilters.duration;
    filtered = filtered.filter(log => {
      if (durationSeconds === 30) {
        return (log.duration || 0) < 30;
      } else if (durationSeconds === 60) {
        return (log.duration || 0) > 60;
      } else if (durationSeconds === 300) {
        return (log.duration || 0) > 300;
      }
      return true;
    });
  }
  
  if (activeFilters.dateRange) {
    const now = new Date();
    let startDate: Date;
    
    if (activeFilters.dateRange === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (activeFilters.dateRange === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (activeFilters.dateRange === 'month') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate = new Date(0);
    }
    
    filtered = filtered.filter(log => {
      if (!log.start_time) return false;
      const logDate = new Date(log.start_time);
      return logDate >= startDate;
    });
  }
  
  return filtered;
};
