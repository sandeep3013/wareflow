import {
  Mail,
  Building,
  KeyRound,
  Zap,
} from 'lucide-react';
import { CURRENT_USER } from '../../lib/constants';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Operator Profile & Facility Credentials"
      description="Active session credentials and authorization levels for warehouse operations."
      maxWidth="md"
    >
      <div className="space-y-5 text-xs">
        {/* Header Avatar & Identity */}
        <div className="flex items-center space-x-4 p-4 rounded-lg bg-surface-subtle border border-border">
          <div className="relative">
            <img
              src={CURRENT_USER.avatarUrl}
              alt={CURRENT_USER.name}
              className="h-14 w-14 rounded-full object-cover border-2 border-primary-500 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{CURRENT_USER.name}</h3>
            <span className="text-xs text-primary-700 font-semibold">{CURRENT_USER.role}</span>
            <div className="flex items-center space-x-1.5 text-foreground-secondary text-[11px] mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{CURRENT_USER.email}</span>
            </div>
          </div>
        </div>

        {/* Facility & Shift Telemetry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-surface-subtle border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-foreground-secondary flex items-center gap-1">
              <Building className="w-3 h-3 text-primary-600" />
              Facility Hub
            </span>
            <span className="text-xs font-bold text-foreground block">ORD-1 Central Hub</span>
            <span className="text-[10px] text-foreground-tertiary">Chicago, IL (Zone A-D)</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-subtle border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-foreground-secondary flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" />
              Active Shift
            </span>
            <span className="text-xs font-bold text-foreground block">First Shift (06:00 - 14:30)</span>
            <span className="text-[10px] text-emerald-700 font-semibold">● Lead Supervisor</span>
          </div>
        </div>

        {/* System Permissions Matrix */}
        <div className="p-4 rounded-lg bg-white border border-border space-y-3 shadow-subtle">
          <div className="flex items-center space-x-2 text-foreground font-bold">
            <KeyRound className="w-4 h-4 text-primary-600" />
            <span>Granted Operational Permissions</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
              <span>✓ Manual Order Release</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
              <span>✓ Inventory Cycle Count</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
              <span>✓ Inter-Bin Stock Transfer</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
              <span>✓ Supervisor Override</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
}
