// ──────────────────────────────────────────────
// Firebase Cloud Messaging Service
// ──────────────────────────────────────────────

import admin from 'firebase-admin';

let firebaseInitialized = false;

function initFirebase(): void {
  if (firebaseInitialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase FCM not configured — push notifications disabled');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  firebaseInitialized = true;
}

/**
 * Send a push notification to a specific device token.
 */
export async function sendPushNotification(
  deviceToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string | null> {
  initFirebase();
  if (!firebaseInitialized) return null;

  try {
    const messageId = await admin.messaging().send({
      token: deviceToken,
      notification: { title, body },
      data,
    });
    return messageId;
  } catch (error) {
    console.error('FCM send failed:', error);
    return null;
  }
}

/**
 * Send a push notification to a topic (e.g., role-based broadcast).
 */
export async function sendTopicNotification(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<string | null> {
  initFirebase();
  if (!firebaseInitialized) return null;

  try {
    const messageId = await admin.messaging().send({
      topic,
      notification: { title, body },
      data,
    });
    return messageId;
  } catch (error) {
    console.error('FCM topic send failed:', error);
    return null;
  }
}
