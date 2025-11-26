import { z } from 'zod';
import { StudentStatus } from '../types';

// Shared helpers
export const emailSchema = z
  .string({ required_error: "Email requis" })
  .trim()
  .toLowerCase()
  .email('Format email invalide');

export const passwordSchema = z
  .string({ required_error: 'Mot de passe requis' })
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères');

export const nonEmptyString = (label: string) =>
  z.string({ required_error: `${label} requis` }).trim().min(1, `${label} requis`);

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || /^[+]?\d[\d\s()-]{6,}$/.test(val),
    'Numéro de téléphone invalide'
  );

// Auth
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    fullName: nonEmptyString('Nom complet'),
    schoolName: nonEmptyString("Nom de l'école"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

// Students
export const studentSchema = z.object({
  name: nonEmptyString("Nom de l'étudiant").min(2, 'Le nom doit contenir au moins 2 caractères'),
  class_id: nonEmptyString('Classe'),
  status: z.nativeEnum(StudentStatus, {
    required_error: 'Statut requis',
    invalid_type_error: 'Statut invalide',
  }),
  enrollment_date: nonEmptyString("Date d'inscription"),
  phone_number: phoneSchema,
  parent_phone_number: phoneSchema,
  parent_address: z.string().trim().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignUpForm = z.infer<typeof signUpSchema>;
export type StudentForm = z.infer<typeof studentSchema>;
