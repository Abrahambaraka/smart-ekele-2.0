-- Location: supabase/migrations/20250915122223_smart_ekele_school_management.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete school management system setup
-- Dependencies: None (first migration)

-- 1. Create custom types
CREATE TYPE public.user_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'parent', 'student');
CREATE TYPE public.school_status AS ENUM ('active', 'suspended', 'inactive', 'pending');
CREATE TYPE public.student_status AS ENUM ('active', 'suspended', 'graduated', 'transferred', 'inactive');
CREATE TYPE public.payment_status AS ENUM ('paid', 'partial', 'overdue', 'exempt');
CREATE TYPE public.class_level AS ENUM ('6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'terminale');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE public.notification_type AS ENUM ('payment', 'attendance', 'grades', 'announcement', 'emergency');
CREATE TYPE public.notification_method AS ENUM ('whatsapp', 'sms', 'email', 'push');

-- 2. Core tables (no foreign keys)

-- User profiles table (intermediary for auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'school_admin'::public.user_role,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Schools table (managed by super admin)
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    admin_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status public.school_status DEFAULT 'active'::public.school_status,
    academic_year TEXT DEFAULT '2024-2025',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Academic classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level public.class_level NOT NULL,
    section TEXT DEFAULT 'A',
    capacity INTEGER DEFAULT 30,
    teacher_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    academic_year TEXT DEFAULT '2024-2025',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL UNIQUE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('M', 'F')),
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    address TEXT,
    status public.student_status DEFAULT 'active'::public.student_status,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Student enrollments (many-to-many between students and classes)
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year TEXT DEFAULT '2024-2025',
    enrollment_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, class_id, academic_year)
);

-- Monthly payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    month_year TEXT NOT NULL, -- Format: "2024-09"
    due_date DATE NOT NULL,
    paid_date DATE,
    status public.payment_status DEFAULT 'overdue'::public.payment_status,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Daily attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status public.attendance_status DEFAULT 'present'::public.attendance_status,
    notes TEXT,
    marked_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, class_id, attendance_date)
);

-- Notifications table (for WhatsApp and other notifications)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    parent_phone TEXT NOT NULL,
    type public.notification_type NOT NULL,
    method public.notification_method DEFAULT 'whatsapp'::public.notification_method,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ,
    delivery_status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes for performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_schools_admin_id ON public.schools(admin_id);
CREATE INDEX idx_schools_status ON public.schools(status);
CREATE INDEX idx_classes_school_id ON public.classes(school_id);
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_students_school_id ON public.students(school_id);
CREATE INDEX idx_students_student_id ON public.students(student_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_class_id ON public.enrollments(class_id);
CREATE INDEX idx_payments_student_id ON public.payments(student_id);
CREATE INDEX idx_payments_school_id ON public.payments(school_id);
CREATE INDEX idx_payments_month_year ON public.payments(month_year);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_attendance_class_id ON public.attendance(class_id);
CREATE INDEX idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX idx_notifications_school_id ON public.notifications(school_id);
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);

-- 4. Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'school_admin')::public.user_role
  );
  RETURN NEW;
END;
$$;

-- Function to generate student ID
CREATE OR REPLACE FUNCTION public.generate_student_id(school_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
    student_id TEXT;
BEGIN
    -- Get the next number for this school
    SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM LENGTH(school_code) + 1) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.students
    WHERE student_id LIKE school_code || '%';
    
    -- Format: SCHOOL_CODE + 3-digit number (e.g., "ECL001")
    student_id := school_code || LPAD(next_number::TEXT, 3, '0');
    
    RETURN student_id;
END;
$$;

-- Function to create monthly payments for a student
CREATE OR REPLACE FUNCTION public.create_monthly_payments(
    student_uuid UUID,
    start_month TEXT,
    num_months INTEGER DEFAULT 10,
    monthly_amount DECIMAL DEFAULT 25000.00
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_month DATE;
    school_uuid UUID;
    i INTEGER;
BEGIN
    -- Get student's school
    SELECT school_id INTO school_uuid
    FROM public.students
    WHERE id = student_uuid;
    
    current_month := (start_month || '-01')::DATE;
    
    FOR i IN 0..(num_months - 1) LOOP
        INSERT INTO public.payments (
            student_id, 
            school_id,
            amount, 
            month_year, 
            due_date,
            status
        )
        VALUES (
            student_uuid,
            school_uuid,
            monthly_amount,
            TO_CHAR(current_month + INTERVAL '1 month' * i, 'YYYY-MM'),
            (current_month + INTERVAL '1 month' * i + INTERVAL '5 days')::DATE,
            'overdue'::public.payment_status
        );
    END LOOP;
END;
$$;

-- 5. Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Pattern 1: Core user table policies (user_profiles)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 6A: Role-based access using auth.users metadata
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'super_admin' 
         OR au.raw_app_meta_data->>'role' = 'super_admin')
)
$$;

CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT s.id
FROM public.schools s
JOIN public.user_profiles up ON s.admin_id = up.id
WHERE up.id = auth.uid()
LIMIT 1
$$;

-- Schools table policies
CREATE POLICY "super_admin_full_access_schools"
ON public.schools
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "school_admin_manage_own_school"
ON public.schools
FOR ALL
TO authenticated
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());

-- Classes table policies
CREATE POLICY "super_admin_full_access_classes"
ON public.classes
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "school_users_manage_school_classes"
ON public.classes
FOR ALL
TO authenticated
USING (school_id = public.get_user_school_id())
WITH CHECK (school_id = public.get_user_school_id());

-- Students table policies
CREATE POLICY "super_admin_full_access_students"
ON public.students
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "school_users_manage_school_students"
ON public.students
FOR ALL
TO authenticated
USING (school_id = public.get_user_school_id())
WITH CHECK (school_id = public.get_user_school_id());

-- Enrollments table policies
CREATE POLICY "school_users_manage_enrollments"
ON public.enrollments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = enrollments.student_id
        AND s.school_id = public.get_user_school_id()
    )
);

-- Payments table policies
CREATE POLICY "super_admin_full_access_payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "school_users_manage_school_payments"
ON public.payments
FOR ALL
TO authenticated
USING (school_id = public.get_user_school_id())
WITH CHECK (school_id = public.get_user_school_id());

-- Attendance table policies
CREATE POLICY "school_users_manage_attendance"
ON public.attendance
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = attendance.student_id
        AND s.school_id = public.get_user_school_id()
    )
);

-- Notifications table policies
CREATE POLICY "super_admin_full_access_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "school_users_manage_school_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (school_id = public.get_user_school_id())
WITH CHECK (school_id = public.get_user_school_id());

-- 7. Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Mock Data with complete auth.users records
DO $$
DECLARE
    super_admin_uuid UUID := gen_random_uuid();
    school1_admin_uuid UUID := gen_random_uuid();
    school2_admin_uuid UUID := gen_random_uuid();
    teacher1_uuid UUID := gen_random_uuid();
    teacher2_uuid UUID := gen_random_uuid();
    parent1_uuid UUID := gen_random_uuid();
    parent2_uuid UUID := gen_random_uuid();
    school1_uuid UUID := gen_random_uuid();
    school2_uuid UUID := gen_random_uuid();
    class1_uuid UUID := gen_random_uuid();
    class2_uuid UUID := gen_random_uuid();
    class3_uuid UUID := gen_random_uuid();
    student1_uuid UUID := gen_random_uuid();
    student2_uuid UUID := gen_random_uuid();
    student3_uuid UUID := gen_random_uuid();
    student4_uuid UUID := gen_random_uuid();
