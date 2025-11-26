
// Fix: Import React to resolve JSX types and allow JSX syntax.
import React from 'react';
import { Role } from './types';

// Toutes les données mock ont été retirées. Si certains écrans importent encore ces constantes,
// on expose des placeholders vides pour éviter les crashs le temps de migrer vers Firestore.
export const MOCK_USERS = {} as Record<string, unknown>;
export const MOCK_SCHOOLS: unknown[] = [];
export const MOCK_CLASSES: unknown[] = [];
export const MOCK_STUDENTS: unknown[] = [];
export const MOCK_PAYMENTS: unknown[] = [];
export const MOCK_NOTIFICATIONS: unknown[] = [];
export const MOCK_EVENTS: unknown[] = [];


// Icons
const DashboardIcon = () => <i className="fa-solid fa-house w-6 h-6"></i>;
const UserManagementIcon = () => <i className="fa-solid fa-users-gear w-6 h-6"></i>;
const ReportsIcon = () => <i className="fa-solid fa-chart-pie w-6 h-6"></i>;
const SchoolIcon = () => <i className="fa-solid fa-school w-6 h-6"></i>;
const ClassIcon = () => <i className="fa-solid fa-chalkboard-user w-6 h-6"></i>;
const StudentIcon = () => <i className="fa-solid fa-user-graduate w-6 h-6"></i>;
const PaymentIcon = () => <i className="fa-solid fa-file-invoice-dollar w-6 h-6"></i>;
const NotificationIcon = () => <i className="fa-solid fa-bell w-6 h-6"></i>;
const StaffIcon = () => <i className="fa-solid fa-id-card w-6 h-6"></i>;

// Navigation
// Fix: Changed JSX.Element to React.ReactNode to resolve the "Cannot find namespace 'JSX'" error.
export const NAVIGATION_LINKS: Record<Role, { name: string; path: string; icon: React.ReactNode }[]> = {
  [Role.SUPER_ADMIN]: [
    { name: 'Dashboard Global', path: '/administrator-dashboard', icon: <DashboardIcon /> },
    { name: 'Gestion Utilisateurs', path: '/user-management', icon: <UserManagementIcon /> },
    { name: 'Rapports consolidés', path: '/reports-dashboard', icon: <ReportsIcon /> },
  ],
  [Role.SCHOOL_DIRECTOR]: [
    { name: 'Dashboard École', path: '/school-dashboard', icon: <SchoolIcon /> },
    { name: 'Gestion Personnel', path: '/staff-management', icon: <StaffIcon /> },
    { name: 'Gestion Classes', path: '/class-management', icon: <ClassIcon /> },
    { name: 'Gestion Étudiants', path: '/student-management', icon: <StudentIcon /> },
    { name: 'Gestion Financière', path: '/payment-management', icon: <PaymentIcon /> },
    { name: 'Rapports École', path: '/reports-dashboard', icon: <ReportsIcon /> },
  ],
  [Role.TEACHER]: [
    { name: 'Tableau de bord', path: '/teacher-dashboard', icon: <DashboardIcon /> },
    { name: 'Centre de notifications', path: '/notification-center', icon: <NotificationIcon /> },
    { name: 'Rapports de classes', path: '/reports-dashboard', icon: <ReportsIcon /> },
  ],
};
