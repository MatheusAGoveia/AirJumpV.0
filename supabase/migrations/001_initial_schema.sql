-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create children table
CREATE TABLE IF NOT EXISTS public.children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    photo_url TEXT,
    medical_notes TEXT,
    has_disability BOOLEAN DEFAULT FALSE,
    disability_document_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qr_sessions table
CREATE TABLE IF NOT EXISTS public.qr_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    entry_time TIMESTAMP WITH TIME ZONE,
    exit_time TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_programs table
CREATE TABLE IF NOT EXISTS public.loyalty_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    seals INTEGER DEFAULT 0,
    free_entries INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create party_bookings table
CREATE TABLE IF NOT EXISTS public.party_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_name TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL,
    package_type TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('doubt', 'suggestion', 'complaint')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergency_alerts table
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    operator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Children policies
CREATE POLICY "Parents can view own children" ON public.children
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own children" ON public.children
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children" ON public.children
    FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children" ON public.children
    FOR DELETE USING (auth.uid() = parent_id);

-- QR Sessions policies (admins can access all, parents can access their children's sessions)
CREATE POLICY "Users can view related qr sessions" ON public.qr_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.children 
            WHERE children.id = qr_sessions.child_id 
            AND children.parent_id = auth.uid()
        )
    );

CREATE POLICY "System can manage qr sessions" ON public.qr_sessions
    FOR ALL USING (true);

-- Loyalty programs policies
CREATE POLICY "Users can view own loyalty program" ON public.loyalty_programs
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Users can update own loyalty program" ON public.loyalty_programs
    FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own loyalty program" ON public.loyalty_programs
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Party bookings policies
CREATE POLICY "Users can view own party bookings" ON public.party_bookings
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own party bookings" ON public.party_bookings
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can update own party bookings" ON public.party_bookings
    FOR UPDATE USING (auth.uid() = parent_id);

-- Support tickets policies
CREATE POLICY "Users can view own support tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own support tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Emergency alerts policies
CREATE POLICY "Users can view alerts for their children" ON public.emergency_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.children 
            WHERE children.id = emergency_alerts.child_id 
            AND children.parent_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON public.children(parent_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_child_id ON public.qr_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_token ON public.qr_sessions(token);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires_at ON public.qr_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_parent_id ON public.loyalty_programs(parent_id);
CREATE INDEX IF NOT EXISTS idx_party_bookings_parent_id ON public.party_bookings(parent_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_parent_id ON public.support_tickets(parent_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_child_id ON public.emergency_alerts(child_id);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_children
    BEFORE UPDATE ON public.children
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
