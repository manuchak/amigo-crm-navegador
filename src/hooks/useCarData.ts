
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CarBrand = {
  id: number;
  name: string;
};

export type CarModel = {
  id: number;
  brand_id: number;
  name: string;
};

export const useCarData = () => {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('car_brands')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBrands(data || []);
    } catch (err: any) {
      console.error('Error fetching car brands:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchModelsByBrand = async (brandId: number) => {
    if (!brandId) return [];
    
    try {
      const { data, error } = await supabase
        .from('car_models')
        .select('id, brand_id, name')
        .eq('brand_id', brandId)
        .order('name');

      if (error) throw error;
      
      // If no models are found for this brand (except "Otro"), add a default "Otro" model
      if ((data?.length === 0 || !data) && brandId !== 20) { // Assuming 20 is the ID for "Otro" brand
        return [{ id: 0, brand_id: brandId, name: 'Otro' }];
      }

      return data || [];
    } catch (err: any) {
      console.error('Error fetching car models:', err);
      setError(err.message);
      return [];
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    fetchModelsByBrand,
    loading,
    error
  };
};
