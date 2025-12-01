import React, { FormEvent } from 'react';

interface Class {
    id: number | string;
    name: string;
}

interface Student {
    id: number | string;
    name: string;
}

interface NotificationModalProps {
    isOpen: boolean;
    messageType: 'custom' | 'parent';
    customTitle: string;
    customContent: string;
    parentCommType: string;
    selectedClassId: number | string | '';
    selectedStudentIds: (number | string)[];
    classes: Class[];
    studentsInSelectedClass: Student[];

    onMessageTypeChange: (value: 'custom' | 'parent') => void;
    onCustomTitleChange: (value: string) => void;
    onCustomContentChange: (value: string) => void;
    onParentCommTypeChange: (value: string) => void;
    onClassIdChange: (value: number | string) => void;
    onStudentSelectionChange: (studentId: number | string) => void;
    onSubmit: (e: FormEvent) => void;
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    messageType,
    customTitle,
    customContent,
    parentCommType,
    selectedClassId,
    selectedStudentIds,
    classes,
    studentsInSelectedClass,
    onMessageTypeChange,
    onCustomTitleChange,
    onCustomContentChange,
    onParentCommTypeChange,
    onClassIdChange,
    onStudentSelectionChange,
    onSubmit,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl m-4 transform transition-all">
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-slate-700">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Nouveau Message</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
                        <i className="fas fa-times h-6 w-6"></i>
                    </button>
                </div>
                <form onSubmit={onSubmit} className="max-h-[70vh] overflow-y-auto pr-2 space-y-3 sm:space-y-4">
                    <div>
                        <label htmlFor="messageType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type de Message</label>
                        <select
                            id="messageType"
                            value={messageType}
                            onChange={e => onMessageTypeChange(e.target.value as 'custom' | 'parent')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="custom">Message Personnalisé</option>
                            <option value="parent">Communication aux Parents</option>
                        </select>
                    </div>

                    {messageType === 'custom' ? (
                        <>
                            <div>
                                <label htmlFor="customTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre</label>
                                <input
                                    type="text"
                                    id="customTitle"
                                    value={customTitle}
                                    onChange={e => onCustomTitleChange(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="customContent" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contenu</label>
                                <textarea
                                    id="customContent"
                                    value={customContent}
                                    onChange={e => onCustomContentChange(e.target.value)}
                                    required
                                    rows={5}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="parentCommType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motif de la Communication</label>
                                <select
                                    id="parentCommType"
                                    value={parentCommType}
                                    onChange={e => onParentCommTypeChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="absence">Absence</option>
                                    <option value="retard">Retard</option>
                                    <option value="presence">Présence</option>
                                    <option value="renvoi">Renvoi</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="classId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classe</label>
                                <select
                                    id="classId"
                                    value={selectedClassId}
                                    onChange={e => onClassIdChange(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="" disabled>Sélectionner une classe</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedClassId && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Élèves Concernés</label>
                                    <div className="max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md p-2 space-y-2">
                                        {studentsInSelectedClass.length > 0 ? studentsInSelectedClass.map(student => (
                                            <div key={student.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`student-${student.id}`}
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onChange={() => onStudentSelectionChange(student.id)}
                                                    className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                                />
                                                <label htmlFor={`student-${student.id}`} className="ml-2 block text-sm text-slate-900 dark:text-slate-200">{student.name}</label>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-slate-500">Aucun élève dans cette classe.</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                        <i className="fas fa-info-circle mr-1"></i>Le message sera envoyé au numéro de téléphone du parent de chaque enfant sélectionné.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                    <div className="mt-6 flex justify-end space-x-4 border-t pt-4 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-gray-800">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800">Envoyer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NotificationModal;
