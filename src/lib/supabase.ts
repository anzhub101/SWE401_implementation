import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'advisor' | 'student';
  created_at: string;
  updated_at: string;
};

export type Student = {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  major: string;
  year: string;
  gpa: number;
  created_at: string;
};

export type Prediction = {
  id: string;
  student_id: string;
  risk_level: 'high' | 'medium' | 'low';
  risk_score: number;
  prediction_date: string;
  rationale: Record<string, number>;
  model_version: string;
  created_at: string;
};

export type Intervention = {
  id: string;
  student_id: string;
  advisor_id: string;
  intervention_type: string;
  description: string;
  outcome: string;
  intervention_date: string;
  created_at: string;
};

export type MLModel = {
  id: string;
  version: string;
  accuracy: number;
  model_data: Record<string, unknown>;
  is_active: boolean;
  uploaded_by: string;
  created_at: string;
};
