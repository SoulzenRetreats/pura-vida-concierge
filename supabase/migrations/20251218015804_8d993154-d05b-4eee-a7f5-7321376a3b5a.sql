-- Add assigned_to column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop existing booking RLS policies
DROP POLICY IF EXISTS "Admins can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

-- Create new RLS policies for booking visibility
-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Staff can view their assigned bookings OR unassigned bookings
CREATE POLICY "Staff can view assigned or unassigned bookings" 
ON public.bookings 
FOR SELECT 
USING (
  has_role(auth.uid(), 'staff') AND (
    assigned_to = auth.uid() OR 
    assigned_to IS NULL
  )
);

-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings" 
ON public.bookings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Staff can update their assigned bookings OR claim unassigned bookings
CREATE POLICY "Staff can update assigned or unassigned bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'staff') AND (
    assigned_to = auth.uid() OR 
    assigned_to IS NULL
  )
);

-- Admins can delete all bookings
CREATE POLICY "Admins can delete all bookings" 
ON public.bookings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Staff can delete their assigned bookings
CREATE POLICY "Staff can delete assigned bookings" 
ON public.bookings 
FOR DELETE 
USING (
  has_role(auth.uid(), 'staff') AND assigned_to = auth.uid()
);