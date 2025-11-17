/*
  Adds automation tracking tables to support UC-004 (data import) and
  UC-005 (model retraining) along with policies so advisors can manage
  pipelines and students can see their own records.
*/

-- Data pipeline runs capture scheduled/manual imports
CREATE TABLE IF NOT EXISTS data_pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL CHECK (status IN ('scheduled', 'running', 'completed', 'failed')),
  triggered_by text NOT NULL CHECK (triggered_by IN ('scheduler', 'manual')),
  records_imported integer DEFAULT 0,
  feature_count integer DEFAULT 0,
  notes text DEFAULT '',
  error_message text DEFAULT '',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE data_pipeline_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors manage data pipeline runs"
  ON data_pipeline_runs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  );

-- Model training runs capture training, evaluation, approval, deployment
CREATE TABLE IF NOT EXISTS model_training_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL CHECK (status IN ('queued', 'running', 'evaluating', 'awaiting_approval', 'deployed', 'failed')),
  triggered_by text NOT NULL CHECK (triggered_by IN ('scheduler', 'manual')),
  accuracy numeric DEFAULT 0.0,
  fairness_score numeric DEFAULT 0.0,
  deployed_version text DEFAULT '',
  approved_by text DEFAULT '',
  notes text DEFAULT '',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE model_training_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors manage model training runs"
  ON model_training_runs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
    )
  );

-- Allow students to read their own student record by email association
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE polname = 'Students can view their record'
  ) THEN
    CREATE POLICY "Students can view their record"
      ON students FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'student'
          AND profiles.email = students.email
        )
      );
  END IF;
END $$;

-- Allow students to view their own predictions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE polname = 'Students can view their predictions'
  ) THEN
    CREATE POLICY "Students can view their predictions"
      ON predictions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM profiles
          JOIN students ON students.id = predictions.student_id
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'student'
          AND profiles.email = students.email
        )
      );
  END IF;
END $$;

-- Allow students to read interventions logged for them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE polname = 'Students can view their interventions'
  ) THEN
    CREATE POLICY "Students can view their interventions"
      ON interventions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM profiles
          JOIN students ON students.id = interventions.student_id
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'student'
          AND profiles.email = students.email
        )
      );
  END IF;
END $$;


