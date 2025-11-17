import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, LogOut, RefreshCw } from 'lucide-react';
import { supabase, type Prediction, type Student, type Intervention } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile?.email) {
      loadStudentView();
    }
  }, [profile?.email]);

  const loadStudentView = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('email', profile!.email)
        .maybeSingle();

      if (studentError) throw studentError;
      setStudent(studentRecord);

      if (!studentRecord) {
        setPrediction(null);
        setInterventions([]);
        return;
      }

      const { data: latestPrediction, error: predictionError } = await supabase
        .from('predictions')
        .select('*')
        .eq('student_id', studentRecord.id)
        .order('prediction_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (predictionError && predictionError.code !== 'PGRST116') {
        throw predictionError;
      }

      setPrediction(latestPrediction ?? null);

      const { data: interventionData, error: interventionError } = await supabase
        .from('interventions')
        .select('*')
        .eq('student_id', studentRecord.id)
        .order('intervention_date', { ascending: false });

      if (interventionError) throw interventionError;
      setInterventions(interventionData ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to load your prediction at the moment.');
    } finally {
      setLoading(false);
    }
  };

  const nudges = useMemo(() => {
    if (!prediction?.rationale) return [];
    return generateNudges(prediction.rationale);
  }, [prediction?.rationale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Welcome back</p>
            <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadStudentView}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!student && (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-600">
            We could not find your academic profile yet. Please contact your advisor.
          </div>
        )}

        {student && (
          <section className="bg-white rounded-2xl shadow p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{student.major || 'Major TBD'} · Year {student.year || 'N/A'}</p>
                <h2 className="text-2xl font-semibold text-gray-900 mt-1">Personal Prediction</h2>
                <p className="text-gray-600 text-sm">
                  UC-003: View your latest success prediction, rationale, and nudges.
                </p>
              </div>
              <RiskBadge level={prediction?.risk_level} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <MetricCard label="Risk Score" value={prediction?.risk_score ? prediction.risk_score.toFixed(1) : '--'} />
              <MetricCard label="GPA" value={student.gpa ? student.gpa.toFixed(2) : '--'} />
              <MetricCard label="Model Version" value={prediction?.model_version ?? 'N/A'} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Explainable rationale</h3>
              {prediction?.rationale ? (
                <div className="space-y-3">
                  {Object.entries(prediction.rationale)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([factor, weight]) => (
                      <div key={factor}>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{factor.replace(/_/g, ' ')}</span>
                          <span className="font-semibold text-gray-900">{((weight as number) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            style={{ width: `${Math.min(100, (weight as number) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Rationale data will appear when your next prediction is generated.</p>
              )}
            </div>
          </section>
        )}

        {nudges.length > 0 && (
          <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Personal nudges
            </h3>
            <ul className="space-y-2">
              {nudges.map((nudge) => (
                <li key={nudge} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400" />
                  {nudge}
                </li>
              ))}
            </ul>
          </section>
        )}

        {interventions.length > 0 && (
          <section className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advisor interventions</h3>
            <div className="space-y-3">
              {interventions.map((item) => (
                <article key={item.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{item.intervention_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.intervention_date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  {item.outcome && (
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium text-gray-700">Outcome:</span> {item.outcome}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function RiskBadge({ level }: { level?: Prediction['risk_level'] }) {
  if (!level) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-500">
        <AlertCircle className="w-4 h-4" />
        Pending prediction
      </div>
    );
  }

  const config =
    level === 'high'
      ? { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertTriangle className="w-4 h-4" /> }
      : level === 'medium'
        ? { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <AlertCircle className="w-4 h-4" /> }
        : { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-4 h-4" /> };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold uppercase ${config.color}`}>
      {config.icon}
      {level}
    </div>
  );
}

function generateNudges(rationale: Record<string, number>) {
  const ordered = Object.entries(rationale).sort(([, a], [, b]) => (b as number) - (a as number));
  return ordered.slice(0, 3).map(([factor]) => {
    if (factor.includes('attendance')) {
      return 'Attendance is impacting your score. Aim for full attendance next week.';
    }
    if (factor.includes('gpa')) {
      return 'Maintain consistent study blocks to keep your GPA strong.';
    }
    if (factor.includes('submissions')) {
      return 'Submit assignments ahead of deadlines to reduce risk.';
    }
    return `Focus on improving ${factor.replace(/_/g, ' ')} this week.`;
  });
}


