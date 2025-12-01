import React, { FormEvent } from 'react';
import { StudentStatus } from '../types';
import { studentSchema, type StudentForm } from '../lib/validation';

interface StudentModalProps {
    isOpen: boolean;
    isEditing: boolean;
    isSubmitting: boolean;
    newStudentName: string;
    selectedClassId: string | '';
    enrollmentDate: string;
    selectedStatus: StudentStatus;
    studentPhoneNumber: string;
    parentPhoneNumber: string;
    parentAddress: string;
    formErrors: Partial<Record<keyof StudentForm, string>>;
    classes: Array<{ id: string; name: string }>;

    onNameChange: (value: string) => void;
    onClassChange: (value: string) => void;
    onEnrollmentDateChange: (value: string) => void;
    onStatusChange: (value: StudentStatus) => void;
    onStudentPhoneChange: (value: string) => void;
    onParentPhoneChange: (value: string) => void;
    onParentAddressChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
    onClose: () => void;
}

const StudentModal: React.FC<StudentModalProps> = ({
    isOpen,
    isEditing,
    isSubmitting,
    newStudentName,
    selectedClassId,
    enrollmentDate,
    selectedStatus,
    studentPhoneNumber,
    parentPhoneNumber,
    parentAddress,
    formErrors,
    classes,
    onNameChange,
    onClassChange,
    onEnrollmentDateChange,
    onStatusChange,
    onStudentPhoneChange,
    onParentPhoneChange,
    onParentAddressChange,
    onSubmit,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg m-4 transform transition-all animate-scale-in">
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-slate-700">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {isEditing ? "Modifier l'étudiant" : "Inscrire un nouvel étudiant"}
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
                        <i className="fas fa-times h-6 w-6"></i>
                    </button>
                </div>
                <form onSubmit={onSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom de l'étudiant</label>
                            <input
                              type="text"
                              id="studentName"
                              value={newStudentName}
                              onChange={(e) => onNameChange(e.target.value)}
                              aria-invalid={!!formErrors.name}
                              aria-describedby={formErrors.name ? 'studentName-error' : undefined}
                              required
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${formErrors.name ? 'border-red-500' : 'border-slate-300'}`}
                            />
                            {formErrors.name && <p id="studentName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="classId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classe</label>
                            <select
                              id="classId"
                              value={selectedClassId}
                              onChange={(e) => onClassChange(e.target.value)}
                              aria-invalid={!!formErrors.class_id}
                              aria-describedby={formErrors.class_id ? 'classId-error' : undefined}
                              required
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${formErrors.class_id ? 'border-red-500' : 'border-slate-300'}`}
                            >
                                <option value="" disabled>Choisir une classe</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                            {formErrors.class_id && <p id="classId-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.class_id}</p>}
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                            <select
                              id="status"
                              value={selectedStatus}
                              onChange={(e) => onStatusChange(e.target.value as StudentStatus)}
                              aria-invalid={!!formErrors.status}
                              aria-describedby={formErrors.status ? 'status-error' : undefined}
                              required
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${formErrors.status ? 'border-red-500' : 'border-slate-300'}`}
                            >
                                {Object.values(StudentStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            {formErrors.status && <p id="status-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.status}</p>}
                        </div>
                        <div>
                            <label htmlFor="studentPhoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone (Étudiant)</label>
                            <input
                              type="tel"
                              id="studentPhoneNumber"
                              value={studentPhoneNumber}
                              onChange={(e) => onStudentPhoneChange(e.target.value)}
                              aria-invalid={!!formErrors.phone_number}
                              aria-describedby={formErrors.phone_number ? 'studentPhone-error' : undefined}
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${formErrors.phone_number ? 'border-red-500' : 'border-slate-300'}`}
                            />
                            {formErrors.phone_number && <p id="studentPhone-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.phone_number}</p>}
                        </div>
                        <div>
                            <label htmlFor="parentPhoneNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Numéro du parent</label>
                            <input
                              type="tel"
                              id="parentPhoneNumber"
                              value={parentPhoneNumber}
                              onChange={(e) => onParentPhoneChange(e.target.value)}
                              aria-invalid={!!formErrors.parent_phone_number}
                              aria-describedby={formErrors.parent_phone_number ? 'parentPhone-error' : undefined}
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${formErrors.parent_phone_number ? 'border-red-500' : 'border-slate-300'}`}
                            />
                            {formErrors.parent_phone_number && <p id="parentPhone-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.parent_phone_number}</p>}
                        </div>
                        <div>
                            <label htmlFor="parentAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse du parent</label>
                            <input
                              type="text"
                              id="parentAddress"
                              value={parentAddress}
                              onChange={(e) => onParentAddressChange(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="enrollmentDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'inscription</label>
                            <input
                              type="date"
                              id="enrollmentDate"
                              value={enrollmentDate}
                              onChange={(e) => onEnrollmentDateChange(e.target.value)}
                              aria-invalid={!!formErrors.enrollment_date}
                              aria-describedby={formErrors.enrollment_date ? 'enrollment-error' : undefined}
                              required
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${formErrors.enrollment_date ? 'border-red-500' : 'border-slate-300'}`}
                            />
                            {formErrors.enrollment_date && <p id="enrollment-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.enrollment_date}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4 border-t pt-4 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-gray-800">Annuler</button>
                        <button type="submit" disabled={isSubmitting} className={`px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-colors shadow-md hover:shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isSubmitting ? 'Traitement...' : isEditing ? 'Sauvegarder' : 'Inscrire'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
