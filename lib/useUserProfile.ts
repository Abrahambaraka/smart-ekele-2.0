import { useEffect, useState } from 'react';
import { auth, db, storage } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

export interface UserProfile {
  full_name?: string;
  email?: string;
  bio?: string;
  photo_url?: string;
  // préférences utilisateur
  email_notifications?: boolean;
  daily_summary?: boolean;
  security_alerts?: boolean;
  theme?: 'light' | 'dark' | 'system';
  font_size?: 'small' | 'default' | 'large';
  high_contrast?: boolean;
  reduce_motion?: boolean;
  language?: string; // fr, en, ...
  timezone?: string; // ex: Africa/Kinshasa
  updated_at?: string;
}

export function useUserProfile(uid?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(!!uid);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const d = doc(db, 'users', uid);
    const unsub = onSnapshot(
      d,
      (snap) => {
        setProfile((snap.exists() ? (snap.data() as UserProfile) : {}) || {});
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  const save = async (data: Partial<UserProfile>) => {
    if (!uid) throw new Error('uid manquant');
    const d = doc(db, 'users', uid);
    const payload: Partial<UserProfile> = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    // on préfère update si doc existe, sinon set (merge) pour créer
    try {
      await updateDoc(d, payload as Record<string, unknown>);
    } catch {
      await setDoc(d, payload as Record<string, unknown>, { merge: true });
    }

    // Garder Auth en phase pour name/photo
    const current = auth.currentUser;
    if (current) {
      const displayName = typeof data.full_name === 'string' ? data.full_name : undefined;
      const photoURL = typeof data.photo_url === 'string' ? data.photo_url : undefined;
      if (displayName || photoURL) {
        await updateProfile(current, { displayName, photoURL });
      }
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!uid) throw new Error('uid manquant');
    const contentType = file.type || 'image/png';
    const path = `users/${uid}/avatar_${Date.now()}.png`;
    const r = ref(storage, path);
    await uploadBytes(r, file, { contentType });
    return await getDownloadURL(r);
  };

  return { profile, loading, error, save, uploadAvatar };
}
