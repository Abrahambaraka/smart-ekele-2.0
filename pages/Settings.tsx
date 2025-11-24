
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import ToggleSwitch from '../components/ToggleSwitch';
import { db } from '../lib/firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { MOCK_CLASSES, MOCK_STUDENTS, MOCK_PAYMENTS } from '../constants';
import { ClassLevel, StudentStatus, PaymentStatus } from '../types';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [seeding, setSeeding] = useState(false);

    // State for various settings
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState('Enseignant passionné, dédié à la réussite de chaque élève.');
    const [profilePic, setProfilePic] = useState(`https://i.pravatar.cc/150?u=${user?.email}`);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tfaEnabled, setTfaEnabled] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [language, setLanguage] = useState('fr');
    const [timezone, setTimezone] = useState('Africa/Kinshasa');
    const [fontSize, setFontSize] = useState('default');
    const [highContrast, setHighContrast] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    const loginHistory = [
        { device: 'Chrome sur Windows', location: 'Kinshasa, RDC', time: 'Il y a 2 heures', icon: 'fab fa-windows' },
        { device: 'iPhone App', location: 'Lubumbashi, RDC', time: 'Hier à 18:45', icon: 'fas fa-mobile-alt' },
        { device: 'Safari sur MacBook', location: 'Kinshasa, RDC', time: '20 Mai 2024, 09:12', icon: 'fab fa-apple' },
    ];

    const sections = [
        { id: 'profile', label: 'Profil', icon: 'fas fa-user-circle' },
        { id: 'security', label: 'Sécurité', icon: 'fas fa-shield-alt' },
        { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
        { id: 'appearance', label: 'Apparence', icon: 'fas fa-palette' },
        { id: 'accessibility', label: 'Accessibilité', icon: 'fas fa-universal-access' },
        { id: 'language', label: 'Langue et Région', icon: 'fas fa-globe-americas' },
        { id: 'danger', label: 'Zone de Danger', icon: 'fas fa-exclamation-triangle' },
    ];
    
    const handleFormSubmit = (e: React.FormEvent, formType: string) => {
        e.preventDefault();
        alert(`La fonctionnalité de mise à jour pour "${formType}" n'est pas implémentée dans cette démo.`);
    };

    const handleSeedData = async () => {
        if (!user?.schoolId) {
            alert("Erreur: Impossible d'identifier votre école.");
            return;
        }
        if (!window.confirm("Ceci va générer des données fictives (Classes, Élèves, Paiements) dans votre base de données actuelle. Continuer ?")) {
            return;
        }

        setSeeding(true);
        try {
            const batch = writeBatch(db);
            const createdClassIds: string[] = [];
            const createdClassNames: string[] = [];

            // 1. Créer des classes
            const classesToCreate = [
                { name: '6ème A', level: ClassLevel.SIXIEME },
                { name: '5ème B', level: ClassLevel.CINQUIEME },
                { name: '4ème C', level: ClassLevel.QUATRIEME },
                { name: '3ème A', level: ClassLevel.TROISIEME },
                { name: 'Seconde S', level: ClassLevel.SECONDE },
                { name: 'Terminale', level: ClassLevel.TERMINALE },
            ];

            for (const cls of classesToCreate) {
                const docRef = await addDoc(collection(db, "classes"), {
                    name: cls.name,
                    level: cls.level,
                    school_id: user.schoolId,
                    created_at: new Date().toISOString()
                });
                createdClassIds.push(docRef.id);
                createdClassNames.push(cls.name);
            }

            // 2. Créer des élèves
            const createdStudentIds: string[] = [];
            const createdStudentNames: string[] = [];

            for (let i = 0; i < 20; i++) {
                const mockStudent = MOCK_STUDENTS[i % MOCK_STUDENTS.length];
                // Assigner à une classe aléatoire qu'on vient de créer
                const randomClassIndex = Math.floor(Math.random() * createdClassIds.length);
                
                const docRef = await addDoc(collection(db, "students"), {
                    name: mockStudent.name,
                    school_id: user.schoolId,
                    class_id: createdClassIds[randomClassIndex],
                    status: StudentStatus.ACTIVE,
                    enrollment_date: new Date().toISOString(),
                    phone_number: mockStudent.phoneNumber,
                    parent_phone_number: mockStudent.parentPhoneNumber,
                    parent_address: mockStudent.parentAddress,
                    created_at: new Date().toISOString()
                });
                createdStudentIds.push(docRef.id);
                createdStudentNames.push(mockStudent.name);
            }

            // 3. Créer des paiements
            for (let i = 0; i < 10; i++) {
                const randomStudentIndex = Math.floor(Math.random() * createdStudentIds.length);
                const status = i % 3 === 0 ? PaymentStatus.PAID : PaymentStatus.LATE;
                
                await addDoc(collection(db, "payments"), {
                    student_id: createdStudentIds[randomStudentIndex],
                    student_name: createdStudentNames[randomStudentIndex], // Denormalized
                    class_name: "Classe assignée", // Simplification
                    amount: 150,
                    school_id: user.schoolId,
                    status: status,
                    due_date: new Date().toISOString(),
                    description: "Frais Scolaire - Septembre",
                    created_at: new Date().toISOString()
                });
            }

            alert("Données générées avec succès ! Allez voir les autres pages.");
        } catch (error: any) {
            console.error(error);
            alert("Erreur lors de la génération: " + error.message);
        } finally {
            setSeeding(false);
        }
    };

    const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <h3 className="text-lg md:text-xl font-semibold p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                {title}
            </h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {children}
            </div>
        </div>
    );
    
     const SettingRow: React.FC<{ label: string; description: string; children: React.ReactNode }> = ({ label, description, children }) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 space-y-2 sm:space-y-0">
            <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <div className="flex-shrink-0">
                {children}
            </div>
        </div>
    );

    const renderContent = () => {
        const formInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-800 focus:border-brand-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white";
        const formButtonClass = "bg-brand-primary text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-800 transition-all duration-200";

        switch (activeSection) {
            case 'profile':
                return (
                     <SettingsCard title="Paramètres du Profil">
                        <form onSubmit={(e) => handleFormSubmit(e, 'Profil')} className="p-4 md:p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <img src={profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                                <div>
                                    <label htmlFor="file-upload" className="cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
                                        Changer la photo
                                    </label>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={() => alert("Fonctionnalité non implémentée.")}/>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom complet</label>
                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={formInputClass} />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse e-mail</label>
                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={formInputClass} />
                                </div>
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Biographie</label>
                                    <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} className={formInputClass} />
                                </div>
                            </div>
                             <div className="flex justify-end pt-4 mt-4 border-t dark:border-slate-700">
                                <button type="submit" className={formButtonClass}>Mettre à jour le profil</button>
                            </div>
                        </form>
                    </SettingsCard>
                );
            case 'security':
                return (
                    <div className="space-y-6 md:space-y-8">
                        <SettingsCard title="Changer le mot de passe">
                            <form onSubmit={(e) => handleFormSubmit(e, 'Mot de passe')} className="space-y-4 p-4 md:p-6">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nouveau mot de passe</label>
                                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Laisser vide pour ne pas changer" className={formInputClass} />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmer le mot de passe</label>
                                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={formInputClass} />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className={formButtonClass}>Changer le mot de passe</button>
                                </div>
                            </form>
                        </SettingsCard>
                         <SettingsCard title="Authentification à deux facteurs (2FA)">
                           <ToggleSwitch
                                label="Activer la 2FA"
                                description="Renforcez la sécurité de votre compte."
                                enabled={tfaEnabled}
                                setEnabled={setTfaEnabled}
                           />
                        </SettingsCard>
                        <SettingsCard title="Historique de connexion">
                           <div className="p-4 md:p-6 space-y-4">
                             {loginHistory.map((session, index) => (
                               <div key={index} className="flex items-center">
                                 <i className={`${session.icon} text-2xl text-slate-400 w-8 text-center`}></i>
                                 <div className="ml-4 flex-grow">
                                   <p className="font-medium text-slate-800 dark:text-slate-200">{session.device}</p>
                                   <p className="text-sm text-slate-500 dark:text-slate-400">{session.location} - <span className="italic">{session.time}</span></p>
                                 </div>
                               </div>
                             ))}
                           </div>
                           <div className="p-4 md:p-6 border-t dark:border-slate-700 flex justify-end">
                                <button onClick={() => alert("Déconnecté de tous les autres appareils.")} className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                                    Se déconnecter de partout
                                </button>
                           </div>
                        </SettingsCard>
                    </div>
                );
            case 'notifications':
                return (
                    <SettingsCard title="Préférences de Notification">
                        <ToggleSwitch
                            label="Notifications par e-mail"
                            description="Recevez des e-mails pour les annonces importantes."
                            enabled={emailNotifications}
                            setEnabled={setEmailNotifications}
                        />
                         <ToggleSwitch
                            label="Résumé quotidien"
                            description="Recevez un résumé quotidien des activités."
                            enabled={dailySummary}
                            setEnabled={setDailySummary}
                        />
                         <ToggleSwitch
                            label="Alertes de sécurité"
                            description="Recevez des notifications pour les activités suspectes."
                            enabled={securityAlerts}
                            setEnabled={setSecurityAlerts}
                        />
                    </SettingsCard>
                );
            case 'appearance':
                return (
                    <SettingsCard title="Apparence">
                        <SettingRow label="Thème de l'application" description="Choisissez entre clair et sombre.">
                             <ThemeToggle />
                        </SettingRow>
                    </SettingsCard>
                );
            case 'accessibility':
                return (
                    <SettingsCard title="Accessibilité">
                         <SettingRow label="Taille de la police" description="Ajustez la taille du texte de l'application.">
                           <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-md">
                                <button onClick={() => setFontSize('small')} className={`px-3 py-1 text-sm rounded ${fontSize === 'small' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>A</button>
                                <button onClick={() => setFontSize('default')} className={`px-3 py-1 text-sm rounded ${fontSize === 'default' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>A</button>
                                <button onClick={() => setFontSize('large')} className={`px-3 py-1 text-sm rounded ${fontSize === 'large' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>A</button>
                           </div>
                        </SettingRow>
                        <ToggleSwitch
                            label="Mode Contraste Élevé"
                            description="Améliore la lisibilité pour les malvoyants."
                            enabled={highContrast}
                            setEnabled={setHighContrast}
                        />
                        <ToggleSwitch
                            label="Réduire les animations"
                            description="Désactive les animations décoratives."
                            enabled={reduceMotion}
                            setEnabled={setReduceMotion}
                        />
                    </SettingsCard>
                );
            case 'language':
                 return (
                    <SettingsCard title="Langue et Région">
                         <form onSubmit={(e) => handleFormSubmit(e, 'Langue et Région')} className="space-y-4 p-4 md:p-6">
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Langue</label>
                                <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className={formInputClass}>
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                    <option value="sw">Kiswahili</option>
                                    <option value="ln">Lingala</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fuseau horaire</label>
                                <select id="timezone" value={timezone} onChange={e => setTimezone(e.target.value)} className={formInputClass}>
                                    <option value="Africa/Kinshasa">(GMT+1:00) Kinshasa</option>
                                    <option value="Africa/Lubumbashi">(GMT+2:00) Lubumbashi</option>
                                    <option value="Africa/Lagos">(GMT+1:00) Lagos</option>
                                    <option value="Africa/Johannesburg">(GMT+2:00) Johannesburg</option>
                                </select>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className={formButtonClass}>Sauvegarder</button>
                            </div>
                         </form>
                    </SettingsCard>
                );
            case 'danger':
                return (
                   <SettingsCard title="Zone de Danger">
                       <div className="p-4 space-y-4">
                           <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900 p-4 rounded-md">
                               <h4 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">Données de Démonstration</h4>
                               <p className="text-sm text-yellow-700 dark:text-yellow-600 mb-3">
                                   Cliquez ci-dessous pour remplir votre base de données avec des classes, des étudiants et des paiements fictifs. 
                                   Cela vous permettra de tester l'application immédiatement.
                               </p>
                               <button 
                                   onClick={handleSeedData} 
                                   disabled={seeding}
                                   className="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-700 disabled:opacity-50"
                               >
                                   {seeding ? 'Génération en cours...' : 'Générer les données de démo'}
                               </button>
                           </div>
                       </div>
                   </SettingsCard>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-slate-800 dark:text-slate-100">Paramètres</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                <div className="lg:col-span-1">
                    <div className="space-y-1 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md sticky top-24">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center p-3 rounded-md text-left transition-colors font-medium ${
                                    activeSection === section.id
                                        ? 'bg-brand-primary text-white shadow'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                <i className={`${section.icon} w-6 text-center mr-3`}></i>
                                {section.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-3">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
