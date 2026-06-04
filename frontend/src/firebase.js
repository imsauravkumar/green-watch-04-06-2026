// Real Firebase client initialization and authentication controller
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreateUser,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile as fbUpdateProfile,
  sendPasswordResetEmail as fbSendPasswordResetEmail
} from 'firebase/auth';

// Retrieve Firebase variables from Vite Env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const isFirebaseConfigured = firebaseConfig.apiKey && 
                             firebaseConfig.apiKey.trim() !== "" && 
                             firebaseConfig.apiKey !== "your_firebase_api_key";

let auth;
let isRealFirebase = false;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    isRealFirebase = true;
    console.log("🔥 Real Firebase Auth client initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize Real Firebase Auth client:", error.message);
  }
}

if (!isRealFirebase) {
  console.warn("⚠️ VITE_FIREBASE_API_KEY not configured. Falling back to local mock authentication.");
}

class FirebaseAuthWrapper {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('greenwatch_user')) || null;
    this.listeners = [];
    this.isAuthenticating = false;

    if (isRealFirebase) {
      // Listen to real Firebase state updates and sync session details
      fbOnAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          if (this.isAuthenticating) return;
          const token = localStorage.getItem('greenwatch_token');
          if (!this.currentUser || this.currentUser.email !== fbUser.email || !token) {
            try {
              const syncRes = await fetch('/api/auth/sync-firebase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: fbUser.email,
                  name: fbUser.displayName || fbUser.email.split('@')[0]
                })
              });
              if (syncRes.ok) {
                const data = await syncRes.json();
                this.currentUser = {
                  uid: fbUser.uid,
                  email: fbUser.email,
                  displayName: data.name,
                  photoURL: data.profilePhoto,
                  role: data.role,
                  location: data.location,
                  token: data.token
                };
                localStorage.setItem('greenwatch_user', JSON.stringify(this.currentUser));
                localStorage.setItem('greenwatch_token', data.token);
              }
            } catch (err) {
              console.error("Firebase State Sync Error:", err);
            }
          }
        } else {
          this.currentUser = null;
          localStorage.removeItem('greenwatch_user');
          localStorage.removeItem('greenwatch_token');
        }
        this._triggerListeners();
      });
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  _triggerListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  async signInWithEmailAndPassword(email, password) {
    if (isRealFirebase) {
      this.isAuthenticating = true;
      try {
        console.log(`[Real Firebase Auth] Authenticating user: ${email}`);
        let userCredential;
        try {
          userCredential = await fbSignIn(auth, email, password);
        } catch (signInErr) {
          if (email.toLowerCase() === "sauravk1175@gmail.com" && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-login-credentials')) {
            console.log("[Firebase Auth] Admin account not found in Firebase. Auto-creating...");
            userCredential = await fbCreateUser(auth, email, password);
            await fbUpdateProfile(userCredential.user, { displayName: "Admin" });
          } else {
            throw signInErr;
          }
        }
        const fbUser = userCredential.user;

        // Sync and retrieve MongoDB profile and token
        const res = await fetch('/api/auth/sync-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: fbUser.email,
            name: fbUser.displayName || email.split('@')[0]
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Backend authentication sync failed');

        this.currentUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: data.name,
          photoURL: data.profilePhoto,
          role: data.role,
          location: data.location,
          token: data.token
        };

        localStorage.setItem('greenwatch_user', JSON.stringify(this.currentUser));
        localStorage.setItem('greenwatch_token', data.token);
        this._triggerListeners();
        return { user: this.currentUser };
      } finally {
        this.isAuthenticating = false;
      }

    } else {
      // Mock Fallback
      console.log(`[Mock Firebase Auth] Authenticating user: ${email}`);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      this.currentUser = {
        uid: data.id || data._id,
        email: data.email,
        displayName: data.name,
        photoURL: data.profilePhoto,
        role: data.role,
        location: data.location,
        token: data.token
      };

      localStorage.setItem('greenwatch_user', JSON.stringify(this.currentUser));
      localStorage.setItem('greenwatch_token', data.token);
      this._triggerListeners();
      return { user: this.currentUser };
    }
  }

  async createUserWithEmailAndPassword(email, password, name, role, location) {
    if (isRealFirebase) {
      this.isAuthenticating = true;
      try {
        console.log(`[Real Firebase Auth] Registering user: ${email}`);
        const userCredential = await fbCreateUser(auth, email, password);
        const fbUser = userCredential.user;

        // Set details in Firebase Auth
        await fbUpdateProfile(fbUser, { displayName: name });

        // Store other profile parameters (roles, locations) in MongoDB
        const res = await fetch('/api/auth/sync-firebase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: fbUser.email,
            name,
            role,
            location
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Backend registration sync failed');

        this.currentUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: name,
          photoURL: data.profilePhoto,
          role: data.role,
          location: data.location,
          token: data.token
        };

        localStorage.setItem('greenwatch_user', JSON.stringify(this.currentUser));
        localStorage.setItem('greenwatch_token', data.token);
        this._triggerListeners();
        return { user: this.currentUser };
      } finally {
        this.isAuthenticating = false;
      }

    } else {
      // Mock Fallback
      console.log(`[Mock Firebase Auth] Registering user: ${email}`);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, location })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      this.currentUser = {
        uid: data.id || data._id,
        email: data.email,
        displayName: data.name,
        photoURL: data.profilePhoto,
        role: data.role,
        location: data.location,
        token: data.token
      };

      localStorage.setItem('greenwatch_user', JSON.stringify(this.currentUser));
      localStorage.setItem('greenwatch_token', data.token);
      this._triggerListeners();
      return { user: this.currentUser };
    }
  }

  async signOut() {
    if (isRealFirebase) {
      await fbSignOut(auth);
    }
    this.currentUser = null;
    localStorage.removeItem('greenwatch_user');
    localStorage.removeItem('greenwatch_token');
    this._triggerListeners();
    return true;
  }

  async updateProfile(updates) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates };
      localStorage.setItem('greenwatch_user', JSON.stringify(this.currentUser));
      
      if (isRealFirebase && auth.currentUser) {
        await fbUpdateProfile(auth.currentUser, {
          displayName: updates.displayName || auth.currentUser.displayName,
          photoURL: updates.photoURL || auth.currentUser.photoURL
        });
      }
      this._triggerListeners();
    }
  }

  async sendPasswordResetEmail(email) {
    if (isRealFirebase) {
      console.log(`[Real Firebase Auth] Sending password reset email to: ${email}`);
      await fbSendPasswordResetEmail(auth, email);
      return true;
    } else {
      console.log(`[Mock Firebase Auth] Sending password reset email to: ${email}`);
      await new Promise(resolve => setTimeout(resolve, 600));
      return true;
    }
  }
}

const authInstance = new FirebaseAuthWrapper();

export { authInstance as auth };
export default authInstance;
