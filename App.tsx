
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { Role } from './types';
import { firebaseReady, firebaseErrorMessage } from './lib/firebase';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SchoolDirectorDashboard from './pages/SchoolDirectorDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import UserManagement from './pages/UserManagement';
import ReportsDashboard from './pages/ReportsDashboard';
import ClassManagement from './pages/ClassManagement';
import StudentManagement from './pages/StudentManagement';
import PaymentManagement from './pages/PaymentManagement';
import NotificationCenter from './pages/NotificationCenter';
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  if (!firebaseReady) {
    return (
      <div style={{minHeight:'100vh'}} className="flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-xl shadow p-6 space-y-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-triangle-exclamation text-amber-500 text-2xl" aria-hidden="true"></i>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Configuration requise</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            L'application ne peut pas démarrer car certaines variables d'environnement Firebase sont manquantes au moment du build.
          </p>
          {firebaseErrorMessage && (
            <pre className="text-xs bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 p-3 rounded overflow-auto">
              {firebaseErrorMessage}
            </pre>
          )}
          <ol className="list-decimal pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Créez un fichier <code>.env.local</code> à la racine du projet.</li>
            <li>Renseignez les clés <code>VITE_FIREBASE_*</code> (voir <code>.env.example</code>).</li>
            <li>Rebuild: <code>npm run build</code> puis redéployez sur Firebase Hosting.</li>
          </ol>
          <p className="text-xs text-slate-500">Astuce: les variables doivent commencer par <code>VITE_</code> pour être injectées dans le bundle.</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  switch (user.role) {
    case Role.SUPER_ADMIN:
      return <Navigate to="/administrator-dashboard" replace />;
    case Role.SCHOOL_DIRECTOR:
      return <Navigate to="/school-dashboard" replace />;
    case Role.TEACHER:
      return <Navigate to="/teacher-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <RoleBasedRedirect /> : <Login />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute allowedRoles={Object.values(Role)}><RoleBasedRedirect /></ProtectedRoute>} />

        {/* Super Admin Routes */}
        <Route path="/administrator-dashboard" element={<ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/user-management" element={<ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}><UserManagement /></ProtectedRoute>} />
        <Route path="/reports-dashboard" element={<ProtectedRoute allowedRoles={Object.values(Role)}><ReportsDashboard /></ProtectedRoute>} />

        {/* School Director Routes */}
        <Route path="/school-dashboard" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><SchoolDirectorDashboard /></ProtectedRoute>} />
        <Route path="/class-management" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><ClassManagement /></ProtectedRoute>} />
        <Route path="/student-management" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><StudentManagement /></ProtectedRoute>} />
        <Route path="/payment-management" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><PaymentManagement /></ProtectedRoute>} />
        <Route path="/staff-management" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><StaffManagement /></ProtectedRoute>} />
        
        {/* Teacher Routes */}
        <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={[Role.TEACHER]}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/notification-center" element={<ProtectedRoute allowedRoles={[Role.TEACHER]}><NotificationCenter /></ProtectedRoute>} />

        {/* Common Routes */}
        <Route path="/settings" element={<ProtectedRoute allowedRoles={Object.values(Role)}><Settings /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
