
export enum Role {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_DIRECTOR = 'school_director',
  TEACHER = 'teacher',
}

export interface User {
  id: string; 
  name: string;
  email: string;
  role: Role;
  schoolId?: number | string; // Updated to support Firestore String IDs
}

export interface School {
  id: number | string;
  name: string;
  status: 'Active' | 'Inactive';
  directorId?: string;
  studentCount?: number;
  teacherCount?: number;
  classCount?: number;
}

export enum ClassLevel {
    SIXIEME = "6ème",
    CINQUIEME = "5ème",
    QUATRIEME = "4ème",
    TROISIEME = "3ème",
    SECONDE = "Seconde",
    PREMIERE = "Première",
    TERMINALE = "Terminale"
}

export interface Class {
    id: number | string;
    name: string;
    level: ClassLevel;
    teacherId?: string; 
    schoolId: number | string;
    studentCount?: number;
}

export enum StudentStatus {
    ACTIVE = "Active",
    TRANSFERRED = "Transferred",
    GRADUATED = "Graduated",
    INACTIVE = "Inactive"
}

export interface Student {
    id: number | string;
    name: string;
    classId?: number | string;
    status: StudentStatus;
    enrollmentDate: string;
    phoneNumber?: string;
    parentPhoneNumber?: string;
    parentAddress?: string;
}

export enum PaymentStatus {
    PAID = "Payé",
    PARTIAL = "Partiel",
    LATE = "En retard",
    EXEMPTED = "Exempté"
}

export interface Payment {
    id: number | string;
    studentId: number | string;
    amount: number;
    status: PaymentStatus;
    dueDate: string;
    description: string;
}

export interface Notification {
    id: number;
    title: string;
    content: string;
    date: string;
    read: boolean;
    sender: string;
    target: string;
}

export interface Event {
    id: number;
    title: string;
    date: string; 
    time: string; 
    class?: string; 
}
