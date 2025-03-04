
-- Create expert_profiles table
CREATE TABLE expert_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  qualifications TEXT[] NOT NULL,
  years_of_experience INTEGER NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10,2) NOT NULL,
  availability JSONB NOT NULL,
  bio TEXT NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consultations table
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create embryo_data table
CREATE TABLE embryo_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  text_description TEXT,
  ai_score DECIMAL(5,2),
  grade TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE embryo_data ENABLE ROW LEVEL SECURITY;

-- Expert profiles visible to all authenticated users
CREATE POLICY "Expert profiles visible to all users"
  ON expert_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Consultations visible to involved parties
CREATE POLICY "Consultations visible to involved parties"
  ON consultations FOR ALL
  TO authenticated
  USING (
    auth.uid() = patient_id OR 
    auth.uid() = expert_id
  );

-- Embryo data visible to involved parties
CREATE POLICY "Embryo data visible to involved parties"
  ON embryo_data FOR ALL
  TO authenticated
  USING (
    auth.uid() = patient_id OR 
    auth.uid() = expert_id
  );
