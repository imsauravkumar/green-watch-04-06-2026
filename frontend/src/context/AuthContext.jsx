import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase / Mock Auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email, password, name, role, location) => {
    setLoading(true);
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password, name, role, location);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    try {
      await auth.sendPasswordResetEmail(email);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileDetails = async (name, location, profilePhoto) => {
    const token = localStorage.getItem('greenwatch_token');
    
    // Call backend API to persist details
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, location, profilePhoto })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Profile update failed');
    }

    // Sync state locally
    const updatedUser = {
      ...user,
      displayName: data.name,
      location: data.location,
      photoURL: data.profilePhoto
    };
    
    setUser(updatedUser);
    localStorage.setItem('greenwatch_user', JSON.stringify(updatedUser));
    await auth.updateProfile({
      displayName: data.name,
      photoURL: data.profilePhoto
    });

    return updatedUser;
  };

  const isAdmin = user?.role === 'admin';
  const isFarmer = user?.role === 'farmer' || user?.role === 'both';
  const isSeller = user?.role === 'seller' || user?.role === 'both';
  const isBoth = user?.role === 'both';

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateProfileDetails,
    isAdmin,
    isFarmer,
    isSeller,
    isBoth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
