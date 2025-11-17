/*
  # Initial Schema for Student Risk Prediction System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text) - 'advisor' or 'student'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `students`
      - `id` (uuid, primary key)
      - `student_id` (text, unique) - External student ID
      - `full_name` (text)
      - `email` (text)
      - `major` (text)
      - `year` (text)
      - `gpa` (numeric)
      - `created_at` (timestamp)
    
    - `predictions`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `risk_level` (text) - 'high', 'medium', 'low'
      - `risk_score` (numeric) - 0-100
      - `prediction_date` (timestamp)
      - `rationale` (jsonb) - Stores feature importance data
      - `model_version` (text)
      - `created_at` (timestamp)
    
    - `interventions`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `advisor_id` (uuid, foreign key)
      - `intervention_type` (text)
      - `description` (text)
      - `outcome` (text)
      - `intervention_date` (timestamp)
      - `created_at` (timestamp)
    
    - `ml_models`
      - `id` (uuid, primary key)
      - `version` (text)
      - `accuracy` (numeric)
      - `model_data` (jsonb) - Stores model configuration/weights
      - `is_active` (boolean)
      - `uploaded_by` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for advisors to view students and predictions
    - Add policies for advisors to create interventions
    - Add policies for viewing and managing ML models
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('advisor', 'student')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  major text DEFAULT '',
  year text DEFAULT '',
  gpa numeric DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  );

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  risk_level text NOT NULL CHECK (risk_level IN ('high', 'medium', 'low')),
  risk_score numeric NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  prediction_date timestamptz DEFAULT now(),
  rationale jsonb DEFAULT '{}'::jsonb,
  model_version text DEFAULT 'v1.0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view all predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  );

-- Create interventions table
CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  advisor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  intervention_type text NOT NULL,
  description text NOT NULL,
  outcome text DEFAULT '',
  intervention_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view interventions"
  ON interventions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  );

CREATE POLICY "Advisors can create interventions"
  ON interventions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  );

-- Create ml_models table
CREATE TABLE IF NOT EXISTS ml_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  accuracy numeric DEFAULT 0.0,
  model_data jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view models"
  ON ml_models FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  );

CREATE POLICY "Advisors can create models"
  ON ml_models FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_student_id ON predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_interventions_student_id ON interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_advisor_id ON interventions(advisor_id);