const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
const STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';

export const firebaseReady = Boolean(API_KEY && PROJECT_ID);
export const firebaseConfig = { apiKey: API_KEY, projectId: PROJECT_ID, storageBucket: STORAGE_BUCKET };

const authUrl = (path) => `https://identitytoolkit.googleapis.com/v1/${path}?key=${encodeURIComponent(API_KEY)}`;
const firestoreBase = () => `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents`;

function assertReady() {
  if (!firebaseReady) throw new Error('Firebase is not configured yet. Add the Firebase environment variables to the GitHub Actions secrets.');
}

async function parse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = data?.error?.message || data?.error?.status || 'FIREBASE_REQUEST_FAILED';
    throw new Error(String(code).replaceAll('_', ' ').toLowerCase());
  }
  return data;
}

export function friendlyFirebaseError(error) {
  const text = String(error?.message || error);
  const map = {
    EMAIL_EXISTS: 'That email is already registered. Try signing in instead.',
    INVALID_LOGIN_CREDENTIALS: 'The email or password is incorrect.',
    INVALID_PASSWORD: 'The password is incorrect.',
    EMAIL_NOT_FOUND: 'No account was found for that email.',
    WEAK_PASSWORD: 'Use a password with at least 6 characters.',
    OPERATION_NOT_ALLOWED: 'Email/password sign-in is not enabled in Firebase yet.',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Please wait and try again.',
    INVALID_EMAIL: 'Enter a valid email address.',
    TOKEN_EXPIRED: 'Your session expired. Please sign in again.'
  };
  const key = Object.keys(map).find(k => text.includes(k));
  return key ? map[key] : text;
}

export async function signUp(email, password, displayName) {
  assertReady();
  const data = await parse(await fetch(authUrl('accounts:signUp'), {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password, returnSecureToken: true })
  }));
  if (displayName) await updateAccount(data.idToken, { displayName });
  return { ...data, displayName };
}

export async function signIn(email, password) {
  assertReady();
  return parse(await fetch(authUrl('accounts:signInWithPassword'), {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password, returnSecureToken: true })
  }));
}

export async function refreshSession(refreshToken) {
  assertReady();
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(API_KEY)}`, {
    method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken })
  });
  const data = await parse(response);
  return { idToken: data.id_token, refreshToken: data.refresh_token, localId: data.user_id, expiresIn: data.expires_in };
}

export async function updateAccount(idToken, values) {
  assertReady();
  return parse(await fetch(authUrl('accounts:update'), {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ idToken, ...values, returnSecureToken: true })
  }));
}

function toValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k,v]) => [k, toValue(v)])) } };
  return { stringValue: String(value) };
}

function fromValue(value) {
  if (!value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromValue);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k,v]) => [k, fromValue(v)]));
  return null;
}

export async function loadAppData(idToken, uid) {
  assertReady();
  const path = `${firestoreBase()}/users/${encodeURIComponent(uid)}/app/data`;
  const response = await fetch(path, { headers: { Authorization: `Bearer ${idToken}` } });
  if (response.status === 404) return null;
  const data = await parse(response);
  return Object.fromEntries(Object.entries(data.fields || {}).map(([k,v]) => [k, fromValue(v)]));
}

export async function saveAppData(idToken, uid, state) {
  assertReady();
  const path = `${firestoreBase()}/users/${encodeURIComponent(uid)}/app/data`;
  const fields = Object.fromEntries(Object.entries(state).map(([k,v]) => [k, toValue(v)]));
  return parse(await fetch(path, {
    method: 'PATCH', headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  }));
}

export async function uploadUserFile(idToken, uid, file, folder = 'documents') {
  assertReady();
  if (!STORAGE_BUCKET) throw new Error('Firebase Storage bucket is not configured.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Files must be 10 MB or smaller.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${uid}/${folder}/${Date.now()}-${safeName}`;
  const endpoint = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(STORAGE_BUCKET)}/o?uploadType=media&name=${encodeURIComponent(path)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': file.type || 'application/octet-stream' },
    body: file
  });
  return parse(response);
}
