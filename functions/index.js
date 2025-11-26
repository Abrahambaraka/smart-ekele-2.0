/*
  Firebase Functions – Envoi d'invitations par Gmail
  Prérequis (à exécuter une fois en local/CI):
    firebase functions:config:set gmail.user="votre_adresse@gmail.com" gmail.pass="votre_app_password"
  Puis déployer: firebase deploy --only functions
*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized
}

const db = admin.firestore();

// Transport Gmail via App Password (recommandé sur un compte dédié)
const gmailUser = functions.config().gmail?.user;
const gmailPass = functions.config().gmail?.pass;

if (!gmailUser || !gmailPass) {
  console.warn('[functions] Config Gmail manquante. Définissez functions:config:set gmail.user / gmail.pass');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

// Utilitaire simple de validation e-mail
function isValidEmail(email) {
  return /.+@.+\..+/.test(email);
}

// Callable: envoi direct d'une invitation par email
exports.sendInviteEmail = functions.https.onCall(async (data, context) => {
  // Sécurité: requiert un utilisateur connecté et un rôle directeur ou super admin (basique, à affiner via custom claims/règles)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté.');
  }

  const { email, schoolId, inviteId } = data || {};
  if (!email || !isValidEmail(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Adresse email invalide.');
  }
  if (!schoolId) {
    throw new functions.https.HttpsError('invalid-argument', 'schoolId requis.');
  }

  // Option: vérifier que l'appelant appartient bien à l'école. On lit /users/{uid}
  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  const caller = callerDoc.exists ? callerDoc.data() : null;
  if (!caller) {
    throw new functions.https.HttpsError('permission-denied', "Profil de l'appelant introuvable.");
  }
  const isSuperAdmin = caller.role === 'super_admin';
  const isDirectorOfSchool = caller.role === 'school_director' && caller.school_id === schoolId;
  if (!isSuperAdmin && !isDirectorOfSchool) {
    throw new functions.https.HttpsError('permission-denied', "Vous n'avez pas les droits pour inviter pour cette école.");
  }

  // S'assurer qu'un doc d'invite existe (si non fourni)
  let inviteDocId = inviteId;
  if (!inviteDocId) {
    const docRef = await db.collection('invites').add({
      email: String(email).toLowerCase(),
      school_id: schoolId,
      role: 'teacher',
      status: 'pending',
      created_at: new Date().toISOString(),
    });
    inviteDocId = docRef.id;
  }

  const appUrl = 'https://smart-ekele.web.app';
  const registrationUrl = `${appUrl}/#/login?invite=${encodeURIComponent(inviteDocId)}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `Smart Ekele <${gmailUser}>`,
    to: email,
    subject: `Invitation à rejoindre l'école sur Smart Ekele`,
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>Invitation à rejoindre Smart Ekele</h2>
        <p>Bonjour,</p>
        <p>Vous avez été invité à rejoindre l'école (ID: <b>${schoolId}</b>) en tant que <b>professeur</b> sur la plateforme Smart Ekele.</p>
        <p>Pour accepter l'invitation, cliquez sur le bouton ci-dessous et inscrivez-vous avec <b>${email}</b>.</p>
        <p style="margin:24px 0;">
          <a href="${registrationUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;">Accepter l'invitation</a>
        </p>
        <p>Ou copiez ce lien dans votre navigateur:<br/>
        <a href="${registrationUrl}">${registrationUrl}</a></p>
        <hr/>
        <small>Si vous n'êtes pas à l'origine de cette invitation, ignorez ce message.</small>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    await db.collection('invites').doc(inviteDocId).set({ mailed_at: new Date().toISOString() }, { merge: true });
    return { ok: true, inviteId: inviteDocId };
  } catch (err) {
    console.error('Erreur envoi email:', err);
    throw new functions.https.HttpsError('internal', "Échec d'envoi de l'invitation");
  }
});
