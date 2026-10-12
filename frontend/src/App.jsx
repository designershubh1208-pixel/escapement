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
import SidebarLayout from './components/SidebarLayout';
import QnAPage from './pages/QnAPage';
import { ThemeProvider } from './context/ThemeContext';

function AppContent({ isLoading }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!isLoading && (
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/insights/:id" element={<InsightDetailPage />} />
              <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
              <Route path="/subscriptions" element={<Navigate to="/dashboard/subscriptions" replace />} />
              <Route path="/dashboard" element={<SidebarLayout />}>
                <Route index element={<Navigate to="chat" replace />} />
                <Route path="chat" element={<QnAPage />} />
                <Route path="chat/:id" element={<QnAPage />} />
                <Route path="request" element={<ChatInterface />} />
                <Route path="subscriptions" element={<SubscriptionTerminatorPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {!isDashboard && <Footer />}
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
        <AppContent isLoading={isLoading} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;