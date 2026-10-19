import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Scissors, MessageSquarePlus, LogOut, Trash2, Menu, X, Shield, Pin, Edit2, Check } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';

const SidebarLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Pinned chats persisted in localStorage
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('escapement_pinned_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Delete confirmation state
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Rename title state
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/chat/sessions');
      setSessions(res.data || []);
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

  const togglePin = (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedIds(prev => {
      const next = prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId];
      try {
        localStorage.setItem('escapement_pinned_sessions', JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save pinned chats", err);
      }
      return next;
    });
  };

  const handleStartEdit = (e, session) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmingDeleteId(null);
    setEditingSessionId(session.id);
    setEditingTitle(session.title || 'Chat');
  };

  const handleSaveEdit = async (e, sessionId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cleanTitle = editingTitle.trim();
    if (!cleanTitle) {
      setEditingSessionId(null);
      return;
    }
    try {
      await axios.patch(`/api/chat/sessions/${sessionId}`, { title: cleanTitle });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: cleanTitle } : s));
    } catch (err) {
      console.error("Failed to update chat title", err);
    } finally {
      setEditingSessionId(null);
    }
  };

  const handleRequestDelete = (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSessionId(null);
    setConfirmingDeleteId(sessionId);
  };

  const executeDeleteSession = async (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(sessionId);
    try {
      await axios.delete(`/api/chat/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setPinnedIds(prev => {
        const next = prev.filter(id => id !== sessionId);
        try {
          localStorage.setItem('escapement_pinned_sessions', JSON.stringify(next));
        } catch {}
        return next;
      });
      setConfirmingDeleteId(null);
      if (location.pathname.includes(sessionId)) {
        navigate('/dashboard/chat');
      }
    } catch (err) {
      console.error("Failed to delete session", err);
      alert("Failed to delete chat session. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };


  const pinnedSessions = sessions.filter(s => pinnedIds.includes(s.id));
  const recentSessions = sessions.filter(s => !pinnedIds.includes(s.id));

  const renderSessionItem = (s) => {
    const isPinned = pinnedIds.includes(s.id);
    const isConfirming = confirmingDeleteId === s.id;
    const isEditing = editingSessionId === s.id;

    if (isConfirming) {
      return (
        <div 
          key={s.id} 
          className="flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs shadow-sm my-0.5 animate-fadeIn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <span className="text-red-400 font-mono text-[10px] font-bold whitespace-nowrap">
            Are you sure?
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setConfirmingDeleteId(null);
              }}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono text-paper/70 hover:text-paper hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => executeDeleteSession(e, s.id)}
              disabled={deletingId === s.id}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-red-500 text-white font-bold hover:bg-red-600 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {deletingId === s.id ? '...' : 'Confirm'}
            </button>
          </div>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div 
          key={s.id} 
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 border border-lime/40 my-0.5"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit(e, s.id);
              if (e.key === 'Escape') setEditingSessionId(null);
            }}
            autoFocus
            className="w-full bg-transparent text-xs text-paper focus:outline-none font-mono"
            placeholder="Chat title..."
          />
          <button
            type="button"
            onClick={(e) => handleSaveEdit(e, s.id)}
            className="p-1 rounded text-lime hover:bg-lime/10 cursor-pointer flex-shrink-0"
            title="Save title"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setEditingSessionId(null)}
            className="p-1 rounded text-paper/40 hover:text-paper cursor-pointer flex-shrink-0"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div key={s.id} className="group relative flex items-center">
        <NavLink 
          to={`/dashboard/chat/${s.id}`} 
          className={({ isActive }) => 
            `w-full pl-3 pr-20 py-2 text-sm rounded-xl truncate transition-colors flex items-center gap-2 ${
              isActive 
                ? 'bg-white/10 text-paper font-medium border border-white/10' 
                : 'text-paper/60 hover:bg-white/5 hover:text-paper'
            }` 
          }
        >
          {isPinned && <Pin className="w-3 h-3 text-lime fill-lime flex-shrink-0" />}
          <span className="truncate">{s.title || 'Untitled chat'}</span>
        </NavLink>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-1.5 flex items-center gap-0.5 bg-ink/90 backdrop-blur-sm rounded-lg px-1 py-0.5 border border-white/5">
          <button
            type="button"
            onClick={(e) => togglePin(e, s.id)}
            className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
              isPinned ? 'text-lime' : 'text-paper/40 hover:text-lime'
            }`}
            title={isPinned ? "Unpin chat" : "Pin chat"}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-lime' : ''}`} />
          </button>
          <button
            type="button"
            onClick={(e) => handleStartEdit(e, s)}
            className="p-1 rounded text-paper/40 hover:text-paper hover:bg-white/10 transition-colors cursor-pointer"
            title="Rename chat"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => handleRequestDelete(e, s.id)}
            className="p-1 rounded text-paper/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Delete chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
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
                    ? 'bg-lime text-white shadow-lg shadow-blue-600/25' 
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
                    ? 'bg-lime text-white shadow-lg shadow-blue-600/25' 
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
                    ? 'bg-lime text-white shadow-lg shadow-blue-600/25' 
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
                    ? 'bg-lime/15 text-lime border border-lime/30 font-bold' 
                    : 'bg-white/5 hover:bg-white/10 text-paper border border-white/10'
                }` 
              }
            >
              <MessageSquarePlus className="w-4 h-4 flex-shrink-0" />
              <span>New chat</span>
            </NavLink>
          </div>

          <div className="flex-1 overflow-y-auto" data-lenis-prevent>
            {/* Pinned Chats Section */}
            {pinnedSessions.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 px-3 mb-2">
                  <Pin className="w-3 h-3 text-lime fill-lime" />
                  <span className="font-mono text-[10px] font-bold text-lime uppercase tracking-widest">
                    Pinned Chats ({pinnedSessions.length})
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {pinnedSessions.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* Recent / Chat History Section */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="font-mono text-[10px] font-bold text-paper/40 uppercase tracking-widest">
                  {pinnedSessions.length > 0 ? 'Recent Chats' : 'Chat History'}
                </span>
                <span className="text-[10px] font-mono text-paper/30">{recentSessions.length}</span>
              </div>
              <div className="flex flex-col gap-1 mb-6">
                {recentSessions.map(renderSessionItem)}
                {sessions.length === 0 && (
                  <div className="px-3 py-2 text-xs text-paper/30 font-mono italic">No history yet</div>
                )}
              </div>
            </div>
          </div>

          {/* User Profile & Auth Status */}
          <div className="pt-3 pb-2 border-t border-white/10 flex flex-col gap-2 relative">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group"
                    title="Click to view profile details"
                  >
                    <div className="w-8 h-8 rounded-full bg-lime/20 border border-lime/30 text-lime flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-paper truncate leading-tight group-hover:text-lime transition-colors">
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

                {/* Anchored Dropdown (opens upwards from sidebar bottom) */}
                <ProfileDropdown 
                  isOpen={isProfileOpen} 
                  onClose={() => setIsProfileOpen(false)} 
                  position="top-left" 
                />
              </>
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
