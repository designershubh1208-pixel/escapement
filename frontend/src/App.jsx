import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/ServicesPage';
import WorkPage from './pages/WorkPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import InsightsPage from './pages/InsightsPage';
import InsightDetailPage from './pages/InsightDetailPage';
import ChatInterface from './pages/ChatInterface';
import SubscriptionTerminatorPage from './pages/SubscriptionTerminatorPage';
import PolicyConfigurator from './pages/PolicyConfigurator';
import SidebarLayout from './components/SidebarLayout';
import QnAPage from './pages/QnAPage';
import AuthPage from './pages/AuthPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function AppContent({ isLoading }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthPage = ['/login', '/register', '/auth', '/auth/callback'].includes(location.pathname);

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!isLoading && (
        <div className="App">
          {!isAuthPage && !isDashboard && location.pathname !== '/' && <Header />}
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage defaultMode="login" />} />
              <Route path="/register" element={<AuthPage defaultMode="register" />} />
              <Route path="/auth" element={<AuthPage defaultMode="login" />} />
              <Route path="/auth/callback" element={<OAuthCallbackPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/insights/:id" element={<InsightDetailPage />} />
              <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
              <Route path="/subscriptions" element={<Navigate to="/dashboard/subscriptions" replace />} />
              <Route path="/policy" element={<Navigate to="/dashboard/limits" replace />} />
              <Route path="/limits" element={<Navigate to="/dashboard/limits" replace />} />
              <Route path="/dashboard" element={<SidebarLayout />}>
                <Route index element={<Navigate to="chat" replace />} />
                <Route path="chat" element={<QnAPage />} />
                <Route path="chat/:id" element={<QnAPage />} />
                <Route path="request" element={<ChatInterface />} />
                <Route path="subscriptions" element={<SubscriptionTerminatorPage />} />
                <Route path="limits" element={<PolicyConfigurator />} />
                <Route path="policy" element={<Navigate to="limits" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {!isDashboard && !isAuthPage && location.pathname !== '/' && <Footer />}
        </div>
      )}
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    if (isLoading) {
      lenis.stop();
      // Mock loading complete for splash
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    } else {
      lenis.start();
    }

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isLoading]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent isLoading={isLoading} />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;