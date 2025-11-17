import type { DataPipelineRun } from '../../lib/supabase';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';

type Props = {
  runs: DataPipelineRun[];
  onTrigger: (triggeredBy: 'manual' | 'scheduler') => Promise<void>;
  loading: boolean;
};

export function PipelineStatusPanel({ runs, onTrigger, loading }: Props) {
  const latestRun = runs[0];

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Pipeline</h3>
          <p className="text-sm text-gray-500">UC-004: Automatic LMS/SIS import</p>
        </div>
        <button
          onClick={() => onTrigger('manual')}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? 'Running...' : 'Run Import'}
        </button>
      </div>

      {latestRun ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
          <Database className="w-10 h-10 text-blue-500" />
          <div>
            <p className="text-sm text-blue-900">
              Last run {new Date(latestRun.started_at).toLocaleString()} · {latestRun.status.toUpperCase()}
            </p>
            <p className="text-xs text-blue-800 mt-1">
              {latestRun.records_imported} records • {latestRun.feature_count} engineered features
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
          No pipeline runs yet.
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent activity</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {runs.length === 0 && <p className="text-xs text-gray-500">No activity.</p>}
          {runs.map((run) => (
            <div key={run.id} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full mt-2" data-status={run.status}
                style={{ backgroundColor: getStatusColor(run.status) }} />
              <div>
                <p className="text-gray-900">
                  {run.status.toUpperCase()} · {run.records_imported} records · triggered by {run.triggered_by}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(run.started_at).toLocaleString()}
                  {run.completed_at && ` → ${new Date(run.completed_at).toLocaleTimeString()}`}
                </p>
                {run.error_message && (
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {run.error_message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: DataPipelineRun['status']) {
  switch (status) {
    case 'completed':
      return '#16a34a';
    case 'running':
      return '#f97316';
    case 'failed':
      return '#dc2626';
    default:
      return '#6b7280';
  }
}


