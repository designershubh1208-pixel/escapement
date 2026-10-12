import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Scissors, MessageSquarePlus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const SidebarLayout = () => {
  const [sessions, setSessions] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get('/api/chat/sessions');
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      }
    };
    fetchSessions();
  }, [location.pathname]); // refetch when navigating to a new chat

  return (
    <div className="min-h-screen bg-ink flex pt-24">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-ink/50 backdrop-blur-md flex flex-col hidden md:flex h-[calc(100vh-6rem)] sticky top-24">
        <div className="p-4 flex flex-col h-full">
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
                <NavLink 
                  key={s.id}
                  to={`/dashboard/chat/${s.id}`} 
                  className={({ isActive }) => 
                    `px-4 py-2 text-sm rounded-lg truncate transition-colors ${isActive ? 'bg-white/10 text-paper font-medium' : 'text-paper/50 hover:bg-white/5 hover:text-paper/80'}` 
                  }
                >
                  {s.title}
                </NavLink>
              ))}
              {sessions.length === 0 && (
                <div className="px-4 py-2 text-sm text-paper/30 italic">No history yet</div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between px-2">
            <span className="text-xs font-mono text-paper/50">Theme</span>
            <ThemeToggle showLabel={true} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-[calc(100vh-6rem)]" data-lenis-prevent>
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
