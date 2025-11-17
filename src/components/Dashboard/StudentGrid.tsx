import type { Student, Prediction } from '../../lib/supabase';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

type StudentWithPrediction = Student & { prediction?: Prediction };

type Props = {
  students: StudentWithPrediction[];
  onSelectStudent: (student: StudentWithPrediction) => void;
};

const riskConfig = {
  high: {
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    pill: 'bg-red-100 text-red-800 border-red-200',
    shadow: 'shadow-red-100 border-red-200',
  },
  medium: {
    icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    pill: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    shadow: 'shadow-yellow-100 border-yellow-200',
  },
  low: {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    pill: 'bg-green-100 text-green-800 border-green-200',
    shadow: 'shadow-green-100 border-green-200',
  },
  unknown: {
    icon: null,
    pill: 'bg-gray-100 text-gray-800 border-gray-200',
    shadow: 'shadow-gray-100 border-gray-200',
  },
};

export function StudentGrid({ students, onSelectStudent }: Props) {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
        No students available yet. Import data to begin monitoring risk.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {students.map((student) => {
        const riskLevel = student.prediction?.risk_level ?? 'unknown';
        const config = riskConfig[riskLevel as keyof typeof riskConfig] ?? riskConfig.unknown;

        return (
          <button
            key={student.id}
            onClick={() => onSelectStudent(student)}
            className={`bg-white border rounded-2xl p-5 text-left transition-all hover:-translate-y-1 ${config.shadow}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">{student.major || 'Undeclared'}</p>
                <h4 className="text-lg font-semibold text-gray-900">{student.full_name}</h4>
              </div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide border rounded-full ${config.pill}`}
              >
                {config.icon}
                {riskLevel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {student.prediction?.risk_score?.toFixed(1) ?? '--'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">GPA</p>
                <p className="text-xl font-semibold text-gray-800">
                  {student.gpa ? student.gpa.toFixed(2) : '--'}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


