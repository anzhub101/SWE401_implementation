import { useState } from 'react';
import { supabase } from '../../lib/supabase';

type Props = {
  studentId: string;
  advisorId: string;
  onSave: () => void;
  onCancel: () => void;
};

export function InterventionForm({ studentId, advisorId, onSave, onCancel }: Props) {
  const [interventionType, setInterventionType] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const interventionTypes = [
    'Academic Advising',
    'Tutoring Referral',
    'Counseling Referral',
    'Study Skills Workshop',
    'Check-in Meeting',
    'Email Follow-up',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('interventions').insert({
        student_id: studentId,
        advisor_id: advisorId,
        intervention_type: interventionType,
        description,
        outcome,
      });

      if (insertError) throw insertError;
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save intervention');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Intervention Type *
          </label>
          <select
            id="type"
            required
            value={interventionType}
            onChange={(e) => setInterventionType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select type...</option>
            {interventionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the intervention..."
          />
        </div>

        <div>
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
            Outcome
          </label>
          <input
            id="outcome"
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional: Expected or observed outcome"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Intervention'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
