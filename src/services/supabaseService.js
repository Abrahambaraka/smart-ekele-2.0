import { supabase } from '../lib/supabase';

// Generic CRUD operations with optional chaining
export const supabaseService = {
  // Create operation
  create: async (table, data) => {
    try {
      const { data: result, error } = await supabase
        ?.from(table)
        ?.insert(data)
        ?.select()
        ?.single();
      
      return { data: result, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to create record' } };
    }
  },

  // Read operations
  getAll: async (table, options = {}) => {
    try {
      let query = supabase?.from(table)?.select(options?.select || '*');
      
      if (options?.where) {
        Object.entries(options?.where)?.forEach(([key, value]) => {
          query = query?.eq(key, value);
        });
      }
      
      if (options?.orderBy) {
        query = query?.order(options?.orderBy?.column, { 
          ascending: options?.orderBy?.ascending ?? true 
        });
      }
      
      if (options?.limit) {
        query = query?.limit(options?.limit);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch records' } };
    }
  },

  getById: async (table, id) => {
    try {
      const { data, error } = await supabase
        ?.from(table)
        ?.select('*')
        ?.eq('id', id)
        ?.single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch record' } };
    }
  },

  // Update operation
  update: async (table, id, updates) => {
    try {
      const { data, error } = await supabase
        ?.from(table)
        ?.update({ ...updates, updated_at: new Date()?.toISOString() })
        ?.eq('id', id)
        ?.select()
        ?.single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to update record' } };
    }
  },

  // Delete operation
  delete: async (table, id) => {
    try {
      const { data, error } = await supabase
        ?.from(table)
        ?.delete()
        ?.eq('id', id);
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to delete record' } };
    }
  }
};

// School management functions (for Super Admin)
export const getAllSchools = async () => {
  const { data, error } = await supabase?.from('schools')?.select(`
      *,
      admin:user_profiles!schools_admin_id_fkey(full_name, email, phone)
    `)?.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erreur lors du chargement des écoles: ${error.message}`);
  }
  return data;
};

export const createSchool = async (schoolData) => {
  // First, create a user profile for the school admin
  const { data: authData, error: authError } = await supabase?.auth?.signUp({
    email: schoolData?.email,
    password: generateTemporaryPassword(),
    options: {
      data: {
        full_name: `Admin ${schoolData?.name}`,
        role: 'school_admin'
      }
    }
  });

  if (authError) {
    throw new Error(`Erreur lors de la création du compte: ${authError.message}`);
  }

  // Create the school record
  const { data, error } = await supabase?.from('schools')?.insert({
      name: schoolData?.name,
      code: schoolData?.code,
      email: schoolData?.email,
      phone: schoolData?.phone,
      address: schoolData?.address,
      status: schoolData?.status || 'active',
      academic_year: schoolData?.academic_year || '2024-2025',
      admin_id: authData?.user?.id
    })?.select()?.single();

  if (error) {
    // If school creation fails, we should clean up the auth user
    await supabase?.auth?.admin?.deleteUser(authData?.user?.id);
    throw new Error(`Erreur lors de la création de l'école: ${error.message}`);
  }

  return data;
};

export const updateSchool = async (schoolId, updates) => {
  const { data, error } = await supabase?.from('schools')?.update(updates)?.eq('id', schoolId)?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de la mise à jour de l'école: ${error.message}`);
  }
  return data;
};

export const deleteSchool = async (schoolId) => {
  // First get the school to find the admin_id
  const { data: school, error: fetchError } = await supabase?.from('schools')?.select('admin_id')?.eq('id', schoolId)?.single();

  if (fetchError) {
    throw new Error(`Erreur lors de la récupération de l'école: ${fetchError.message}`);
  }

  // Delete the school (this will cascade delete related records due to RLS policies)
  const { error: deleteError } = await supabase?.from('schools')?.delete()?.eq('id', schoolId);

  if (deleteError) {
    throw new Error(`Erreur lors de la suppression de l'école: ${deleteError.message}`);
  }

  // Delete the associated admin user
  if (school?.admin_id) {
    await supabase?.auth?.admin?.deleteUser(school?.admin_id);
  }

  return true;
};

