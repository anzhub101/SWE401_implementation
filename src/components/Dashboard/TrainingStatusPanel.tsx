import type { ModelTrainingRun } from '../../lib/supabase';
import { Brain, Play, ShieldCheck } from 'lucide-react';

type Props = {
  runs: ModelTrainingRun[];
  onTrigger: () => Promise<void>;
  loading: boolean;
};

export function TrainingStatusPanel({ runs, onTrigger, loading }: Props) {
  const latestRun = runs[0];

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Model Retraining</h3>
          <p className="text-sm text-gray-500">UC-005: End-of-term retraining</p>
        </div>
        <button
          onClick={onTrigger}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {loading ? 'Running...' : 'Start Retraining'}
        </button>
      </div>

      {latestRun ? (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-4">
          <Brain className="w-10 h-10 text-purple-500" />
          <div>
            <p className="text-sm text-purple-900">
              {latestRun.status.toUpperCase()} · started{' '}
              {new Date(latestRun.started_at).toLocaleString()}
            </p>
            <p className="text-xs text-purple-800 mt-1">
              Accuracy {(latestRun.accuracy * 100).toFixed(1)}% · Fairness {(latestRun.fairness_score * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
          No training runs yet.
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent runs</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {runs.length === 0 && <p className="text-xs text-gray-500">No runs recorded.</p>}
          {runs.map((run) => (
            <div key={run.id} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: getTrainingColor(run.status) }} />
              <div>
                <p className="text-gray-900">
                  {run.status.toUpperCase()} · {(run.accuracy * 100).toFixed(1)}% accuracy · triggered by {run.triggered_by}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(run.started_at).toLocaleString()}
                  {run.completed_at && ` → ${new Date(run.completed_at).toLocaleTimeString()}`}
                </p>
                {run.status === 'awaiting_approval' && (
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-yellow-600">
                    <ShieldCheck className="w-3 h-3" />
                    Awaiting IT approval
                  </div>
                )}
                {run.notes && <p className="text-xs text-gray-500 mt-1">{run.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getTrainingColor(status: ModelTrainingRun['status']) {
  switch (status) {
    case 'deployed':
      return '#22c55e';
    case 'running':
    case 'evaluating':
      return '#f97316';
    case 'awaiting_approval':
      return '#eab308';
    case 'failed':
      return '#dc2626';
    default:
      return '#6b7280';
  }
}


