import { Student, Prediction } from '../../lib/supabase';

type StudentWithPrediction = Student & { prediction?: Prediction };

type Props = {
  students: StudentWithPrediction[];
};

export function RiskChart({ students }: Props) {
  const riskCounts = {
    high: students.filter(s => s.prediction?.risk_level === 'high').length,
    medium: students.filter(s => s.prediction?.risk_level === 'medium').length,
    low: students.filter(s => s.prediction?.risk_level === 'low').length,
  };

  const total = students.length;
  const maxCount = Math.max(riskCounts.high, riskCounts.medium, riskCounts.low, 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Risk Distribution</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">High Risk</span>
            <span className="text-sm font-semibold text-red-600">{riskCounts.high}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (riskCounts.high / maxCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Medium Risk</span>
            <span className="text-sm font-semibold text-yellow-600">{riskCounts.medium}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (riskCounts.medium / maxCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Low Risk</span>
            <span className="text-sm font-semibold text-green-600">{riskCounts.low}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (riskCounts.low / maxCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Students</span>
          <span className="font-semibold text-gray-800">{total}</span>
        </div>
      </div>
    </div>
  );
}