BEGIN
    -- Create complete auth.users records
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (super_admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@smartekele.fr', crypt('Admin123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Super Administrateur", "role": "super_admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (school1_admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'ecole1@smartekele.fr', crypt('Ecole123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Directeur École Primaire", "role": "school_admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (school2_admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'college@smartekele.fr', crypt('College123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Principal Collège", "role": "school_admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (teacher1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'prof@smartekele.fr', crypt('Prof123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Marie Dubois", "role": "teacher"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (teacher2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'prof2@smartekele.fr', crypt('Prof123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Pierre Martin", "role": "teacher"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (parent1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'parent@smartekele.fr', crypt('Parent123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Anne Rousseau", "role": "parent"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (parent2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'parent2@smartekele.fr', crypt('Parent123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Michel Bernard", "role": "parent"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create schools
    INSERT INTO public.schools (id, name, code, address, phone, email, admin_id, status)
    VALUES
        (school1_uuid, 'École Primaire Sainte-Marie', 'EPM', '123 Rue de la République, Douala', '+237 6 12 34 56 78', 'contact@epm-douala.cm', school1_admin_uuid, 'active'),
        (school2_uuid, 'Collège Bilingue Excellence', 'CBE', '456 Avenue Kennedy, Yaoundé', '+237 6 23 45 67 89', 'info@cbe-yaounde.cm', school2_admin_uuid, 'active');

    -- Create classes
    INSERT INTO public.classes (id, school_id, name, level, section, capacity, teacher_id)
    VALUES
        (class1_uuid, school1_uuid, 'CM2 Section A', '6eme', 'A', 25, teacher1_uuid),
        (class2_uuid, school2_uuid, '3ème A', '3eme', 'A', 30, teacher1_uuid),
        (class3_uuid, school2_uuid, '2nde S', '2nde', 'S', 35, teacher2_uuid);

    -- Create students
    INSERT INTO public.students (id, student_id, school_id, full_name, date_of_birth, gender, parent_name, parent_phone, parent_email, address, status, enrollment_date)
    VALUES
        (student1_uuid, 'EPM001', school1_uuid, 'Sophie Martin', '2012-03-15', 'F', 'Marie Martin', '+237 6 12 34 56 78', 'marie.martin@email.com', '789 Quartier Bonapriso', 'active', '2024-09-01'),
        (student2_uuid, 'EPM002', school1_uuid, 'Lucas Dubois', '2012-07-22', 'M', 'Pierre Dubois', '+237 6 23 45 67 89', 'pierre.dubois@email.com', '321 New Bell', 'active', '2024-09-15'),
        (student3_uuid, 'CBE001', school2_uuid, 'Emma Rousseau', '2009-11-08', 'F', 'Julie Rousseau', '+237 6 34 56 78 90', 'julie.rousseau@email.com', '654 Bastos', 'active', '2024-09-10'),
        (student4_uuid, 'CBE002', school2_uuid, 'Thomas Bernard', '2008-05-30', 'M', 'Anne Bernard', '+237 6 45 67 89 01', 'anne.bernard@email.com', '987 Mvan', 'active', '2024-09-05');

    -- Create enrollments
    INSERT INTO public.enrollments (student_id, class_id, academic_year, enrollment_date)
    VALUES
        (student1_uuid, class1_uuid, '2024-2025', '2024-09-01'),
        (student2_uuid, class1_uuid, '2024-2025', '2024-09-15'),
        (student3_uuid, class2_uuid, '2024-2025', '2024-09-10'),
        (student4_uuid, class3_uuid, '2024-2025', '2024-09-05');

    -- Create monthly payments for each student (10 months)
    PERFORM public.create_monthly_payments(student1_uuid, '2024-09', 10, 15000.00);
    PERFORM public.create_monthly_payments(student2_uuid, '2024-09', 10, 15000.00);
    PERFORM public.create_monthly_payments(student3_uuid, '2024-09', 10, 25000.00);
    PERFORM public.create_monthly_payments(student4_uuid, '2024-09', 10, 30000.00);

    -- Update some payments as paid
    UPDATE public.payments 
    SET status = 'paid'::public.payment_status, 
        paid_date = '2024-09-05',
        payment_method = 'Mobile Money'
    WHERE student_id = student1_uuid AND month_year = '2024-09';

    UPDATE public.payments 
    SET status = 'partial'::public.payment_status, 
        paid_date = '2024-10-12',
        payment_method = 'Espèces'
    WHERE student_id = student3_uuid AND month_year = '2024-10';

    -- Create some attendance records
    INSERT INTO public.attendance (student_id, class_id, attendance_date, status, marked_by)
    VALUES
        (student1_uuid, class1_uuid, '2024-12-16', 'present', teacher1_uuid),
        (student2_uuid, class1_uuid, '2024-12-16', 'late', teacher1_uuid),
        (student3_uuid, class2_uuid, '2024-12-16', 'present', teacher1_uuid),
        (student4_uuid, class3_uuid, '2024-12-16', 'absent', teacher2_uuid),
        (student1_uuid, class1_uuid, '2024-12-15', 'present', teacher1_uuid),
        (student2_uuid, class1_uuid, '2024-12-15', 'present', teacher1_uuid),
        (student3_uuid, class2_uuid, '2024-12-15', 'present', teacher1_uuid),
        (student4_uuid, class3_uuid, '2024-12-15', 'present', teacher2_uuid);

    -- Create sample notifications
    INSERT INTO public.notifications (school_id, recipient_id, parent_phone, type, method, title, message, delivery_status)
    VALUES
        (school1_uuid, student1_uuid, '+237 6 12 34 56 78', 'payment', 'whatsapp', 'Rappel de paiement', 'Bonjour, le paiement mensuel de Sophie Martin pour Octobre 2024 est dû. Montant: 15,000 FCFA', 'delivered'),
        (school2_uuid, student4_uuid, '+237 6 45 67 89 01', 'attendance', 'whatsapp', 'Absence non justifiée', 'Votre enfant Thomas Bernard était absent aujourd''hui. Merci de nous contacter si nécessaire.', 'delivered'),
        (school1_uuid, student2_uuid, '+237 6 23 45 67 89', 'announcement', 'whatsapp', 'Réunion parents-professeurs', 'Réunion parents-professeurs le samedi 21 décembre à 9h. Votre présence est requise.', 'pending');
END $$;