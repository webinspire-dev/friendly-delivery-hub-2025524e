
-- Add display_name column to cities table
ALTER TABLE public.cities ADD COLUMN display_name text;

-- Update existing cities with proper display names
UPDATE public.cities SET display_name = 'Casablanca' WHERE name = 'casablanca';
UPDATE public.cities SET display_name = 'Rabat' WHERE name = 'rabat';
UPDATE public.cities SET display_name = 'Marrakech' WHERE name = 'marrakech';
UPDATE public.cities SET display_name = 'Fès' WHERE name = 'fes';
UPDATE public.cities SET display_name = 'Tanger' WHERE name = 'tanger';
UPDATE public.cities SET display_name = 'Agadir' WHERE name = 'agadir';
UPDATE public.cities SET display_name = 'Meknès' WHERE name = 'meknes';
UPDATE public.cities SET display_name = 'Oujda' WHERE name = 'oujda';
UPDATE public.cities SET display_name = 'Kénitra' WHERE name = 'kenitra';
UPDATE public.cities SET display_name = 'Tétouan' WHERE name = 'tetouan';
UPDATE public.cities SET display_name = 'Safi' WHERE name = 'safi';
UPDATE public.cities SET display_name = 'El Jadida' WHERE name = 'el_jadida';
UPDATE public.cities SET display_name = 'Nador' WHERE name = 'nador';
UPDATE public.cities SET display_name = 'Béni Mellal' WHERE name = 'beni_mellal';
UPDATE public.cities SET display_name = 'Khouribga' WHERE name = 'khouribga';
UPDATE public.cities SET display_name = 'Settat' WHERE name = 'settat';
UPDATE public.cities SET display_name = 'Salé' WHERE name = 'sale';
UPDATE public.cities SET display_name = 'Témara' WHERE name = 'temara';
UPDATE public.cities SET display_name = 'Mohammedia' WHERE name = 'mohammedia';
UPDATE public.cities SET display_name = 'Taza' WHERE name = 'taza';

-- Set default for future inserts
ALTER TABLE public.cities ALTER COLUMN display_name SET DEFAULT '';