// Student management functions
export const getStudentsBySchool = async (schoolId) => {
  const { data, error } = await supabase?.from('students')?.select(`
      *,
      enrollments (
        classes (
          name,
          level,
          section
        )
      )
    `)?.eq('school_id', schoolId)?.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erreur lors du chargement des étudiants: ${error.message}`);
  }
  return data;
};

export const createStudent = async (studentData) => {
  const { data, error } = await supabase?.from('students')?.insert(studentData)?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de la création de l'étudiant: ${error.message}`);
  }
  return data;
};

export const updateStudent = async (studentId, updates) => {
  const { data, error } = await supabase?.from('students')?.update(updates)?.eq('id', studentId)?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de la mise à jour de l'étudiant: ${error.message}`);
  }
  return data;
};

export const deleteStudent = async (studentId) => {
  const { error } = await supabase?.from('students')?.delete()?.eq('id', studentId);

  if (error) {
    throw new Error(`Erreur lors de la suppression de l'étudiant: ${error.message}`);
  }
  return true;
};

// Class management functions
export const getClassesBySchool = async (schoolId) => {
  const { data, error } = await supabase?.from('classes')?.select(`
      *,
      teacher:user_profiles!classes_teacher_id_fkey(full_name, email),
      enrollments (
        students (
          full_name,
          student_id
        )
      )
    `)?.eq('school_id', schoolId)?.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erreur lors du chargement des classes: ${error.message}`);
  }
  return data;
};

export const createClass = async (classData) => {
  const { data, error } = await supabase?.from('classes')?.insert(classData)?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de la création de la classe: ${error.message}`);
  }
  return data;
};

export const updateClass = async (classId, updates) => {
  const { data, error } = await supabase?.from('classes')?.update(updates)?.eq('id', classId)?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de la mise à jour de la classe: ${error.message}`);
  }
  return data;
};

export const deleteClass = async (classId) => {
  const { error } = await supabase?.from('classes')?.delete()?.eq('id', classId);

  if (error) {
    throw new Error(`Erreur lors de la suppression de la classe: ${error.message}`);
  }
  return true;
};

// Enrollment functions
export const enrollStudent = async (studentId, classId) => {
  const { data, error } = await supabase?.from('enrollments')?.insert({
      student_id: studentId,
      class_id: classId
    })?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de l'inscription: ${error.message}`);
  }
  return data;
};

export const unenrollStudent = async (studentId, classId) => {
  const { error } = await supabase?.from('enrollments')?.delete()?.eq('student_id', studentId)?.eq('class_id', classId);

  if (error) {
    throw new Error(`Erreur lors de la désinscription: ${error.message}`);
  }
  return true;
};

// Payment management functions
export const getPaymentsBySchool = async (schoolId) => {
  const { data, error } = await supabase?.from('payments')?.select(`
      *,
      student:students!payments_student_id_fkey(full_name, student_id, parent_name, parent_phone)
    `)?.eq('school_id', schoolId)?.order('due_date', { ascending: false });

  if (error) {
    throw new Error(`Erreur lors du chargement des paiements: ${error.message}`);
  }
  return data;
};

export const createPayment = async (paymentData) => {
  const { data, error } = await supabase?.from('payments')?.insert(paymentData)?.select(`
      *,
      student:students!payments_student_id_fkey(full_name, student_id, parent_name, parent_phone)
    `)?.single();

  if (error) {
    throw new Error(`Erreur lors de la création du paiement: ${error.message}`);
  }
  return data;
};

export const recordCashPayment = async (paymentData) => {
  // Specific function for cash payments with additional validations
  const cashPaymentData = {
    ...paymentData,
    payment_method: 'cash',
    status: 'paid',
    paid_date: paymentData?.paid_date || new Date()?.toISOString()?.split('T')?.[0]
  };

  const { data, error } = await supabase?.from('payments')?.insert(cashPaymentData)?.select(`
      *,
      student:students!payments_student_id_fkey(full_name, student_id, parent_name, parent_phone)
    `)?.single();

  if (error) {
    throw new Error(`Erreur lors de l'enregistrement du paiement espèces: ${error.message}`);
  }
  return data;
};

