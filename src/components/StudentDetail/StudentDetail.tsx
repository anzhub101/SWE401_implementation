import { useState, useEffect } from 'react';
import { Student, Prediction, Intervention, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Plus, AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { InterventionForm } from './InterventionForm';

type StudentWithPrediction = Student & { prediction?: Prediction };

type Props = {
  student: StudentWithPrediction;
  onClose: () => void;
};

export function StudentDetail({ student, onClose }: Props) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    loadInterventions();
  }, [student.id]);

  const loadInterventions = async () => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('student_id', student.id)
        .order('intervention_date', { ascending: false });

      if (error) throw error;
      setInterventions(data || []);
    } catch (error) {
      console.error('Error loading interventions:', error);
    }
  };

  const getRiskIcon = () => {
    switch (student.prediction?.risk_level) {
      case 'high':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      default:
        return null;
    }
  };

  const getRiskColor = () => {
    switch (student.prediction?.risk_level) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const rationale = student.prediction?.rationale || {};
  const rationaleEntries = Object.entries(rationale).sort(([, a], [, b]) => (b as number) - (a as number));

  const handleInterventionSaved = () => {
    setShowInterventionForm(false);
    loadInterventions();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{student.full_name}</h3>
                <p className="text-gray-600 mt-1">{student.email}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-gray-700">
                    <span className="font-medium">Major:</span> {student.major || 'N/A'}
                  </span>
                  <span className="text-gray-700">
                    <span className="font-medium">Year:</span> {student.year || 'N/A'}
                  </span>
                  <span className="text-gray-700">
                    <span className="font-medium">GPA:</span> {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="text-center">
                {getRiskIcon()}
                <div className={`text-lg font-bold mt-2 ${getRiskColor()}`}>
                  {student.prediction?.risk_level?.toUpperCase() || 'UNKNOWN'}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {student.prediction?.risk_score?.toFixed(1) || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Risk Factors</h4>
            </div>
            {rationaleEntries.length > 0 ? (
              <div className="space-y-3">
                {rationaleEntries.map(([factor, importance]) => (
                  <div key={factor}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {factor.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {((importance as number) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(importance as number) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No rationale data available</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Interventions</h4>
              <button
                onClick={() => setShowInterventionForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Log Intervention
              </button>
            </div>

            {showInterventionForm && (
              <InterventionForm
                studentId={student.id}
                advisorId={profile!.id}
                onSave={handleInterventionSaved}
                onCancel={() => setShowInterventionForm(false)}
              />
            )}

            {interventions.length > 0 ? (
              <div className="space-y-3 mt-4">
                {interventions.map((intervention) => (
                  <div
                    key={intervention.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">
                        {intervention.intervention_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(intervention.intervention_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{intervention.description}</p>
                    {intervention.outcome && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Outcome:</span> {intervention.outcome}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mt-4">No interventions recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
