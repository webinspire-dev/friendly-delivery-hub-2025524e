import { supabase } from '@/integrations/supabase/client';
type EventType = 'profile_view' | 'whatsapp_click' | 'call_click';
export const trackEvent = async (courierId: string, eventType: EventType) => { try { await (supabase as any).from('courier_analytics').insert({ courier_id: courierId, event_type: eventType, user_agent: navigator.userAgent }); } catch (e) { console.error('Error tracking:', e); } };
export const useAnalytics = () => ({ trackProfileView: (id: string) => trackEvent(id, 'profile_view'), trackWhatsAppClick: (id: string) => trackEvent(id, 'whatsapp_click'), trackCallClick: (id: string) => trackEvent(id, 'call_click') });
