
import React, { useState, FormEvent, useMemo } from 'react';
import { MOCK_NOTIFICATIONS, MOCK_CLASSES, MOCK_STUDENTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Notification, Student } from '../types';

const NotificationCenter: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [messageType, setMessageType] = useState<'custom' | 'parent'>('custom');
    const [parentCommType, setParentCommType] = useState('absence');
    const [selectedClassId, setSelectedClassId] = useState<number | string | ''>(MOCK_CLASSES[0]?.id || '');
    const [selectedStudentIds, setSelectedStudentIds] = useState<(number | string)[]>([]);
    const [customTitle, setCustomTitle] = useState('');
    const [customContent, setCustomContent] = useState('');

    const studentsInSelectedClass = useMemo(() => {
        if (!selectedClassId) return [];
        return MOCK_STUDENTS.filter(s => s.classId === selectedClassId);
    }, [selectedClassId]);

    const handleStudentSelection = (studentId: number | string) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const resetForm = () => {
        setMessageType('custom');
        setParentCommType('absence');
        setSelectedClassId(MOCK_CLASSES[0]?.id || '');
        setSelectedStudentIds([]);
        setCustomTitle('');
        setCustomContent('');
    };

    const handleOpenModal = () => {
        resetForm();
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const senderName = user?.name || 'Utilisateur Anonyme';
        const currentDate = new Date().toISOString().split('T')[0];
        let newNotifications: Notification[] = [];

        if (messageType === 'custom') {
            if (!customTitle || !customContent) {
                alert('Veuillez remplir le titre et le contenu.');
                return;
            }
            newNotifications.push({
                id: Date.now(),
                title: customTitle,
                content: customContent,
                date: currentDate,
                read: false,
                sender: senderName,
                target: 'Général'
            });
        } else { // Parent communication
            if (selectedStudentIds.length === 0) {
                alert('Veuillez sélectionner au moins un étudiant.');
                return;
            }

            const getTemplate = (student: Student) => {
                const studentClass = MOCK_CLASSES.find(c => c.id === student.classId);
                const className = studentClass ? studentClass.name : 'Classe inconnue';
                const date = new Date().toLocaleDateString('fr-FR');
                const studentNameUpper = student.name.toUpperCase();
                const commonEnding = "Cordialement, Lycée Salama.";

                switch (parentCommType) {
                    case 'presence': 
                        return { 
                            title: `Présence: ${student.name}`, 
                            content: `Bonjour. Nous confirmons la présence de votre enfant ${studentNameUpper} (Classe: ${className}) en date du ${date}. ${commonEnding}` 
                        };
                    case 'retard': 
                        return { 
                            title: `Retard: ${student.name}`, 
                            content: `Bonjour. Nous vous informons que votre enfant ${studentNameUpper} (Classe: ${className}) est arrivé(e) en retard en date du ${date}. ${commonEnding}` 
                        };
                    case 'absence': 
                        return { 
                            title: `Absence: ${student.name}`, 
                            content: `Bonjour. Nous vous informons de l'absence de votre enfant ${studentNameUpper} (Classe: ${className}) en date du ${date}. ${commonEnding}` 
                        };
                    case 'renvoi': 
                        return { 
                            title: `Renvoi: ${student.name}`, 
                            content: `Bonjour. Pour des raisons disciplinaires, votre enfant ${studentNameUpper} (Classe: ${className}) a été renvoyé(e) de l'établissement pour la journée du ${date}. ${commonEnding}` 
                        };
                    default: 
                        return { title: '', content: '' };
                }
            };
            
            selectedStudentIds.forEach(studentId => {
                const student = MOCK_STUDENTS.find(s => s.id === studentId);
                if (student) {
                    const { title, content } = getTemplate(student);
                    newNotifications.push({
                        id: Date.now() + (typeof studentId === 'number' ? studentId : 0), // semi-unique id, handle string id simply
                        title,
                        content,
                        date: currentDate,
                        read: false,
                        sender: senderName,
                        target: `Parent de ${student.name}`
                    });
                }
            });
        }
        
        setNotifications(prev => [...newNotifications, ...prev]);
        handleCloseModal();
    };

    const NotificationModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl m-4 transform transition-all">
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-slate-700">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Nouveau Message</h3>
                    <button onClick={handleCloseModal} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
                        <i className="fas fa-times h-6 w-6"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2 space-y-3 sm:space-y-4">
                    <div>
                        <label htmlFor="messageType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type de Message</label>
                        <select id="messageType" value={messageType} onChange={e => setMessageType(e.target.value as 'custom' | 'parent')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="custom">Message Personnalisé</option>
                            <option value="parent">Communication aux Parents</option>
                        </select>
                    </div>

                    {messageType === 'custom' ? (
                        <>
                            <div>
                                <label htmlFor="customTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre</label>
                                <input type="text" id="customTitle" value={customTitle} onChange={e => setCustomTitle(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label htmlFor="customContent" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contenu</label>
                                <textarea id="customContent" value={customContent} onChange={e => setCustomContent(e.target.value)} required rows={5} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="parentCommType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motif de la Communication</label>
                                <select id="parentCommType" value={parentCommType} onChange={e => setParentCommType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="absence">Absence</option>
                                    <option value="retard">Retard</option>
                                    <option value="presence">Présence</option>
                                    <option value="renvoi">Renvoi</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="classId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classe</label>
                                <select id="classId" value={selectedClassId} onChange={e => setSelectedClassId(Number(e.target.value))} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="" disabled>Sélectionner une classe</option>
                                    {MOCK_CLASSES.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                                </select>
                            </div>
                            {selectedClassId && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Élèves Concernés</label>
                                    <div className="max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md p-2 space-y-2">
                                        {studentsInSelectedClass.length > 0 ? studentsInSelectedClass.map(student => (
                                            <div key={student.id} className="flex items-center">
                                                <input type="checkbox" id={`student-${student.id}`} checked={selectedStudentIds.includes(student.id)} onChange={() => handleStudentSelection(student.id)} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                                                <label htmlFor={`student-${student.id}`} className="ml-2 block text-sm text-slate-900 dark:text-slate-200">{student.name}</label>
                                            </div>
                                        )) : <p className="text-sm text-slate-500">Aucun élève dans cette classe.</p>}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                        <i className="fas fa-info-circle mr-1"></i>Le message sera envoyé au numéro de téléphone du parent de chaque enfant sélectionné.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                    <div className="mt-6 flex justify-end space-x-4 border-t pt-4 dark:border-slate-700">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-gray-800">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-colors shadow-md hover:shadow-lg">
                           <i className="fas fa-paper-plane mr-2"></i> Envoyer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Centre de Notifications</h1>
                <button onClick={handleOpenModal} className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-brand-secondary transition-colors flex items-center">
                    <i className="fas fa-plus mr-2"></i> Nouveau Message
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div key={notification.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-4 ${notification.read ? 'border-slate-300 dark:border-slate-600' : 'border-brand-primary'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{notification.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                        <i className="far fa-clock mr-1"></i> {notification.date} • De: {notification.sender} • Pour: {notification.target}
                                    </p>
                                    <p className="text-slate-700 dark:text-slate-300">{notification.content}</p>
                                </div>
                                {!notification.read && (
                                    <span className="bg-brand-primary text-white text-xs px-2 py-1 rounded-full">Nouveau</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-500 dark:text-slate-400">Aucune notification.</p>
                    </div>
                )}
            </div>

            {isModalOpen && <NotificationModal />}
        </div>
    );
};

export default NotificationCenter;
