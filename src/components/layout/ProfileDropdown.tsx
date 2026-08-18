import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Activity,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { CURRENT_USER } from '../../lib/constants';
import { useUIStore } from '../../store/useUIStore';
import { ProfileModal } from './ProfileModal';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleEndDemoSession = async () => {
    setIsOpen(false);
    addToast({
      title: 'Demo Session Refreshed',
      description: 'Logged out and seamlessly re-authenticated in silent anonymous mode.',
      type: 'info',
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-surface-subtle border border-transparent hover:border-border transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile and settings"
      >
        <div className="relative">
          <img
            src={CURRENT_USER.avatarUrl}
            alt={CURRENT_USER.name}
            className="h-7 w-7 rounded-full object-cover border border-border shadow-subtle group-hover:border-primary-400 transition-colors"
          />
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[110px]">
            {CURRENT_USER.name}
          </span>
          <span className="text-[10px] text-foreground-secondary leading-tight truncate max-w-[110px]">
            Ops Manager
          </span>
        </div>
        <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-foreground-tertiary group-hover:text-foreground transition-colors ml-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-lg border border-border bg-white shadow-dropdown py-1.5 z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header Info */}
          <div className="px-3.5 py-2.5 border-b border-border/80 bg-[#F8FAFC]">
            <div className="font-bold text-foreground">{CURRENT_USER.name}</div>
            <div className="text-[11px] text-foreground-secondary truncate">Ops Manager · {CURRENT_USER.email}</div>
            <div className="flex items-center space-x-1.5 mt-1.5 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-800">Online · Facility Lead</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsProfileModalOpen(true);
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-foreground hover:bg-surface-subtle hover:text-primary-700 transition-colors text-left font-medium"
            >
              <User className="w-4 h-4 text-foreground-tertiary" />
              <span>View Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-foreground hover:bg-surface-subtle hover:text-primary-700 transition-colors text-left font-medium"
            >
              <Settings className="w-4 h-4 text-foreground-tertiary" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/analytics');
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-foreground hover:bg-surface-subtle hover:text-primary-700 transition-colors text-left font-medium"
            >
              <Activity className="w-4 h-4 text-foreground-tertiary" />
              <span>Activity & Telemetry Log</span>
            </button>
          </div>

          {/* End Demo Session Action */}
          <div className="p-1 pt-1.5 border-t border-border/80">
            <button
              onClick={handleEndDemoSession}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>End Demo Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Operator Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
