
import React, { useEffect, useMemo, useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Notification } from '../types';
import { useSchoolSettings } from '../lib/useSchoolSettings';
import NotificationModal from '../components/NotificationModal';
import { db } from '../lib/firebase';
import { addDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

const NotificationCenter: React.FC = () => {
    const { user } = useAuth();
    const { settings } = useSchoolSettings(user?.schoolId);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [messageType, setMessageType] = useState<'custom' | 'parent'>('custom');
    const [parentCommType, setParentCommType] = useState('absence');
    const [selectedClassId, setSelectedClassId] = useState<number | string | ''>('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<(number | string)[]>([]);
    const [customTitle, setCustomTitle] = useState('');
    const [customContent, setCustomContent] = useState('');

    // Firestore-backed data
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const [students, setStudents] = useState<{ id: string; name: string; class_id?: string }[]>([]);

    // Load classes, students, and subscribe to notifications
    useEffect(() => {
        if (!user?.schoolId) return;

        const qClasses = query(collection(db, 'classes'), where('school_id', '==', user.schoolId));
        getDocs(qClasses).then((snap) => {
            setClasses(snap.docs.map(d => ({ id: d.id, name: (d.data() as any).name || 'Sans nom' })));
        }).catch(() => {/* noop */});

        const qStudents = query(collection(db, 'students'), where('school_id', '==', user.schoolId));
        getDocs(qStudents).then((snap) => {
            setStudents(snap.docs.map(d => ({ id: d.id, name: (d.data() as any).name || 'N/A', class_id: (d.data() as any).class_id })));
        }).catch(() => {/* noop */});

        const qNotifs = query(collection(db, 'notifications'), where('school_id', '==', user.schoolId));
        const unsub = onSnapshot(qNotifs, (snap) => {
            const list: Notification[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            // Optional: sort by date desc if ISO
            list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            setNotifications(list);
        });
        return () => unsub();
    }, [user?.schoolId]);

    const studentsInSelectedClass = useMemo(() => {
        if (!selectedClassId) return [] as { id: string; name: string }[];
        return students.filter(s => s.class_id === selectedClassId).map(s => ({ id: s.id, name: s.name }));
    }, [selectedClassId, students]);

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
        setSelectedClassId(classes[0]?.id || '');
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const senderName = user?.name || 'Utilisateur Anonyme';
        const currentDate = new Date().toISOString().split('T')[0];
        let newNotifications: Notification[] = [];

        if (messageType === 'custom') {
            if (!customTitle || !customContent) {
                alert('Veuillez remplir le titre et le contenu.');
                return;
            }
            const payload = {
                title: customTitle,
                content: customContent,
                date: currentDate,
                read: false,
                sender: senderName,
                target: 'Général',
                school_id: user?.schoolId || null,
            };
            const docRef = await addDoc(collection(db, 'notifications'), payload);
            newNotifications.push({ id: docRef.id, ...(payload as any) });
        } else { // Parent communication
            if (selectedStudentIds.length === 0) {
                alert('Veuillez sélectionner au moins un étudiant.');
                return;
            }

            const getTemplate = (student: { id: string | number; name: string; class_id?: string | number }) => {
                const studentClass = classes.find(c => c.id === student.class_id);
                const className = studentClass ? studentClass.name : 'Classe inconnue';
                const date = new Date().toLocaleDateString('fr-FR');
                const studentNameUpper = student.name.toUpperCase();
                const schoolName = settings?.display_name || 'Votre établissement';
                const commonEnding = `Cordialement, ${schoolName}.`;

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
            
            for (const studentId of selectedStudentIds) {
                const student = students.find(s => s.id === String(studentId));
                if (student) {
                    const { title, content } = getTemplate(student);
                    const payload = {
                        title,
                        content,
                        date: currentDate,
                        read: false,
                        sender: senderName,
                        target: `Parent de ${student.name}`,
                        school_id: user?.schoolId || null,
                        class_id: student.class_id || null,
                        student_id: student.id,
                    };
                    const docRef = await addDoc(collection(db, 'notifications'), payload);
                    newNotifications.push({ id: docRef.id, ...(payload as any) });
                }
            }
        }
        
        setNotifications(prev => [...newNotifications, ...prev]);
        handleCloseModal();
    };

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

            {isModalOpen && (
                <NotificationModal
                    isOpen={isModalOpen}
                    messageType={messageType}
                    customTitle={customTitle}
                    customContent={customContent}
                    parentCommType={parentCommType}
                    selectedClassId={selectedClassId}
                    selectedStudentIds={selectedStudentIds}
                    classes={classes as any}
                    studentsInSelectedClass={studentsInSelectedClass}
                    onMessageTypeChange={setMessageType}
                    onCustomTitleChange={setCustomTitle}
                    onCustomContentChange={setCustomContent}
                    onParentCommTypeChange={setParentCommType}
                    onClassIdChange={setSelectedClassId}
                    onStudentSelectionChange={handleStudentSelection}
                    onSubmit={handleSubmit}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default NotificationCenter;
