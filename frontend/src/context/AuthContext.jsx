import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('defai_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('defai_token') || null);
  const [loading, setLoading] = useState(true);

  // Configure Axios default header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('defai_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('defai_token');
      localStorage.removeItem('defai_user');
    }
  }, [token]);

  // Load user profile on startup if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('defai_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
        localStorage.setItem('defai_user', JSON.stringify(res.data));
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const saveAuthSession = (authData) => {
    if (authData.access_token) {
      setToken(authData.access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authData.access_token}`;
      localStorage.setItem('defai_token', authData.access_token);
    }
    if (authData.user) {
      setUser(authData.user);
      localStorage.setItem('defai_user', JSON.stringify(authData.user));
    }
  };

  // Send Email OTP with credentials check
  const sendOtp = async (target, purpose = 'login') => {
    let payload = {};
    if (typeof target === 'object' && target !== null) {
      payload = {
        email: target.email || null,
        password: target.password || null,
        name: target.name || null,
        phone_number: target.phoneNumber || target.phone_number || null,
        purpose: target.purpose || purpose,
      };
    } else if (typeof target === 'string') {
      if (target.includes('@')) {
        payload = { email: target.trim(), purpose };
      } else {
        payload = { phone_number: target.trim(), purpose };
      }
    }
    const res = await axios.post('/api/auth/otp/send', payload);
    return res.data;
  };

  // Verify Email OTP and complete login / registration
  const verifyOtp = async ({ email = null, phoneNumber = null, otpCode, purpose = 'login', name = null, password = null }) => {
    const res = await axios.post('/api/auth/otp/verify', {
      email: email ? email.trim() : null,
      password: password || null,
      phone_number: phoneNumber ? phoneNumber.trim() : null,
      otp_code: otpCode.trim(),
      purpose,
      name: name ? name.trim() : null,
    });
    saveAuthSession(res.data);
    return res.data;
  };

  // Login with Password
  const loginWithPassword = async (identifier, password) => {
    const res = await axios.post('/api/auth/login', {
      identifier,
      password,
    });
    saveAuthSession(res.data);
    return res.data;
  };

  // Register with Password
  const registerWithPassword = async ({ phoneNumber, email, name, password, otpCode }) => {
    const res = await axios.post('/api/auth/register', {
      phone_number: phoneNumber || null,
      email: email || null,
      name: name || null,
      password,
      otp_code: otpCode || null,
    });
    saveAuthSession(res.data);
    return res.data;
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      // ignore logout failure
    }
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('defai_token');
    localStorage.removeItem('defai_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        sendOtp,
        verifyOtp,
        loginWithPassword,
        registerWithPassword,
        logout,
      }}
    >
      {children}
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
