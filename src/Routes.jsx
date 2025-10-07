import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AdministratorDashboard from './pages/administrator-dashboard';
import LoginPage from './pages/login';
import UserManagement from './pages/user-management';
import ClassManagement from './pages/class-management';
import StudentManagement from './pages/student-management';
import NotificationCenter from './pages/notification-center';
import ReportsDashboard from './pages/reports-dashboard';
import PaymentManagement from './pages/payment-management';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<AdministratorDashboard />} />
        <Route path="/administrator-dashboard" element={<AdministratorDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/class-management" element={<ClassManagement />} />
        <Route path="/student-management" element={<StudentManagement />} />
        <Route path="/notification-center" element={<NotificationCenter />} />
        <Route path="/reports-dashboard" element={<ReportsDashboard />} />
        <Route path="/payment-management" element={<PaymentManagement />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
