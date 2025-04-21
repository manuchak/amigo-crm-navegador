
import { useState, useEffect } from 'react';
import { ValidationStats } from '../types';
import { getValidationStats } from '@/services/validationService';
import { UserRole } from '@/types/auth';

/**
 * Hook to manage validation statistics data
 */
export const useValidationStats = (
  currentUser: any, 
  userData: any, 
  setError: (error: string | null) => void
) => {
  const [stats, setStats] = useState<ValidationStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Load stats on initial render
  useEffect(() => {
    const fetchStats = async () => {
      // Skip fetch if not authenticated and not owner
      if (!currentUser && userData?.role !== 'owner' as UserRole) return;
      
      setStatsLoading(true);
      try {
        const statsData = await getValidationStats();
        setStats(statsData);
      } catch (error: any) {
        console.error('Error fetching validation stats:', error);
        
        // Don't show errors for owners
        if (userData?.role !== 'owner' as UserRole) {
          setError(error.message || 'Error al cargar estadísticas');
        }
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, [currentUser, userData, setError]);

  return {
    stats,
    statsLoading
  };
};
