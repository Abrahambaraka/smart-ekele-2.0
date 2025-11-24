
// Fix: Import React to resolve JSX types and allow JSX syntax.
import React from 'react';
import { Role, User, School, Student, Class, ClassLevel, StudentStatus, Payment, PaymentStatus, Notification, Event } from './types';

// Mock Users
export const MOCK_USERS: Record<Role, User> = {
  [Role.SUPER_ADMIN]: { id: '1', name: 'Super Admin', email: 'superadmin@demo.com', role: Role.SUPER_ADMIN },
  [Role.SCHOOL_DIRECTOR]: { id: '2', name: 'Directeur Kabila', email: 'directeur@demo.com', role: Role.SCHOOL_DIRECTOR, schoolId: 101 },
  [Role.TEACHER]: { id: '3', name: 'Professeur Ilunga', email: 'professeur@demo.com', role: Role.TEACHER, schoolId: 101 },
};

// Mock Data
export const MOCK_SCHOOLS: School[] = [
  { id: 101, name: 'Lycée Salama', directorId: '2', studentCount: 1250, teacherCount: 85, classCount: 40, status: 'Active' },
  { id: 102, name: 'Collège Boboto', directorId: '4', studentCount: 800, teacherCount: 55, classCount: 30, status: 'Active' },
  { id: 103, name: 'Institut Elikya', directorId: '5', studentCount: 1500, teacherCount: 102, classCount: 50, status: 'Active' },
  { id: 104, name: 'École Les Anges', directorId: '6', studentCount: 650, teacherCount: 45, classCount: 25, status: 'Inactive' },
];

export const MOCK_CLASSES: Class[] = [
    { id: 201, name: 'Terminale S1', level: ClassLevel.TERMINALE, teacherId: '3', schoolId: 101, studentCount: 30 },
    { id: 202, name: 'Première L', level: ClassLevel.PREMIERE, teacherId: '7', schoolId: 101, studentCount: 28 },
    { id: 203, name: 'Seconde A', level: ClassLevel.SECONDE, teacherId: '8', schoolId: 101, studentCount: 32 },
    { id: 204, name: '3ème B', level: ClassLevel.TROISIEME, teacherId: '9', schoolId: 101, studentCount: 25 },
    { id: 205, name: '4ème C', level: ClassLevel.QUATRIEME, teacherId: '10', schoolId: 101, studentCount: 27 },
    { id: 206, name: '5ème A', level: ClassLevel.CINQUIEME, teacherId: '11', schoolId: 101, studentCount: 29 },
    { id: 207, name: '6ème D', level: ClassLevel.SIXIEME, teacherId: '12', schoolId: 101, studentCount: 26 },
];

const firstNames = ['Alain', 'Bijou', 'Cedrick', 'Denise', 'Etienne', 'Fifi', 'Gael', 'Hortense', 'Isaac', 'Judith'];
const lastNames = ['Mbayo', 'Ngoyi', 'Kalala', 'Tshibangu', 'Kasongo', 'Mbuyi', 'Ngalula', 'Kazadi', 'Mukendi', 'Ilunga'];

export const MOCK_STUDENTS: Student[] = Array.from({ length: 50 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / lastNames.length) % lastNames.length];
    return {
        id: 301 + i,
        name: `${firstName} ${lastName}`,
        classId: MOCK_CLASSES[i % MOCK_CLASSES.length].id,
        status: Object.values(StudentStatus)[i % Object.values(StudentStatus).length],
        enrollmentDate: `2023-09-${(i % 30) + 1}`,
        phoneNumber: `081 ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')} ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        parentPhoneNumber: `099 ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')} ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
        parentAddress: `${i + 1} Av. Victoire, C/Kalamu, Kinshasa`
    }
});

const paymentReasons = [
    { reason: "Inscription", amount: 250, description: "Inscription Annuelle" },
    { reason: "Frais Scolaire", amount: 150, description: `Frais Scolaire - ${['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'][Math.floor(Math.random() * 10)]}` },
    { reason: "Frais de l'état", amount: 50, description: `Frais de l'état - ${Math.random() > 0.5 ? "1ère" : "2ème"} Tranche` },
    { reason: "Frais d'examen", amount: 75, description: `Frais d'examen - ${Math.random() > 0.5 ? "1ère" : "2ème"} Tranche` },
];

export const MOCK_PAYMENTS: Payment[] = Array.from({ length: 50 }, (_, i) => {
    const student = MOCK_STUDENTS[i % MOCK_STUDENTS.length];
    const reasonTemplate = paymentReasons[i % paymentReasons.length];
    
    return {
        id: 401 + i,
        studentId: student.id,
        amount: reasonTemplate.amount,
        status: Object.values(PaymentStatus)[i % Object.values(PaymentStatus).length],
        dueDate: `2024-0${(i % 9) + 1}-${(i % 28) + 1}`,
        description: reasonTemplate.description,
    };
});


export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 501, title: 'Réunion Pédagogique', content: 'Une réunion pour tous les professeurs de Terminale aura lieu demain à 10h.', date: '2024-05-20', read: false, sender: 'Direction', target: 'Professeurs' },
    { id: 502, title: 'Rappel : Notes du 2ème trimestre', content: 'Veuillez soumettre les notes finales avant la fin de la semaine.', date: '2024-05-18', read: true, sender: 'Administration', target: 'Professeur Ilunga' },
    { id: 503, title: 'Événement Sportif', content: 'La journée sportive annuelle est programmée pour le 5 Juin. Participez nombreux !', date: '2024-05-15', read: false, sender: 'Bureau des Sports', target: 'Tous' },
    { id: 504, title: 'Absence : KASONGO MBUYI (Seconde A)', content: 'Bonjour. Nous vous informons de l\'absence de votre enfant KASONGO MBUYI (Classe: Seconde A) en date du 22/05/2024. Cordialement, Lycée Salama.', date: '2024-05-22', read: false, sender: 'Prof. Ilunga', target: 'Parent de KASONGO MBUYI' },
];

export const MOCK_EVENTS: Event[] = [
    { id: 601, title: 'Examen de Mathématiques', date: '2024-06-05', time: '10:00', class: 'Terminale S1' },
    { id: 602, title: 'Réunion Pédagogique', date: '2024-06-07', time: '14:30' },
    { id: 603, title: 'Correction des copies', date: '2024-06-10', time: '09:00' },
    { id: 604, title: 'Conseil de classe', date: '2024-06-12', time: '16:00', class: 'Terminale S1' },
];


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
