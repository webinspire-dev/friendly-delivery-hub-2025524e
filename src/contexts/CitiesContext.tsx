import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export interface City {
  id: string;
  name: string;
  display_name: string | null;
  name_ar: string | null;
  is_active: boolean;
}

interface CitiesContextType {
  cities: City[];
  activeCities: City[];
  isLoading: boolean;
  getCityDisplayName: (cityCode: string) => string;
  refetchCities: () => Promise<void>;
}

const CitiesContext = createContext<CitiesContextType | undefined>(undefined);

export const CitiesProvider = ({ children }: { children: ReactNode }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCities((data as City[]) || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const activeCities = cities.filter(c => c.is_active);

  const getCityDisplayName = useCallback((cityCode: string): string => {
    if (!cityCode) return '';
    const city = cities.find(c => c.name === cityCode);
    if (!city) {
      // Fallback: capitalize and replace underscores
      return cityCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    if (language === 'ar' && city.name_ar) {
      return city.name_ar;
    }
    return city.display_name || city.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [cities, language]);

  return (
    <CitiesContext.Provider value={{ cities, activeCities, isLoading, getCityDisplayName, refetchCities: fetchCities }}>
      {children}
    </CitiesContext.Provider>
  );
};

export const useCities = () => {
  const context = useContext(CitiesContext);
  if (!context) {
    throw new Error('useCities must be used within a CitiesProvider');
  }
  return context;
};
