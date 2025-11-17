# Student Risk Prediction System

## Quick Start

The system is ready to use with sample data already loaded.

### Login Options

**Option 1: Create a new advisor account**
1. Use the Supabase dashboard to create a user account
2. Add a profile record with role='advisor'

**Option 2: Use SQL to create demo account**
```sql
-- Note: You'll need to create the auth user through Supabase Auth
-- Then insert the profile:
INSERT INTO profiles (id, email, full_name, role)
VALUES ('your-auth-user-id', 'advisor@demo.com', 'Demo Advisor', 'advisor');
```

## Sample Data Loaded

The system includes:
- **8 sample students** with varying academic profiles
- **Risk predictions** for all students (3 high-risk, 2 medium-risk, 3 low-risk)
- **Risk rationale** showing feature importance for each prediction

## Features Available

### 1. Dashboard View
- Visual risk distribution chart
- Quick stats overview
- Sortable student list with risk indicators

### 2. Student Detail View
- Complete student profile information
- Risk score and level
- Visual breakdown of risk factors (rationale)
- Intervention history

### 3. Intervention Logging
- Multiple intervention types (advising, tutoring, counseling, etc.)
- Description and outcome tracking
- Timestamps for all interventions

### 4. ML Model Upload
- Upload new models in JSON format
- Automatic versioning
- Accuracy tracking
- Deactivates previous models when new one is uploaded

## Model Format Example

When uploading a new ML model, use this JSON structure:

```json
{
  "model_type": "RandomForest",
  "features": [
    "gpa",
    "attendance",
    "assignment_completion",
    "engagement",
    "study_hours"
  ],
  "parameters": {
    "n_estimators": 100,
    "max_depth": 10
  },
  "weights": {
    "gpa": 0.35,
    "attendance": 0.25,
    "assignment_completion": 0.20,
    "engagement": 0.15,
    "study_hours": 0.05
  }
}
```

## Database Schema

- **profiles**: User accounts with roles
- **students**: Student demographic and academic data
- **predictions**: Risk predictions with scores and rationale
- **interventions**: Advisor interventions and outcomes
- **ml_models**: Uploaded ML models with versioning

## Security

All tables use Row Level Security (RLS):
- Advisors can view all students and predictions
- Advisors can create interventions
- Only authenticated users can access the system
