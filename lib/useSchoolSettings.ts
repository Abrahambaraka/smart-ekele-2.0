import { useEffect, useMemo, useState } from 'react';
import { db, storage } from './firebase';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export interface SchoolSettings {
  display_name?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  receipt_footer?: string;
  locale?: string; // ex: fr-FR
  updated_at?: string; // ISO string
  updated_by?: string; // uid
}

export function useSchoolSettings(schoolId?: string) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(!!schoolId);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!schoolId) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const d = doc(db, 'schools', schoolId);
    const unsub = onSnapshot(
      d,
      (snap) => {
        setSettings((snap.exists() ? (snap.data() as SchoolSettings) : {}) || {});
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [schoolId]);

  const save = async (uid: string, data: Partial<SchoolSettings>) => {
    if (!schoolId) throw new Error('schoolId manquant');
    const d = doc(db, 'schools', schoolId);
    const payload: Partial<SchoolSettings> = {
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: uid,
    };
    const snap = await getDoc(d);
    if (snap.exists()) {
      await updateDoc(d, payload as Record<string, unknown>);
    } else {
      await setDoc(d, payload as Record<string, unknown>, { merge: true });
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    if (!schoolId) throw new Error('schoolId manquant');
    const storageRef = ref(storage, `schools/${schoolId}/logo_${Date.now()}.png`);
    await uploadBytes(storageRef, file, { contentType: file.type || 'image/png' });
    return await getDownloadURL(storageRef);
  };

  return { settings, loading, error, save, uploadLogo };
}
