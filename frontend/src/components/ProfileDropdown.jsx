import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ShoppingCart, 
  Scissors, 
  MessageSquarePlus, 
  LogOut, 
  Copy, 
  Check, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = ({ isOpen, onClose, position = 'bottom-right' }) => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  if (!isOpen) return null;

  const initial = user?.name ? user.name[0].toUpperCase() : 'U';

  // Positioning classes
  const positionClasses = position === 'top-left'
    ? 'bottom-full left-0 mb-2' 
    : 'top-full right-0 mt-2';

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: position === 'top-left' ? 6 : -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: position === 'top-left' ? 6 : -6, scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute ${positionClasses} w-72 rounded-2xl bg-ink/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-1.5 z-50 text-paper select-none`}
    >
      {/* User Header Profile */}
      <div className="p-3 pb-2.5 rounded-xl bg-white/[0.03] border border-white/5 mb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-lime/20 border border-lime/30 text-lime font-bold text-sm flex items-center justify-center flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-paper truncate leading-tight">
                {user?.name || 'Sentinel User'}
              </p>
              <CheckCircle2 className="w-3.5 h-3.5 text-lime flex-shrink-0" title="Verified Account" />
            </div>
            <p className="text-[11px] font-mono text-paper/50 truncate mt-0.5 leading-tight" title={user?.email || ''}>
              {user?.email || user?.phone_number || 'Agent'}
            </p>
          </div>
        </div>

        {/* User ID copy bar */}
        {user?.id && (
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-paper/40">
            <span>ID: {user.id.slice(0, 12)}...</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1 text-[10px] hover:text-lime transition-colors cursor-pointer"
              title="Copy full user ID"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-lime" />
                  <span className="text-lime">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Shortcuts */}
      <div className="space-y-0.5 py-1">
        <Link
          to="/dashboard/chat"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-paper/80 hover:text-paper hover:bg-white/10 transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <MessageSquarePlus className="w-4 h-4 text-lime" />
            <span>Q&A Chat</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-paper/30 group-hover:text-paper/60 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/dashboard/limits"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-paper/80 hover:text-paper hover:bg-white/10 transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-lime" />
            <span>Spending Limits</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-paper/30 group-hover:text-paper/60 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/dashboard/request"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-paper/80 hover:text-paper hover:bg-white/10 transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <ShoppingCart className="w-4 h-4 text-lime" />
            <span>Buying & Orders</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-paper/30 group-hover:text-paper/60 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/dashboard/subscriptions"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-paper/80 hover:text-paper hover:bg-white/10 transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <Scissors className="w-4 h-4 text-lime" />
            <span>Subscriptions</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-paper/30 group-hover:text-paper/60 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Divider */}
      <div className="my-1 border-t border-white/10" />

      {/* Footer Actions */}
      <button
        type="button"
        onClick={() => {
          onClose();
          logout();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-paper/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out</span>
      </button>
    </motion.div>
  );
};

export default ProfileDropdown;