export const getCashPaymentsSummary = async (schoolId) => {
  const { data, error } = await supabase?.from('payments')?.select(`
      amount,
      status,
      payment_method,
      paid_date,
      student:students!payments_student_id_fkey(full_name, student_id)
    `)?.eq('school_id', schoolId)?.eq('payment_method', 'cash')?.order('paid_date', { ascending: false });

  if (error) {
    throw new Error(`Erreur lors du chargement des paiements espèces: ${error.message}`);
  }
  return data;
};

export const generateCashReport = async (schoolId, startDate, endDate) => {
  let query = supabase?.from('payments')?.select(`
      *,
      student:students!payments_student_id_fkey(full_name, student_id, parent_name, parent_phone)
    `)?.eq('school_id', schoolId)?.eq('payment_method', 'cash');

  if (startDate) {
    query = query?.gte('paid_date', startDate);
  }
  if (endDate) {
    query = query?.lte('paid_date', endDate);
  }

  const { data, error } = await query?.order('paid_date', { ascending: false });

  if (error) {
    throw new Error(`Erreur lors de la génération du rapport espèces: ${error.message}`);
  }
  return data;
};

export const updatePayment = async (paymentId, updates) => {
  const { data, error } = await supabase?.from('payments')?.update(updates)?.eq('id', paymentId)?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de la mise à jour du paiement: ${error.message}`);
  }
  return data;
};

// Attendance management functions
export const getAttendanceByClass = async (classId, date) => {
  const { data, error } = await supabase?.from('attendance')?.select(`
      *,
      student:students(full_name, student_id),
      marked_by_user:user_profiles!attendance_marked_by_fkey(full_name)
    `)?.eq('class_id', classId)?.eq('attendance_date', date)?.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erreur lors du chargement des présences: ${error.message}`);
  }
  return data;
};

export const markAttendance = async (attendanceData) => {
  const { data, error } = await supabase?.from('attendance')?.upsert(attendanceData, { 
      onConflict: 'student_id,class_id,attendance_date' 
    })?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de la prise de présence: ${error.message}`);
  }
  return data;
};

// WhatsApp notification functions
export const sendWhatsAppNotification = async (notificationData) => {
  try {
    // Create notification record in database
    const { data: notification, error: dbError } = await supabase?.from('notifications')?.insert({
        type: notificationData?.type,
        title: notificationData?.title,
        message: notificationData?.message,
        method: 'whatsapp',
        parent_phone: notificationData?.parentPhone,
        recipient_id: notificationData?.studentId,
        school_id: notificationData?.schoolId,
        delivery_status: 'pending'
      })?.select()?.single();

    if (dbError) {
      throw new Error(`Erreur lors de la sauvegarde de la notification: ${dbError.message}`);
    }

    // Send WhatsApp message via Twilio Edge Function
    const { data: smsResult, error: smsError } = await supabase?.functions?.invoke('send-whatsapp', {
      body: {
        to: `whatsapp:${notificationData?.parentPhone}`,
        message: `${notificationData?.title}\n\n${notificationData?.message}`
      }
    });

    if (smsError) {
      // Update notification status to failed
      await supabase?.from('notifications')?.update({ 
          delivery_status: 'failed',
          error_message: smsError?.message,
          sent_at: new Date()?.toISOString()
        })?.eq('id', notification?.id);
      
      throw new Error(`Erreur lors de l'envoi WhatsApp: ${smsError.message}`);
    }

    // Update notification status to sent
    await supabase?.from('notifications')?.update({ 
        delivery_status: 'sent',
        sent_at: new Date()?.toISOString()
      })?.eq('id', notification?.id);

    return { success: true, notificationId: notification?.id };
  } catch (error) {
    throw new Error(`Erreur lors de l'envoi de la notification: ${error.message}`);
  }
};

// Bulk notification functions
export const sendBulkWhatsAppNotifications = async (notifications) => {
  const results = [];
  
  for (const notification of notifications) {
    try {
      const result = await sendWhatsAppNotification(notification);
      results?.push({ ...result, parentPhone: notification?.parentPhone });
    } catch (error) {
      results?.push({ 
        success: false, 
        error: error?.message,
        parentPhone: notification?.parentPhone 
      });
    }
  }
  
  return results;
};

