
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc
} from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, fullName: string, schoolName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction utilitaire pour récupérer le profil Firestore
  const fetchUserProfile = async (firebaseUser: any) => {
    try {
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: data.full_name || firebaseUser.email,
          role: data.role as Role,
          schoolId: data.school_id
        } as User;
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        if (userProfile) {
          setUser(userProfile);
        } else {
           // Fallback si le doc Firestore n'est pas encore prêt (rare mais possible)
           setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.email!,
              role: Role.TEACHER // Default risky assumption
           });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error };
    }
  };

  const register = async (email: string, password: string, fullName: string, schoolName: string) => {
      setLoading(true);
      
      try {
          // 1. Vérifier si l'email fait l'objet d'une invitation
          // Note: Firestore query
          const invitesRef = collection(db, "invites");
          const q = query(invitesRef, where("email", "==", email.toLowerCase()));
          const querySnapshot = await getDocs(q);
          
          let inviteData = null;
          let inviteDocId = null;

          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            inviteData = doc.data();
            inviteDocId = doc.id;
          }
          
          // Déterminer le rôle et l'école
          let role = Role.SCHOOL_DIRECTOR;
          let schoolId: number | string | null = null; // Changed to allow string IDs for Firestore schools

          if (inviteData) {
              role = Role.TEACHER;
              schoolId = inviteData.school_id;
          }

          // 2. Créer l'utilisateur Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;

          if (newUser) {
              // 3. Logique différenciée selon Invitation vs Création
              if (inviteData && schoolId) {
                  // A) C'est un prof invité : on crée le profil utilisateur
                  await setDoc(doc(db, "users", newUser.uid), {
                      full_name: fullName,
                      email: email,
                      role: Role.TEACHER,
                      school_id: schoolId
                  });

                  // Supprimer l'invitation
                  if (inviteDocId) {
                    await deleteDoc(doc(db, "invites", inviteDocId));
                  }

                  setUser({
                      id: newUser.uid,
                      email: email,
                      name: fullName,
                      role: Role.TEACHER,
                      schoolId: schoolId as number // Casting si nécessaire, bien que Firestore utilise des Strings
                  });

              } else {
                  // B) C'est un nouveau directeur : on crée l'école
                  // Génération d'un ID numérique simulé ou utilisation de l'auto-id Firestore
                  // Pour simplifier la migration depuis SQL, on va utiliser l'Auto-ID de Firestore pour l'école
                  
                  const schoolRef = doc(collection(db, "schools"));
                  await setDoc(schoolRef, {
                    name: schoolName,
                    status: 'Active',
                    created_at: new Date().toISOString()
                  });

                  const newSchoolId = schoolRef.id;

                  // Créer le profil directeur
                  await setDoc(doc(db, "users", newUser.uid), {
                      full_name: fullName,
                      email: email,
                      role: Role.SCHOOL_DIRECTOR,
                      school_id: newSchoolId
                  });
                  
                  setUser({
                      id: newUser.uid,
                      email: email,
                      name: fullName,
                      role: Role.SCHOOL_DIRECTOR,
                      schoolId: newSchoolId as any // TypeScript fix
                  });
              }

              return { error: null };
          }
      } catch (err: any) {
          setLoading(false);
          return { error: err };
      }
      
      setLoading(false);
      return { error: { message: "Erreur inconnue lors de l'inscription" } };
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
