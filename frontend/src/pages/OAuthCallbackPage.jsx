import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
        setTimeout(() => navigate(`/login?error=${encodeURIComponent(error)}`), 2500);
        return;
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('Authentication token missing from provider.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        // Save token to localStorage and configure axios
        localStorage.setItem('defai_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user profile
        const userRes = await axios.get('/api/auth/me');
        if (userRes.data) {
          localStorage.setItem('defai_user', JSON.stringify(userRes.data));
        }

        setStatus('success');
        // Force reload or redirect to dashboard to populate auth state
        setTimeout(() => {
          window.location.href = '/dashboard/chat';
        }, 500);
      } catch (err) {
        console.error('OAuth profile retrieval failed:', err);
        setStatus('error');
        setErrorMessage('Failed to finalize authentication session.');
        setTimeout(() => navigate('/login'), 2500);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#070907] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl p-8 bg-[#121613] border border-white/10 text-center space-y-4 shadow-2xl">
        {status === 'processing' && (
          <>
            <RefreshCw className="w-10 h-10 text-[#22c55e] animate-spin mx-auto" />
            <h2 className="text-xl font-bold font-display">Authenticating with Provider...</h2>
            <p className="text-xs text-white/60">Fetching verified profile and launching your session.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-[#22c55e] mx-auto" />
            <h2 className="text-xl font-bold font-display text-[#22c55e]">Authentication Verified!</h2>
            <p className="text-xs text-white/60">Entering your DeFAI Sentinel dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold font-display text-red-400">Authentication Error</h2>
            <p className="text-xs text-red-300">{errorMessage}</p>
            <p className="text-[11px] text-white/40 pt-2">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
