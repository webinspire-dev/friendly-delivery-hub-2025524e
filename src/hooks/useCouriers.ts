import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Courier { id: string; user_id: string; full_name: string; phone: string; city: string | null; vehicle_type: string | null; bio: string | null; avatar_url: string | null; is_available: boolean; is_verified: boolean; total_deliveries: number; rating: number; latitude: number | null; longitude: number | null; }
interface UseCouriersOptions { city?: string; vehicleType?: string; availableOnly?: boolean; verifiedOnly?: boolean; userLat?: number; userLng?: number; maxDistance?: number; limit?: number; isAdmin?: boolean; }

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface CourierWithDistance extends Courier { distance: number | null; }

export function useCouriers(options: UseCouriersOptions = {}) {
  const [couriers, setCouriers] = useState<CourierWithDistance[]>([]); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchCouriers(); }, [options.city, options.vehicleType, options.availableOnly, options.verifiedOnly, options.userLat, options.userLng, options.maxDistance, options.isAdmin]);

  const fetchCouriers = async () => {
    setIsLoading(true); setError(null);
    try {
      let query = supabase.from('courier_profiles').select('*');
      if (!options.isAdmin) query = query.eq('is_blocked', false);
      if (options.city) query = query.eq('city', options.city);
      if (options.vehicleType && options.vehicleType !== 'all') query = query.eq('vehicle_type', options.vehicleType);
      if (!options.isAdmin) { if (options.userLat && options.userLng) query = query.eq('is_available', true); else if (options.availableOnly) query = query.eq('is_available', true); }
      if (options.verifiedOnly) query = query.eq('is_verified', true);
      if (options.limit) query = query.limit(options.limit);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      let result: CourierWithDistance[] = (data || []).map(c => ({
        ...c, is_available: c.is_available ?? false, is_verified: c.is_verified ?? false, total_deliveries: c.total_deliveries ?? 0, rating: c.rating ?? 5.0,
        distance: options.userLat && options.userLng && c.latitude && c.longitude ? calculateDistance(options.userLat, options.userLng, Number(c.latitude), Number(c.longitude)) : null
      }));
      if (options.userLat && options.userLng && options.maxDistance) result = result.filter(c => c.distance !== null && c.distance <= options.maxDistance!);
      if (options.userLat && options.userLng) result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      setCouriers(result);
    } catch (err) { console.error('Error:', err); setError('Failed to fetch couriers'); } finally { setIsLoading(false); }
  };

  return { couriers, isLoading, error, refetch: fetchCouriers };
}
