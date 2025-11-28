-- Create enum for locations
CREATE TYPE location_type AS ENUM ('jaco', 'la_fortuna');

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('new_request', 'in_review', 'quote_sent', 'confirmed', 'completed');

-- Create enum for service categories
CREATE TYPE service_category AS ENUM ('chef', 'transportation', 'adventure', 'spa', 'tours', 'celebrations', 'other');

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location location_type NOT NULL,
  sleeps INT NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  blackout_dates DATERANGE[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category service_category NOT NULL,
  description TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  price_range TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_info TEXT,
  service_types TEXT[] DEFAULT '{}',
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Property recommended services (many-to-many)
CREATE TABLE property_services (
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, service_id)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guest_count INT NOT NULL,
  status booking_status DEFAULT 'new_request',
  special_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Booking selected services (many-to-many)
CREATE TABLE booking_services (
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  PRIMARY KEY (booking_id, service_id)
);

-- User roles for admin access
CREATE TYPE app_role AS ENUM ('admin', 'staff');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Function to check user role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties (public read, admin write)
CREATE POLICY "Anyone can view properties"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert properties"
  ON properties FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can update properties"
  ON properties FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can delete properties"
  ON properties FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- RLS Policies for services (public read, admin write)
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- RLS Policies for vendors (admin only)
CREATE POLICY "Admins can view vendors"
  ON vendors FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can insert vendors"
  ON vendors FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can update vendors"
  ON vendors FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can delete vendors"
  ON vendors FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- RLS Policies for property_services (public read, admin write)
CREATE POLICY "Anyone can view property services"
  ON property_services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage property services"
  ON property_services FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- RLS Policies for bookings (anyone can create, admin can manage)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view bookings"
  ON bookings FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- RLS Policies for booking_services (anyone can create with booking, admin can manage)
CREATE POLICY "Anyone can create booking services"
  ON booking_services FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view booking services"
  ON booking_services FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can update booking services"
  ON booking_services FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can delete booking services"
  ON booking_services FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- RLS Policies for user_roles (admin only)
CREATE POLICY "Admins can view user roles"
  ON user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_services_category ON services(category);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();