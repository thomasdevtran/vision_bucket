import { onAuthStateChanged as observeFirebase, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth } from './firebase';
import { DEMO_MODE } from '../config';

export type User = Pick<FirebaseUser, 'uid' | 'email' | 'displayName' | 'getIdToken'> & {
  getIdTokenResult: () => Promise<{ claims: Record<string, unknown> }>;
};

export const DEMO_UID = 'portfolio-visitor';
const demoUser: User = {
  uid: DEMO_UID,
  email: 'Visitor@example.invalid',
  displayName: 'Portfolio Visitor',
  getIdToken: async () => { throw new Error('The demo does not issue authentication tokens.'); },
  getIdTokenResult: async () => ({ claims: {} }),
};

const session = {
  get currentUser(): User | null { return DEMO_MODE ? demoUser : firebaseAuth.currentUser; },
  onAuthStateChanged(callback: (user: User | null) => void) {
    if (!DEMO_MODE) return observeFirebase(firebaseAuth, callback);
    let active = true;
    Promise.resolve().then(() => { if (active) callback(demoUser); });
    return () => { active = false; };
  },
};

export const getAuth = () => session;
export const onAuthStateChanged = (_session: typeof session, callback: (user: User | null) => void) => session.onAuthStateChanged(callback);
export const signOut = async (_session: typeof session) => { if (!DEMO_MODE) await firebaseSignOut(firebaseAuth); };
