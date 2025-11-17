import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { StudentDetail } from './components/StudentDetail/StudentDetail';
import { ModelUpload } from './components/MLModel/ModelUpload';
import type { Student, Prediction } from './lib/supabase';

type StudentWithPrediction = Student & { prediction?: Prediction };

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<StudentWithPrediction | null>(null);
  const [showModelUpload, setShowModelUpload] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginForm />;
  }

  return (
    <>
      <Dashboard
        onSelectStudent={setSelectedStudent}
        onUploadModel={() => setShowModelUpload(true)}
      />
      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
      {showModelUpload && (
        <ModelUpload
          onClose={() => setShowModelUpload(false)}
          onSuccess={() => {}}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
