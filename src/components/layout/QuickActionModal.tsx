import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  PackagePlus,
  Boxes,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { Modal } from '../ui/modal';
import { CreateOrderModal } from '../orders/CreateOrderModal';
import { AddProductModal } from '../inventory/AddProductModal';

export function QuickActionModal() {
  const { isQuickActionModalOpen, setQuickActionModalOpen, addToast } = useUIStore();
  const navigate = useNavigate();

  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const actions = [
    {
      id: 'manual-order',
      title: '+ Create Manual Order',
      description: 'Inject custom enterprise order into the fulfillment queue with feasibility scoring.',
      icon: <Plus className="w-5 h-5 text-indigo-600" />,
      action: () => {
        setQuickActionModalOpen(false);
        setIsManualOrderOpen(true);
      },
    },
    {
      id: 'add-product',
      title: '+ Add Inventory Product',
      description: 'Register a new SKU, assign bin location, and configure safety stock levels.',
      icon: <Boxes className="w-5 h-5 text-blue-600" />,
      action: () => {
        setQuickActionModalOpen(false);
        setIsAddProductOpen(true);
      },
    },
    {
      id: 'log-exception',
      title: 'Log Operational Exception',
      description: 'Report damaged carton, physical stock discrepancy, or packaging failure.',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      action: () => {
        setQuickActionModalOpen(false);
        navigate('/exceptions');
      },
    },
    {
      id: 'create-wave',
      title: 'Create Urgent Pick Wave',
      description: 'Release emergency single-order batch for priority orders near SLA cutoff.',
      icon: <PackagePlus className="w-5 h-5 text-emerald-600" />,
      action: () => {
        setQuickActionModalOpen(false);
        addToast({
          title: 'Pick Wave Initialized',
          description: 'Emergency wave #WAVE-992 released to Zone A & B pickers.',
          type: 'success',
        });
        navigate('/picking');
      },
    },
    {
      id: 'replenish',
      title: 'Trigger Bulk Stock Replenishment',
      description: 'Generate supplier purchase orders for low-stock buffer bins across all zones.',
      icon: <RefreshCw className="w-5 h-5 text-amber-600" />,
      action: () => {
        setQuickActionModalOpen(false);
        addToast({
          title: 'Batch PO Replenishment Dispatched',
          description: 'EDI purchase orders transmitted to Tier-1 distributors for 6 low-stock SKUs.',
          type: 'success',
        });
        navigate('/inventory');
      },
    },
  ];

  return (
    <>
      <Modal
        isOpen={isQuickActionModalOpen}
        onClose={() => setQuickActionModalOpen(false)}
        title="Warehouse Quick Actions"
        description="Select an operational action to execute immediately across the facility."
        maxWidth="md"
      >
        <div className="space-y-2.5">
          {actions.map((act) => (
            <button
              key={act.id}
              onClick={act.action}
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle hover:border-gray-300 transition-all text-left group shadow-subtle"
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-md bg-surface-subtle border border-border group-hover:bg-white transition-colors">
                  {act.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary-700 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-foreground-secondary mt-0.5 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-foreground-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all ml-3 shrink-0" />
            </button>
          ))}
        </div>
      </Modal>

      {/* Nested Modals */}
      <CreateOrderModal
        isOpen={isManualOrderOpen}
        onClose={() => setIsManualOrderOpen(false)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </>
  );
}