// Teacher notification templates
export const createAttendanceNotification = (student, attendanceStatus, className) => {
  const statusMessages = {
    absent: `Votre enfant ${student?.full_name} était absent aujourd'hui en classe ${className}.`,
    late: `Votre enfant ${student?.full_name} est arrivé en retard aujourd'hui en classe ${className}.`,
    excused: `L'absence de votre enfant ${student?.full_name} a été justifiée pour la classe ${className}.`
  };

  return {
    type: 'attendance',
    title: `Présence - ${student?.full_name}`,
    message: statusMessages?.[attendanceStatus] || statusMessages?.absent,
    parentPhone: student?.parent_phone,
    studentId: student?.id,
    schoolId: student?.school_id
  };
};

export const createBehaviorNotification = (student, behaviorType, description, className) => {
  const behaviorMessages = {
    inappropriate: `Comportement inapproprié signalé pour ${student?.full_name} en classe ${className}. ${description}`,
    excellent: `Excellent comportement de ${student?.full_name} en classe ${className}. ${description}`,
    warning: `Avertissement pour ${student?.full_name} en classe ${className}. ${description}`
  };

  return {
    type: 'announcement',
    title: `Comportement - ${student?.full_name}`,
    message: behaviorMessages?.[behaviorType] || `Rapport de comportement pour ${student?.full_name}: ${description}`,
    parentPhone: student?.parent_phone,
    studentId: student?.id,
    schoolId: student?.school_id
  };
};

export const createPaymentNotification = (student, paymentAmount, dueDate) => {
  return {
    type: 'payment',
    title: `Rappel de paiement - ${student?.full_name}`,
    message: `Le paiement mensuel de ${paymentAmount} FCFA pour ${student?.full_name} est dû le ${new Date(dueDate)?.toLocaleDateString('fr-FR')}. Merci de régulariser votre situation.`,
    parentPhone: student?.parent_phone,
    studentId: student?.id,
    schoolId: student?.school_id
  };
};

// Utility functions
export const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars?.charAt(Math.floor(Math.random() * chars?.length));
  }
  return password;
};

export const resetUserPassword = async (email) => {
  const { error } = await supabase?.auth?.resetPasswordForEmail(email, {
    redirectTo: `${window.location?.origin}/reset-password`
  });

  if (error) {
    throw new Error(`Erreur lors de la réinitialisation du mot de passe: ${error.message}`);
  }
  return true;
};

