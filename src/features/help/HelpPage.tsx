import { useState } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Zap,
  Navigation,
  GitMerge,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Keyboard,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { useUIStore } from '../../store/useUIStore';

export function HelpPage() {
  const { addToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const decisionEngines = [
    {
      id: 'priority',
      name: '1. Order Priority Engine',
      description: 'Scores incoming orders deterministically from 0 to 100 based on contractual SLA cutoffs (+40), customer contract tiers (+25), shipping method (+20), and order value (+15).',
      icon: <Zap className="w-5 h-5 text-indigo-600" />,
      sample: 'Score 92/100 (CRITICAL) = Same-Day Air (40) + Enterprise VIP (25) + $2.4k Value (18) + Top Queue (9)',
    },
    {
      id: 'allocation',
      name: '2. Inventory Allocation Engine',
      description: 'Evaluates pending order demand against physical bins using FIFO batch reservations and proximity heuristics. Automatically flags shortages for emergency triage.',
      icon: <GitMerge className="w-5 h-5 text-blue-600" />,
      sample: 'Requested: 10, Available: 7 → Allocates 7 units, flags 3 for emergency stock reallocation.',
    },
    {
      id: 'picking',
      name: '3. Serpentine Route Optimizer',
      description: 'Generates non-retracing S-Shape travel paths across warehouse aisles, reducing walking distance by 20–30% and eliminating multi-picker congestion.',
      icon: <Navigation className="w-5 h-5 text-emerald-600" />,
      sample: 'Route: Start → A-03 → B-04 → C-02 → Pack P1. Distance reduced from 142m to 108m.',
    },
    {
      id: 'forecast',
      name: '4. Stockout Risk Forecast Engine',
      description: 'Computes velocity-adjusted days of supply (OnHand / DailyVelocity) and triggers automated reorders before stock drops below safety buffers.',
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      sample: 'Depletion Horizon: 1.8 days remaining → Reorder Recommendation: 150 units from vendor.',
    },
    {
      id: 'bottleneck',
      name: '5. Floor Bottleneck Detector',
      description: 'Monitors pick speeds across warehouse zones. Flags zones where variance exceeds +50% above baseline and recommends dynamic labor rebalancing.',
      icon: <BookOpen className="w-5 h-5 text-purple-600" />,
      sample: 'Zone B: 5.8 mins/order (+65% variance) → Rebalance 2 pickers from Zone A to Zone B.',
    },
    {
      id: 'exceptions',
      name: '6. Autonomous Exception Engine',
      description: 'Detects operational anomalies, evaluates alternative resolution options, scores decision confidence (0–100%), and presents explainable actions to supervisors.',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
      sample: 'Confidence: 94% → Recommendation: Reallocate from low-priority ground orders to protect SLA.',
    },
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'How does WAREFLOW handle stock shortages when multiple orders compete for the same SKU?',
      answer: 'The platform evaluates order priority scores (SLA urgency + Customer Tier). Available stock is allocated to the higher-scoring order, while the remaining demand is logged as an Operational Exception with recommendations to reallocate from lower-priority ground shipments or split the parcel.',
    },
    {
      id: 'faq-2',
      question: 'What happens when an operator reports damaged inventory during picking?',
      answer: 'Marking an item as damaged immediately moves those units to the Quarantined balance, recalculates available inventory for future pick waves, and logs an Operational Exception for scrap write-off and supplier RMA replacement.',
    },
    {
      id: 'faq-3',
      question: 'How does the Serpentine Picking algorithm save travel time?',
      answer: 'Instead of having pickers crisscross randomly across warehouse aisles, the serpentine optimizer sequences bin stops in an S-curve through the racks (Aisles A → B → C), cutting travel distance by up to 24%.',
    },
    {
      id: 'faq-4',
      question: 'Can supervisors override automated decision recommendations?',
      answer: 'Yes. In the Decision Detail Drawer, clicking "Supervisor Override" allows entering custom operational notes and executing manual allocation paths while maintaining a permanent audit trail.',
    },
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSupportModalOpen(false);
    addToast({
      title: 'Support Ticket Transmitted',
      description: `Ticket #SUP-${Math.floor(1000 + Math.random() * 9000)} created. Ops support team notified.`,
      type: 'success',
    });
    setTicketSubject('');
    setTicketMessage('');
  };

  const filteredEngines = decisionEngines.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Help & Operations Knowledge Center"
        description="Comprehensive documentation on autonomous fulfillment engines, decision explainability, picking optimization, and troubleshooting."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            v2.4 Knowledgebase
          </span>
        }
        actions={
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Keyboard className="w-3.5 h-3.5" />}
              onClick={() => setIsKeyboardModalOpen(true)}
            >
              Shortcuts
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={() => setIsSupportModalOpen(true)}
              className="font-semibold shadow-xs"
            >
              Contact Support
            </Button>
          </div>
        }
      />

      {/* Search Header Banner */}
      <div className="p-6 rounded-lg bg-[#0B0F19] text-white space-y-4 shadow-card">
        <div className="max-w-xl space-y-1">
          <h2 className="text-base font-bold text-white">How can we assist your warehouse operations?</h2>
          <p className="text-xs text-gray-400">
            Search operational procedures, decision engine formulas, or shortcut commands.
          </p>
        </div>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search engines, allocation logic, picking routes, exceptions..."
            className="w-full h-9 pl-9 pr-3 rounded-md bg-gray-900/90 border border-gray-700 text-xs text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* Decision Engine Breakdown Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">How WAREFLOW Makes Autonomous Decisions</h3>
          <p className="text-xs text-foreground-secondary">
            Deterministic rule engines replace opaque algorithms with transparent, mathematically explainable actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEngines.map((eng) => (
            <Card key={eng.id} className="p-4 space-y-3 shadow-subtle hover:border-primary-300 transition-colors">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-surface-subtle border border-border">
                  {eng.icon}
                </div>
                <h4 className="font-bold text-xs text-foreground">{eng.name}</h4>
              </div>
              <p className="text-xs text-foreground-secondary leading-relaxed">{eng.description}</p>
              <div className="p-2.5 rounded bg-surface-subtle border border-border text-[11px] font-mono text-foreground-secondary">
                <span className="font-bold text-foreground block mb-0.5">Example Telemetry:</span>
                {eng.sample}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions (Operations FAQ)</CardTitle>
          <CardDescription>Common questions regarding warehouse fulfillment and exception triage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-border rounded-lg overflow-hidden transition-all bg-white"
              >
                <button
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-foreground hover:bg-surface-subtle transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-primary-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-foreground-tertiary shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-foreground-secondary border-t border-border/60 bg-[#F8FAFC]/50 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={isKeyboardModalOpen}
        onClose={() => setIsKeyboardModalOpen(false)}
        title="Global Keyboard Shortcuts"
        description="Speed up your operations workflow with built-in hotkeys."
        maxWidth="md"
      >
        <div className="space-y-3 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded bg-surface-subtle border border-border">
              <span className="text-foreground font-medium">Open Global Command Palette</span>
              <kbd className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-border">Ctrl + K / ⌘ + K</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-surface-subtle border border-border">
              <span className="text-foreground font-medium">Close Active Modal / Drawer</span>
              <kbd className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-border">Esc</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-surface-subtle border border-border">
              <span className="text-foreground font-medium">Quick Jump in Command Palette</span>
              <kbd className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-border">↑ / ↓ + Enter</kbd>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsKeyboardModalOpen(false)}>
              Got It
            </Button>
          </div>
        </div>
      </Modal>

      {/* Support Ticket Modal */}
      <Modal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        title="Contact Operations Support"
        description="Submit an urgent hardware or facility escalation ticket."
        maxWidth="md"
      >
        <form onSubmit={handleSupportSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-foreground block mb-1">Issue Subject</label>
            <input
              type="text"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. Zebra ZT411 thermal label printer offline in Station P1"
              required
              className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-foreground block mb-1">Detailed Description</label>
            <textarea
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Provide steps to reproduce or affected bin / station IDs..."
              required
              className="w-full h-20 p-2 rounded border border-border bg-white text-xs"
            />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsSupportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
