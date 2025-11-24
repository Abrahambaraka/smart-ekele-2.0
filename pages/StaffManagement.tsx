
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface StaffMember {
    id: string;
    full_name: string;
    email: string;
    role: string;
}

interface Invite {
    id: string;
    email: string;
    created_at: string;
}

const StaffManagement: React.FC = () => {
    const { user } = useAuth();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    const fetchData = async () => {
        if (!user?.schoolId) return;
        setLoading(true);

        // 1. Récupérer les profs existants (users collection where schoolId == x and role == teacher)
        const qStaff = query(
            collection(db, "users"), 
            where("school_id", "==", user.schoolId),
            where("role", "==", "teacher")
        );
        const staffSnap = await getDocs(qStaff);
        setStaff(staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember)));

        // 2. Récupérer les invitations en attente
        const qInvites = query(
            collection(db, "invites"), 
            where("school_id", "==", user.schoolId)
        );
        const invitesSnap = await getDocs(qInvites);
        setInvites(invitesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invite)));

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [user?.schoolId]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !user?.schoolId) return;

        setInviteLoading(true);

        // Vérifier si déjà invité ou déjà membre
        const alreadyMember = staff.find(s => s.email.toLowerCase() === newEmail.toLowerCase());
        const alreadyInvited = invites.find(i => i.email.toLowerCase() === newEmail.toLowerCase());

        if (alreadyMember) {
            alert("Cet utilisateur est déjà membre du personnel.");
            setInviteLoading(false);
            return;
        }
        if (alreadyInvited) {
            alert("Une invitation a déjà été envoyée à cette adresse.");
            setInviteLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, "invites"), {
                email: newEmail.toLowerCase(),
                school_id: user.schoolId,
                role: 'teacher',
                created_at: new Date().toISOString()
            });

            setNewEmail('');
            fetchData();
            alert(`Invitation envoyée ! Demandez à ${newEmail} de s'inscrire sur l'application pour rejoindre l'école.`);
        } catch (err: any) {
            alert("Erreur lors de l'invitation: " + err.message);
        } finally {
            setInviteLoading(false);
        }
    };

    const handleCancelInvite = async (id: string) => {
        if(!window.confirm("Annuler cette invitation ?")) return;
        try {
            await deleteDoc(doc(db, "invites", id));
            setInvites(invites.filter(i => i.id !== id));
        } catch (e: any) {
            console.error(e);
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Gestion du Personnel</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne Gauche: Ajouter / Inviter */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Inviter un Professeur</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Saisissez l'email du professeur. Il devra utiliser cet email lors de son inscription pour être automatiquement rattaché à votre école.
                        </p>
                        <form onSubmit={handleInvite}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse Email</label>
                                <input 
                                    type="email" 
                                    required
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    placeholder="prof@exemple.com"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={inviteLoading}
                                className="w-full bg-brand-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-secondary transition-colors disabled:opacity-50"
                            >
                                {inviteLoading ? 'Envoi...' : 'Envoyer l\'invitation'}
                            </button>
                        </form>
                    </div>

                    {/* Invitations en attente */}
                    {invites.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">Invitations en attente</h3>
                            <ul className="space-y-3">
                                {invites.map(invite => (
                                    <li key={invite.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{invite.email}</p>
                                            <p className="text-xs text-slate-500">Envoyé le {new Date(invite.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => handleCancelInvite(invite.id)} className="text-red-500 hover:text-red-700 text-sm">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Colonne Droite: Liste du personnel */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Membres de l'équipe ({staff.length})</h2>
                        
                        {loading ? (
                            <p>Chargement...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left table-style text-sm">
                                    <thead>
                                        <tr>
                                            <th className="p-3">Nom</th>
                                            <th className="p-3">Email</th>
                                            <th className="p-3">Rôle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staff.length > 0 ? staff.map(member => (
                                            <tr key={member.id} className="border-b dark:border-slate-700">
                                                <td className="p-3 font-medium">{member.full_name}</td>
                                                <td className="p-3">{member.email}</td>
                                                <td className="p-3 capitalize">{member.role === 'teacher' ? 'Professeur' : member.role}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="p-4 text-center text-slate-500">Aucun professeur inscrit pour le moment.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
