import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Scissors, MessageSquarePlus, LogOut, Trash2, Menu, X, Shield } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const SidebarLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/chat/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [location.pathname, user?.id]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleDeleteSession = async (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.delete(`/api/chat/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (location.pathname.includes(sessionId)) {
        navigate('/dashboard/chat');
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-ink/80 backdrop-blur-md sticky top-0 z-40">
        <Link to="/" className="text-paper hover:text-lime transition-colors flex items-center gap-2" title="Go to Landing Page">
          <Logo className="h-[22px] w-auto object-contain" />
          <span className="font-display font-bold text-lg tracking-tight">Escapement</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-paper hover:text-lime transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside className={`
        w-64 border-r border-white/10 bg-ink/95 md:bg-ink/50 backdrop-blur-md flex flex-col h-screen sticky top-0 z-50
        transition-transform duration-200 ease-in-out
        fixed inset-y-0 left-0 md:static
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex flex-col h-full">
          {/* Logo Brand Header linking to Landing Page */}
          <div className="pb-4 mb-4 border-b border-white/10 px-1 flex items-center justify-between">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2.5 text-paper hover:text-lime transition-colors group"
              title="Go to Landing Page"
            >
              <Logo className="h-[24px] w-auto object-contain" />
              <span className="font-display font-bold text-[1.25rem] tracking-tight group-hover:text-lime transition-colors">
                Escapement
              </span>
            </Link>
            <button 
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-paper/60 hover:text-paper hover:bg-white/5 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <NavLink 
              to="/dashboard/request" 
              className={({ isActive }) => 
                `flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold transition-all shadow-sm text-sm ${
                  isActive 
                    ? 'bg-lime text-ink shadow-lime/20' 
                    : 'bg-white/5 hover:bg-white/10 text-paper border border-white/10'
                }` 
              }
            >
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Buying / Orders</span>
            </NavLink>

            <NavLink 
              to="/dashboard/subscriptions" 
              className={({ isActive }) => 
                `flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold transition-all shadow-sm text-sm ${
                  isActive 
                    ? 'bg-lime text-ink shadow-lime/20' 
                    : 'bg-white/5 hover:bg-white/10 text-paper border border-white/10'
                }` 
              }
            >
              <Scissors className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Subscription Terminator</span>
            </NavLink>

            <NavLink 
              to="/dashboard/limits" 
              className={({ isActive }) => 
                `flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold transition-all shadow-sm text-sm ${
                  isActive 
                    ? 'bg-lime text-ink shadow-lime/20' 
                    : 'bg-white/5 hover:bg-white/10 text-paper border border-white/10'
                }` 
              }
            >
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Spending Limits</span>
            </NavLink>

            <NavLink 
              to="/dashboard/chat" 
              className={({ isActive }) => 
                `flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold transition-all shadow-sm text-sm ${
                  isActive 
                    ? 'bg-white/20 text-paper border border-white/30' 
                    : 'bg-white/5 hover:bg-white/10 text-paper border border-white/10'
                }` 
              }
            >
              <MessageSquarePlus className="w-4 h-4 flex-shrink-0" />
              <span>New chat</span>
            </NavLink>
          </div>

          <div className="flex-1 overflow-y-auto" data-lenis-prevent>
            <h3 className="font-mono text-xs text-paper/40 mb-3 px-4">Chat History</h3>
            <div className="flex flex-col gap-1 mb-6">
              {sessions.map(s => (
                <div key={s.id} className="group relative flex items-center">
                  <NavLink 
                    to={`/dashboard/chat/${s.id}`} 
                    className={({ isActive }) => 
                      `w-full pl-3 pr-8 py-2 text-sm rounded-lg truncate transition-colors ${isActive ? 'bg-white/10 text-paper font-medium' : 'text-paper/50 hover:bg-white/5 hover:text-paper/80'}` 
                    }
                  >
                    {s.title}
                  </NavLink>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(e, s.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-white/30 transition-opacity absolute right-2 p-1 cursor-pointer"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="px-4 py-2 text-sm text-paper/30 italic">No history yet</div>
              )}
            </div>
          </div>

          {/* User Profile & Auth Status */}
          <div className="pt-3 pb-2 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-lime/20 border border-lime/30 text-lime flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-paper truncate leading-tight">
                      {user?.name || 'Sentinel User'}
                    </p>
                    <p className="text-[10px] font-mono text-paper/50 truncate">
                      {user?.phone_number || user?.email || 'Verified Agent'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-paper/40 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-lime/10 border border-lime/20 text-lime hover:bg-lime/20 text-xs font-bold transition-colors"
              >
                <span>Sign In / Register</span>
              </NavLink>
            )}

            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-mono text-paper/50">Theme</span>
              <ThemeToggle showLabel={true} />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-[calc(100vh-57px)] md:h-screen" data-lenis-prevent>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid"></div>
        </div>
        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
