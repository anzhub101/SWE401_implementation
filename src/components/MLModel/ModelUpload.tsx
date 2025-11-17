import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, Upload, FileJson, CheckCircle } from 'lucide-react';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export function ModelUpload({ onClose, onSuccess }: Props) {
  const [version, setVersion] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { profile } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        setError('Please upload a JSON file');
        return;
      }
      setModelFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!modelFile) {
        throw new Error('Please select a model file');
      }

      const fileContent = await modelFile.text();
      const modelData = JSON.parse(fileContent);

      const { data: existingModels, error: queryError } = await supabase
        .from('ml_models')
        .select('*')
        .eq('is_active', true);

      if (queryError) throw queryError;

      if (existingModels && existingModels.length > 0) {
        const { error: updateError } = await supabase
          .from('ml_models')
          .update({ is_active: false })
          .eq('is_active', true);

        if (updateError) throw updateError;
      }

      const { error: insertError } = await supabase.from('ml_models').insert({
        version,
        accuracy: parseFloat(accuracy),
        model_data: modelData,
        is_active: true,
        uploaded_by: profile!.id,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold text-white">Upload ML Model</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Model uploaded successfully!
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Model Requirements</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Model must be in JSON format</li>
              <li>• Include model weights, parameters, and feature names</li>
              <li>• Uploading a new model will deactivate the current one</li>
            </ul>
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
              Model Version *
            </label>
            <input
              id="version"
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., v2.1.0"
            />
          </div>

          <div>
            <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700 mb-2">
              Model Accuracy (%) *
            </label>
            <input
              id="accuracy"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              value={accuracy}
              onChange={(e) => setAccuracy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 87.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model File (JSON) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {modelFile ? (
                  <>
                    <FileJson className="w-12 h-12 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">{modelFile.name}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {(modelFile.size / 1024).toFixed(2)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Click to upload model file
                    </span>
                    <span className="text-xs text-gray-500 mt-1">JSON format only</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Note:</span> After uploading, you'll need to run
              predictions using the new model to update student risk scores.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : success ? 'Success!' : 'Upload Model'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