// User profile functions
export const getUsersBySchool = async (schoolId) => {
  try {
    // Get users (teachers and school admins) for the specific school
    const { data: users, error: usersError } = await supabase
      ?.from('user_profiles')
      ?.select('*')
      ?.eq('school_id', schoolId)
      ?.in('role', ['teacher', 'school_admin'])
      ?.order('created_at', { ascending: false });

    if (usersError) {
      throw new Error(`Erreur lors du chargement des utilisateurs: ${usersError.message}`);
    }

    // Also get students for the school
    const students = await getStudentsBySchool(schoolId);
    
    // Transform students to match user format
    const studentUsers = students?.map(student => ({
      id: student?.id,
      name: student?.full_name,
      email: student?.parent_email,
      phone: student?.parent_phone,
      role: 'student',
      status: student?.status,
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`,
      lastLogin: null,
      associatedData: student?.enrollments?.map(e => `${e?.classes?.name}`)?.join(', ') || 'Aucune classe',
      createdAt: student?.created_at?.split('T')?.[0],
      studentId: student?.student_id,
      parentName: student?.parent_name,
      parentPhone: student?.parent_phone,
      parentEmail: student?.parent_email,
      dateOfBirth: student?.date_of_birth,
      gender: student?.gender,
      address: student?.address
    }));

    // Transform regular users
    const regularUsers = users?.map(user => ({
      id: user?.id,
      name: user?.full_name,
      email: user?.email,
      phone: user?.phone,
      role: user?.role,
      status: user?.is_active ? 'active' : 'inactive',
      avatar: user?.role === 'teacher' 
        ? `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`
        : `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`,
      lastLogin: null,
      associatedData: user?.role === 'teacher' ? 'Classes assignées' : 'Administration',
      createdAt: user?.created_at?.split('T')?.[0]
    }));

    return [...regularUsers || [], ...studentUsers || []];
  } catch (error) {
    console.error('Error in getUsersBySchool:', error);
    throw new Error(`Erreur lors du chargement des utilisateurs: ${error.message}`);
  }
};

export const createTeacher = async (teacherData) => {
  // Create auth user first
  const { data: authData, error: authError } = await supabase?.auth?.signUp({
    email: teacherData?.email,
    password: generateTemporaryPassword(),
    options: {
      data: {
        full_name: teacherData?.full_name,
        role: 'teacher'
      }
    }
  });

  if (authError) {
    throw new Error(`Erreur lors de la création du compte: ${authError.message}`);
  }

  return authData?.user;
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', userId)?.select()?.single();

  if (error) {
    throw new Error(`Erreur lors de la mise à jour du profil: ${error.message}`);
  }
  return data;
};

export const deleteUser = async (userId) => {
  const { error } = await supabase?.auth?.admin?.deleteUser(userId);
  if (error) {
    throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
  }
  return true;
};

export const schoolService = {
  getAllSchools: async () => {
    return supabaseService?.getAll('schools', {
      select: `
        *,
        admin:user_profiles!schools_admin_id_fkey(full_name, email, phone)
      `,
      orderBy: { column: 'created_at', ascending: false }
    });
  },

  getSchoolById: async (schoolId) => {
    try {
      const { data, error } = await supabase
        ?.from('schools')
        ?.select(`
          *,
          admin:user_profiles!schools_admin_id_fkey(full_name, email, phone),
          classes(id, name, level, section, capacity),
          students(id, full_name, status)
        `)
        ?.eq('id', schoolId)
        ?.single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch school details' } };
    }
  },

  createSchool: async (schoolData) => {
    return supabaseService?.create('schools', schoolData);
  },

  updateSchool: async (schoolId, updates) => {
    return supabaseService?.update('schools', schoolId, updates);
  },

  deleteSchool: async (schoolId) => {
    return supabaseService?.delete('schools', schoolId);
  }
};

export const studentService = {
  getAllStudents: async (schoolId = null) => {
    const options = {
      select: `
        *,
        school:schools(name, code),
        enrollments(
          id,
          academic_year,
          class:classes(id, name, level, section)
        )
      `,
      orderBy: { column: 'created_at', ascending: false }
    };

    if (schoolId) {
      options.where = { school_id: schoolId };
    }

    return supabaseService?.getAll('students', options);
  },

  getStudentById: async (studentId) => {
    try {
      const { data, error } = await supabase
        ?.from('students')
        ?.select(`
          *,
          school:schools(name, code, phone, email),
          enrollments(
            id,
            academic_year,
            class:classes(id, name, level, section, capacity)
          ),
          payments(
            id,
            amount,
            month_year,
            due_date,
            paid_date,
            status,
            payment_method
          ),
          attendance(
            id,
            attendance_date,
            status,
            notes,
            class:classes(name)
          )
        `)
        ?.eq('id', studentId)
        ?.single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch student details' } };
    }
  },

  createStudent: async (studentData) => {
    return supabaseService?.create('students', studentData);
  },

  updateStudent: async (studentId, updates) => {
    return supabaseService?.update('students', studentId, updates);
  },

  deleteStudent: async (studentId) => {
    return supabaseService?.delete('students', studentId);
  }
};

export const classService = {
  getAllClasses: async (schoolId = null) => {
    const options = {
      select: `
        *,
        school:schools(name, code),
        teacher:user_profiles(full_name, email),
        enrollments(id, student:students(id, full_name, status))
      `,
      orderBy: { column: 'level', ascending: true }
    };

    if (schoolId) {
      options.where = { school_id: schoolId };
    }

    return supabaseService?.getAll('classes', options);
  },

  getClassById: async (classId) => {
    try {
      const { data, error } = await supabase
        ?.from('classes')
        ?.select(`
          *,
          school:schools(name, code),
          teacher:user_profiles(full_name, email, phone),
          enrollments(
            id,
            student:students(id, full_name, parent_name, parent_phone, status)
          )
        `)
        ?.eq('id', classId)
        ?.single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch class details' } };
    }
  },

  createClass: async (classData) => {
    return supabaseService?.create('classes', classData);
  },

  updateClass: async (classId, updates) => {
    return supabaseService?.update('classes', classId, updates);
  },

  deleteClass: async (classId) => {
    return supabaseService?.delete('classes', classId);
  }
};

export const paymentService = {
  getAllPayments: async (schoolId = null, studentId = null) => {
    const options = {
      select: `
        *,
        student:students(full_name, student_id, parent_name, parent_phone),
        school:schools(name, code)
      `,
      orderBy: { column: 'due_date', ascending: false }
    };

    const where = {};
    if (schoolId) where.school_id = schoolId;
    if (studentId) where.student_id = studentId;
    
    if (Object.keys(where)?.length > 0) {
      options.where = where;
    }

    return supabaseService?.getAll('payments', options);
  },

  getOverduePayments: async (schoolId = null) => {
    try {
      let query = supabase
        ?.from('payments')
        ?.select(`
          *,
          student:students(full_name, student_id, parent_name, parent_phone),
          school:schools(name, code)
        `)
        ?.eq('status', 'overdue')
        ?.order('due_date', { ascending: true });

      if (schoolId) {
        query = query?.eq('school_id', schoolId);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch overdue payments' } };
    }
  },

  updatePaymentStatus: async (paymentId, status, paymentMethod = null) => {
    const updates = { 
      status,
      payment_method: paymentMethod 
    };

    if (status === 'paid') {
      updates.paid_date = new Date()?.toISOString()?.split('T')?.[0];
    }

    return supabaseService?.update('payments', paymentId, updates);
  }
};

export const attendanceService = {
  getAttendanceByDate: async (classId, date) => {
    try {
      const { data, error } = await supabase
        ?.from('attendance')
        ?.select(`
          *,
          student:students(id, full_name, student_id),
          class:classes(name, level, section)
        `)
        ?.eq('class_id', classId)
        ?.eq('attendance_date', date)
        ?.order('student(full_name)', { ascending: true });
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch attendance' } };
    }
  },

  markAttendance: async (attendanceRecords) => {
    try {
      const { data, error } = await supabase
        ?.from('attendance')
        ?.upsert(attendanceRecords, { 
          onConflict: 'student_id,class_id,attendance_date' 
        })
        ?.select();
      
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to mark attendance' } };
    }
  },

  getStudentAttendance: async (studentId, startDate = null, endDate = null) => {
    try {
      let query = supabase
        ?.from('attendance')
        ?.select(`
          *,
          class:classes(name, level, section)
        `)
        ?.eq('student_id', studentId)
        ?.order('attendance_date', { ascending: false });

      if (startDate) query = query?.gte('attendance_date', startDate);
      if (endDate) query = query?.lte('attendance_date', endDate);

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Failed to fetch student attendance' } };
    }
  }
};

export const notificationService = {
  getAllNotifications: async (schoolId = null) => {
    const options = {
      select: `
        *,
        school:schools(name, code),
        recipient:students(full_name, student_id, parent_name)
      `,
      orderBy: { column: 'created_at', ascending: false }
    };

    if (schoolId) {
      options.where = { school_id: schoolId };
    }

    return supabaseService?.getAll('notifications', options);
  },

  sendNotification: async (notificationData) => {
    // For now, just create the notification record
    // In a real implementation, this would integrate with WhatsApp Business API
    return supabaseService?.create('notifications', {
      ...notificationData,
      delivery_status: 'pending'
    });
  },

  updateDeliveryStatus: async (notificationId, status, errorMessage = null) => {
    const updates = { 
      delivery_status: status,
      sent_at: status === 'delivered' ? new Date()?.toISOString() : null
    };

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    return supabaseService?.update('notifications', notificationId, updates);
  }
};