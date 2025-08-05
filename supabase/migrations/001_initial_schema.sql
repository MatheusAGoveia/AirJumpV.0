-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('parent', 'admin')) DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age <= 17),
  emergency_contact TEXT NOT NULL,
  medical_info TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  visits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  package TEXT NOT NULL,
  guests INTEGER NOT NULL CHECK (guests >= 5 AND guests <= 50),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for children
CREATE POLICY "Parents can view own children" ON children
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own children" ON children
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own children" ON children
  FOR UPDATE USING (parent_id = auth.uid());

CREATE POLICY "Admins can view all children" ON children
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for visits
CREATE POLICY "Parents can view children visits" ON visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM children 
      WHERE id = visits.child_id AND parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all visits" ON visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for parties
CREATE POLICY "Parents can view own parties" ON parties
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own parties" ON parties
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Admins can view all parties" ON parties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for support_tickets
CREATE POLICY "Parents can view own tickets" ON support_tickets
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own tickets" ON support_tickets
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_qr_code ON children(qr_code);
CREATE INDEX IF NOT EXISTS idx_visits_child_id ON visits(child_id);
CREATE INDEX IF NOT EXISTS idx_visits_entry_time ON visits(entry_time);
CREATE INDEX IF NOT EXISTS idx_parties_parent_id ON parties(parent_id);
CREATE INDEX IF NOT EXISTS idx_parties_date ON parties(date);
CREATE INDEX IF NOT EXISTS idx_support_tickets_parent_id ON support_tickets(parent_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
