
import React, { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ToggleSwitch from '../components/ToggleSwitch';
import { db } from '../lib/firebase';
import { collection, addDoc, writeBatch } from 'firebase/firestore';
import { MOCK_CLASSES, MOCK_STUDENTS, MOCK_PAYMENTS } from '../constants';
import { ClassLevel, StudentStatus, PaymentStatus } from '../types';
import { useSchoolSettings } from '../lib/useSchoolSettings';
import { useUserProfile } from '../lib/useUserProfile';
import { updatePassword } from 'firebase/auth';
import { useToast } from '../contexts/ToastContext';

// Constantes statiques hors composant pour éviter leur recréation à chaque frappe
const SECTIONS = [
    { id: 'profile', label: 'Profil', icon: 'fas fa-user-circle' },
    { id: 'security', label: 'Sécurité', icon: 'fas fa-shield-alt' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'appearance', label: 'Apparence', icon: 'fas fa-palette' },
    { id: 'accessibility', label: 'Accessibilité', icon: 'fas fa-universal-access' },
    { id: 'language', label: 'Langue et Région', icon: 'fas fa-globe-americas' },
];

const LOGIN_HISTORY = [
    { device: 'Chrome sur Windows', location: 'Kinshasa, RDC', time: 'Il y a 2 heures', icon: 'fab fa-windows' },
    { device: 'iPhone App', location: 'Lubumbashi, RDC', time: 'Hier à 18:45', icon: 'fas fa-mobile-alt' },
    { device: 'Safari sur MacBook', location: 'Kinshasa, RDC', time: '20 Mai 2024, 09:12', icon: 'fab fa-apple' },
];

// Composants de présentation mémoïsés pour éviter des re-rendus inutiles
const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = React.memo(({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <h3 className="text-lg md:text-xl font-semibold p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
            {title}
        </h3>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {children}
        </div>
    </div>
));
SettingsCard.displayName = 'SettingsCard';

const SettingRow: React.FC<{ label: string; description: string; children: React.ReactNode }> = React.memo(({ label, description, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 space-y-2 sm:space-y-0">
        <div>
            <p className="font-medium text-slate-700 dark:text-slate-200">{label}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </div>
));
SettingRow.displayName = 'SettingRow';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const toast = useToast();
    const [activeSection, setActiveSection] = useState('profile');
    const [seeding, setSeeding] = useState(false);
    const { settings, loading: settingsLoading, save, uploadLogo } = useSchoolSettings(user?.schoolId);

    // School settings state (controlled form)
    const [schoolName, setSchoolName] = useState('');
    const [schoolEmail, setSchoolEmail] = useState('');
    const [schoolPhone, setSchoolPhone] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [receiptFooter, setReceiptFooter] = useState('');
    const [logoUploading, setLogoUploading] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const displayLogoUrl = useMemo(() => settings?.logo_url || '', [settings]);

    // State for various settings
    const { profile, save: saveUserProfile, uploadAvatar, loading: userProfileLoading } = useUserProfile(user?.id);
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
    const [fontSize, setFontSize] = useState<'small'|'default'|'large'>('default');
    const [highContrast, setHighContrast] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    const sections = useMemo(() => ([
        ...SECTIONS,
        { id: 'danger', label: 'Zone de Danger', icon: 'fas fa-exclamation-triangle' },
        { id: 'school', label: "Établissement", icon: 'fa-solid fa-school' },
    ]), []);
    
    const handleFormSubmit = (e: React.FormEvent, _formType: string) => {
        e.preventDefault();
        // neutre: laissé pour les formulaires non utilisés
    };

    // Hydrater le profil utilisateur dans l'onglet Profil et préférences
    React.useEffect(() => {
        if (!profile) return;
        if (profile.full_name) setName(profile.full_name);
        if (profile.email) setEmail(profile.email);
        if (profile.bio !== undefined) setBio(profile.bio || '');
        if (profile.photo_url) setProfilePic(profile.photo_url);
        if (profile.email_notifications !== undefined) setEmailNotifications(!!profile.email_notifications);
        if (profile.daily_summary !== undefined) setDailySummary(!!profile.daily_summary);
        if (profile.security_alerts !== undefined) setSecurityAlerts(!!profile.security_alerts);
        if (profile.language) setLanguage(profile.language);
        if (profile.timezone) setTimezone(profile.timezone);
        if (profile.font_size) setFontSize(profile.font_size as 'small'|'default'|'large');
        if (profile.high_contrast !== undefined) setHighContrast(!!profile.high_contrast);
        if (profile.reduce_motion !== undefined) setReduceMotion(!!profile.reduce_motion);
        if (profile.theme === 'light' || profile.theme === 'dark') {
            setTheme(profile.theme);
        }
        if (typeof profile.high_contrast === 'boolean') {
            setHighContrast(!!profile.high_contrast);
        }
        if (typeof profile.reduce_motion === 'boolean') {
            setReduceMotion(!!profile.reduce_motion);
        }
        if (profile.font_size) {
            setFontSize(profile.font_size as 'small'|'default'|'large');
        }
        if (typeof (profile as any).tfa_enabled === 'boolean') {
            setTwoFAEnabled(!!(profile as any).tfa_enabled);
        }
    }, [profile, setTheme]);

    const handleUpdateProfile = async () => {
        if (!user?.id) {
            toast.error('Veuillez vous reconnecter.');
            return;
        }
        setSavingProfile(true);
        try {
            await saveUserProfile({
                full_name: name.trim() || undefined,
                email: email.trim() || undefined,
                bio: bio.trim(),
                photo_url: profilePic,
            });
            toast.success('Profil mis à jour.');
        } catch (e: any) {
            console.error(e);
            toast.error("Erreur lors de la mise à jour du profil: " + (e?.message || e));
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password !== confirmPassword) {
            toast.warning('Les mots de passe ne correspondent pas.');
            return;
        }
        if (!user) { toast.error('Session expirée.'); return; }
        try {
            // updatePassword peut exiger une ré-authentification récente
            // Laisser Firebase renvoyer l’erreur si nécessaire
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await updatePassword((window as any).firebaseAuthCurrentUser || (null as any) || ({} as any), password);
        } catch (err: any) {
            // Fallback: utiliser auth.currentUser si exposé
            try {
                // dynamique pour éviter d’importer directement auth ici
                const { auth } = await import('../lib/firebase');
                if (auth.currentUser) {
                    await updatePassword(auth.currentUser, password);
                } else {
                    throw err;
                }
            } catch (e: any) {
                console.error(e);
                if (String(e?.code).includes('requires-recent-login')) {
                    toast.info('Pour changer le mot de passe, veuillez vous déconnecter puis vous reconnecter et réessayer.');
                } else {
                    toast.error('Échec du changement de mot de passe: ' + (e?.message || e));
                }
                return;
            }
        }
        setPassword('');
        setConfirmPassword('');
        toast.success('Mot de passe mis à jour.');
    };

    // Appliquer Accessibilité & Langue au document (immédiat)
    React.useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-font-size', fontSize);
        root.setAttribute('data-high-contrast', String(highContrast));
        root.setAttribute('data-reduce-motion', String(reduceMotion));
    }, [fontSize, highContrast, reduceMotion]);

    React.useEffect(() => {
        if (language) {
            document.documentElement.lang = language;
            localStorage.setItem('lang', language);
        }
    }, [language]);

    const handleThemeChange = useCallback(async (next: 'light' | 'dark') => {
        setTheme(next);
        try {
            if (user?.id) await saveUserProfile({ theme: next });
        } catch (e) {
            console.error(e);
        }
    }, [setTheme, saveUserProfile, user?.id]);

    // Hydrate local state from Firestore settings (éviter d'écraser la saisie en cours)
    React.useEffect(() => {
        if (!settings) return;
        // Hydrater uniquement à la première charge, ou si des champs locaux sont vides
        setSchoolName(prev => prev || settings.display_name || '');
        setSchoolEmail(prev => prev || settings.email || '');
        setSchoolPhone(prev => prev || settings.phone || '');
        setSchoolAddress(prev => prev || settings.address || '');
        setReceiptFooter(prev => prev || settings.receipt_footer || '');
    }, [settings]);

    const handleSaveSchool = useCallback(async () => {
        if (!user?.id || !user?.schoolId) {
            toast.error("Vous devez être connecté pour sauvegarder ces paramètres.");
            return;
        }
        setSavingSettings(true);
        try {
            await save(user.id, {
                display_name: schoolName.trim() || undefined,
                email: schoolEmail.trim() || undefined,
                phone: schoolPhone.trim() || undefined,
                address: schoolAddress.trim() || undefined,
                receipt_footer: receiptFooter.trim() || undefined,
            });
            toast.success('Paramètres de l\'établissement sauvegardés.');
        } catch (e: any) {
            console.error(e);
            toast.error("Erreur lors de l'enregistrement: " + (e?.message || e));
        } finally {
            setSavingSettings(false);
        }
    }, [user?.id, user?.schoolId, save, schoolName, schoolEmail, schoolPhone, schoolAddress, receiptFooter, toast]);

    const handleLogoChange: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
        if (!ev.target.files || ev.target.files.length === 0) return;
        const file = ev.target.files[0];
        if (!file.type.startsWith('image/')) {
            toast.warning('Veuillez sélectionner une image.');
            return;
        }
        if (!user?.id) return;
        setLogoUploading(true);
        try {
            const url = await uploadLogo(file);
            await save(user.id, { logo_url: url });
            toast.success('Logo mis à jour.');
        } catch (e: any) {
            console.error(e);
            toast.error("Échec de téléchargement du logo: " + (e?.message || e));
        } finally {
            setLogoUploading(false);
            // reset file input value
            ev.currentTarget.value = '';
        }
    };

    const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
        if (!ev.target.files || ev.target.files.length === 0) return;
        const file = ev.target.files[0];
        if (!file.type.startsWith('image/')) { toast.warning('Veuillez sélectionner une image.'); return; }
        if (!user?.id) return;
        try {
            const url = await uploadAvatar(file);
            setProfilePic(url);
            await saveUserProfile({ photo_url: url });
            toast.success('Photo de profil mise à jour.');
        } catch (e: any) {
            console.error(e);
            toast.error("Échec de mise à jour de la photo: " + (e?.message || e));
        } finally {
            ev.currentTarget.value = '';
        }
    };

    const handleSeedData = async () => {
        if (!user?.schoolId) {
            toast.error("Erreur: Impossible d'identifier votre école.");
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

            toast.success("Données générées avec succès ! Allez voir les autres pages.");
        } catch (error: any) {
            console.error(error);
            toast.error("Erreur lors de la génération: " + error.message);
        } finally {
            setSeeding(false);
        }
    };

    // Persistance automatique de certaines préférences d'accessibilité
    React.useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try { await saveUserProfile({ font_size: fontSize }); } catch (e) { console.error(e); }
        })();
    }, [fontSize, user?.id, saveUserProfile]);

    React.useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try { await saveUserProfile({ high_contrast: highContrast }); } catch (e) { console.error(e); }
        })();
    }, [highContrast, user?.id, saveUserProfile]);

    // Les composants SettingsCard/SettingRow ont été déplacés hors du composant et mémoïsés

    const renderContent = () => {
        const formInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-800 focus:border-brand-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white";
        const formButtonClass = "bg-brand-primary text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-800 transition-all duration-200";

        switch (activeSection) {
            case 'profile':
                return (
                     <SettingsCard title="Paramètres du Profil">
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="p-4 md:p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <img src={profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                                <div>
                                    <label htmlFor="file-upload" className="cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">
                                        Changer la photo
                                    </label>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleAvatarChange}/>
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
                                <button type="submit" className={formButtonClass} disabled={savingProfile || userProfileLoading}>
                                  {savingProfile ? 'Sauvegarde...' : 'Mettre à jour le profil'}
                                </button>
                            </div>
                        </form>
                    </SettingsCard>
                );
            case 'security':
                return (
                    <div className="space-y-6 md:space-y-8">
                        <SettingsCard title="Changer le mot de passe">
                            <form onSubmit={handlePasswordChange} className="space-y-4 p-4 md:p-6">
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
                                label="Activer la 2FA (préférence)"
                                description="Enregistre votre préférence. Pour une 2FA réelle (MFA Firebase), une étape d'inscription par code/app sera ajoutée ultérieurement."
                                enabled={twoFAEnabled}
                                setEnabled={async (v:boolean)=>{
                                    setTwoFAEnabled(v);
                                    if(user?.id){ try{ await saveUserProfile({ /* @ts-ignore */ tfa_enabled: v }); } catch(e){ console.error(e);} }
                                }}
                           />
                        </SettingsCard>
                        <SettingsCard title="Historique de connexion">
                           <div className="p-4 md:p-6 space-y-4">
                             {LOGIN_HISTORY.map((session, index) => (
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
                                <button onClick={() => toast.info("Déconnecté de tous les autres appareils.")} className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition">
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
                            setEnabled={async (v: boolean) => { setEmailNotifications(v); if (user?.id) { try { await saveUserProfile({ email_notifications: v }); } catch (e) { console.error(e); } } }}
                        />
                         <ToggleSwitch
                            label="Résumé quotidien"
                            description="Recevez un résumé quotidien des activités."
                            enabled={dailySummary}
                            setEnabled={async (v: boolean) => { setDailySummary(v); if (user?.id) { try { await saveUserProfile({ daily_summary: v }); } catch (e) { console.error(e); } } }}
                        />
                         <ToggleSwitch
                            label="Alertes de sécurité"
                            description="Recevez des notifications pour les activités suspectes."
                            enabled={securityAlerts}
                            setEnabled={async (v: boolean) => { setSecurityAlerts(v); if (user?.id) { try { await saveUserProfile({ security_alerts: v }); } catch (e) { console.error(e); } } }}
                        />
                    </SettingsCard>
                );
            case 'appearance':
                return (
                    <SettingsCard title="Apparence">
                        <SettingRow label="Thème de l'application" description="Choisissez entre clair et sombre.">
                            <div className="flex items-center space-x-3">
                                <button onClick={()=>handleThemeChange('light')} className={`px-3 py-2 rounded-md text-sm border ${theme==='light'?'bg-slate-200 dark:bg-slate-700 font-semibold':''}`}>Clair</button>
                                <button onClick={()=>handleThemeChange('dark')} className={`px-3 py-2 rounded-md text-sm border ${theme==='dark'?'bg-slate-200 dark:bg-slate-700 font-semibold':''}`}>Sombre</button>
                                <div className="ml-2"><ThemeToggle /></div>
                            </div>
                        </SettingRow>
                    </SettingsCard>
                );
            case 'school':
                return (
                    <SettingsCard title="Établissement (branding)">
                        <div className="p-4 md:p-6 space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 rounded overflow-hidden bg-slate-100 flex items-center justify-center">
                                    {displayLogoUrl ? (
                                        <img src={displayLogoUrl} alt="Logo établissement" className="w-full h-full object-cover" />
                                    ) : (
                                        <i className="fa-solid fa-school text-3xl text-slate-400" aria-hidden="true"></i>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="school-logo" className="cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm inline-flex items-center">
                                        <i className="fa-solid fa-upload mr-2"></i>{logoUploading ? 'Téléversement...' : 'Changer le logo'}
                                    </label>
                                    <input id="school-logo" type="file" accept="image/*" className="sr-only" onChange={handleLogoChange} disabled={logoUploading} />
                                    {settingsLoading && <p className="text-xs text-slate-500 mt-1">Chargement des paramètres...</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom affiché de l'école</label>
                                <input type="text" value={schoolName} onChange={e=>setSchoolName(e.target.value)} className={formInputClass} placeholder="Ex: Lycée Salama" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E‑mail établissement</label>
                                    <input type="email" value={schoolEmail} onChange={e=>setSchoolEmail(e.target.value)} className={formInputClass} placeholder="contact@ecole.tld" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone</label>
                                    <input type="tel" value={schoolPhone} onChange={e=>setSchoolPhone(e.target.value)} className={formInputClass} placeholder="+243 ..." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse</label>
                                <input type="text" value={schoolAddress} onChange={e=>setSchoolAddress(e.target.value)} className={formInputClass} placeholder="Rue, Ville, Pays" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pied de page du reçu</label>
                                <textarea value={receiptFooter} onChange={e=>setReceiptFooter(e.target.value)} rows={3} className={formInputClass} placeholder="Merci pour votre paiement. ..." />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={handleSaveSchool} disabled={savingSettings} className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-brand-secondary disabled:opacity-50">
                                    {savingSettings ? 'Sauvegarde...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
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
                            setEnabled={async (v:boolean)=>{ setReduceMotion(v); if(user?.id){ try{ await saveUserProfile({ reduce_motion: v }); } catch(e){ console.error(e);} } }}
                        />
                    </SettingsCard>
                );
            case 'language':
                 return (
                    <SettingsCard title="Langue et Région">
                         <form onSubmit={async (e) => { e.preventDefault(); if (user?.id) { try { await saveUserProfile({ language, timezone }); toast.success('Préférences de langue/région sauvegardées.'); } catch (er) { console.error(er); toast.error('Erreur lors de la sauvegarde des préférences.'); } } }} className="space-y-4 p-4 md:p-6">
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
