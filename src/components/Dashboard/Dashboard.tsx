import { useState, useEffect } from 'react';
import { supabase, Student, Prediction, DataPipelineRun, ModelTrainingRun } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { RiskChart } from './RiskChart';
import { StudentList } from './StudentList';
import { StudentGrid } from './StudentGrid';
import { PipelineStatusPanel } from './PipelineStatusPanel';
import { TrainingStatusPanel } from './TrainingStatusPanel';
import { LogOut, Upload, LayoutGrid, Table as TableIcon } from 'lucide-react';

type StudentWithPrediction = Student & { prediction?: Prediction };

type Props = {
  onSelectStudent: (student: StudentWithPrediction) => void;
  onUploadModel: () => void;
};

export function Dashboard({ onSelectStudent, onUploadModel }: Props) {
  const [students, setStudents] = useState<StudentWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'visual'>('table');
  const [pipelineRuns, setPipelineRuns] = useState<DataPipelineRun[]>([]);
  const [trainingRuns, setTrainingRuns] = useState<ModelTrainingRun[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const { profile, signOut } = useAuth();

  useEffect(() => {
    loadData();
    loadPipelineRuns();
    loadTrainingRuns();
  }, []);

  const loadData = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('full_name');

      if (studentsError) throw studentsError;

      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .order('prediction_date', { ascending: false });

      if (predictionsError) throw predictionsError;

      const latestPredictions = new Map<string, Prediction>();
      predictionsData?.forEach((pred: Prediction) => {
        if (!latestPredictions.has(pred.student_id)) {
          latestPredictions.set(pred.student_id, pred);
        }
      });

      const studentsWithPredictions = studentsData?.map((student: Student) => ({
        ...student,
        prediction: latestPredictions.get(student.id),
      })) || [];

      setStudents(studentsWithPredictions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPipelineRuns = async () => {
    const { data, error } = await supabase
      .from('data_pipeline_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading pipeline runs:', error);
      return;
    }

    setPipelineRuns(data ?? []);
  };

  const loadTrainingRuns = async () => {
    const { data, error } = await supabase
      .from('model_training_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading training runs:', error);
      return;
    }

    setTrainingRuns(data ?? []);
  };

  const simulateRunMetrics = () => ({
    records_imported: Math.floor(300 + Math.random() * 200),
    feature_count: Math.floor(20 + Math.random() * 15),
  });

  const handleRunPipeline = async (triggeredBy: 'manual' | 'scheduler') => {
    try {
      setPipelineLoading(true);
      const { data: inserted, error } = await supabase
        .from('data_pipeline_runs')
        .insert({
          status: 'running',
          triggered_by: triggeredBy,
          notes: triggeredBy === 'manual' ? 'Triggered via dashboard' : 'Scheduled import',
        })
        .select()
        .single();

      if (error) throw error;

      const metrics = simulateRunMetrics();

      await supabase
        .from('data_pipeline_runs')
        .update({
          status: 'completed',
          ...metrics,
          completed_at: new Date().toISOString(),
        })
        .eq('id', inserted.id);

      await loadPipelineRuns();
    } catch (err) {
      console.error('Failed to run pipeline', err);
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleRunTraining = async () => {
    try {
      setTrainingLoading(true);
      const { data: inserted, error } = await supabase
        .from('model_training_runs')
        .insert({
          status: 'running',
          triggered_by: 'manual',
          notes: 'Dashboard-triggered retraining',
        })
        .select()
        .single();

      if (error) throw error;

      const accuracy = 0.8 + Math.random() * 0.15;
      const fairness = 0.75 + Math.random() * 0.2;

      await supabase
        .from('model_training_runs')
        .update({
          status: 'awaiting_approval',
          accuracy,
          fairness_score: fairness,
          completed_at: new Date().toISOString(),
          deployed_version: `v${(Math.random() * 3 + 2).toFixed(1)}`,
        })
        .eq('id', inserted.id);

      await loadTrainingRuns();
    } catch (err) {
      console.error('Failed to run training', err);
    } finally {
      setTrainingLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Student Risk Prediction Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {profile?.full_name}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-gray-100 rounded-lg p-1 flex items-center">
                <button
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${
                    viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                  onClick={() => setViewMode('table')}
                >
                  <TableIcon className="w-4 h-4" />
                  Table
                </button>
                <button
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${
                    viewMode === 'visual' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                  onClick={() => setViewMode('visual')}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Visual
                </button>
              </div>
              <button
                onClick={onUploadModel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Model
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <RiskChart students={students} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{students.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {students.filter(s => s.prediction?.risk_level === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">High Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {students.filter(s => s.prediction?.risk_level === 'medium').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Medium Risk</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <StudentList students={students} onSelectStudent={onSelectStudent} />
        ) : (
          <StudentGrid students={students} onSelectStudent={onSelectStudent} />
        )}

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <PipelineStatusPanel runs={pipelineRuns} onTrigger={handleRunPipeline} loading={pipelineLoading} />
          <TrainingStatusPanel runs={trainingRuns} onTrigger={handleRunTraining} loading={trainingLoading} />
        </div>
      </main>
    </div>
  );
}
