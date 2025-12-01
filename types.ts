
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
  // Firestore utilise des IDs string
  schoolId?: string;
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
    // Cycle Primaire (6 années)
    PRIMAIRE_1ERE = "1ère",
    PRIMAIRE_2EME = "2ème",
    PRIMAIRE_3EME = "3ème",
    PRIMAIRE_4EME = "4ème",
    PRIMAIRE_5EME = "5ème",
    PRIMAIRE_6EME = "6ème",
    // Cycle Secondaire (6 années)
    SECONDAIRE_7EB = "7ème EB",
    SECONDAIRE_8EB = "8ème EB",
    SECONDAIRE_1 = "1ère",
    SECONDAIRE_2 = "2ème",
    SECONDAIRE_3 = "3ème",
    SECONDAIRE_4 = "4ème"
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
    id: number | string;
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
