import { useState } from 'react';
import {
  Sliders,
  Bell,
  Palette,
  Server,
  Save,
  RotateCcw,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { useUIStore } from '../../store/useUIStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function SettingsPage() {
  const { settings, updateSetting, resetToDefaults } = useSettingsStore();
  const { resetOrders } = useOrderStore();
  const { resetInventory } = useInventoryStore();
  const { resetExceptions } = useExceptionStore();
  const { addToast } = useUIStore();

  const [activeSection, setActiveSection] = useState<'general' | 'operations' | 'notifications' | 'appearance' | 'system'>('general');

  const handleSave = () => {
    addToast({
      title: 'Facility Settings Saved',
      description: 'Configuration changes persisted to local operations storage.',
      type: 'success',
    });
  };

  const handleResetDefaults = () => {
    resetToDefaults();
    addToast({
      title: 'Settings Reset to Factory Baseline',
      description: 'Operational thresholds and alert triggers restored.',
      type: 'info',
    });
  };

  const handleResetAllDemoData = () => {
    resetOrders();
    resetInventory();
    resetExceptions();
    resetToDefaults();
    try {
      localStorage.removeItem('wareflow_orders_storage');
      localStorage.removeItem('wareflow_inventory_storage');
      localStorage.removeItem('wareflow_exceptions_storage');
      localStorage.removeItem('wareflow_settings_storage');
    } catch {
      // ignore
    }
    addToast({
      title: 'Demo Environment Reset',
      description: 'All orders, physical inventory bins, and exceptions restored to pristine initial state.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Facility Configuration & Engine Settings"
        description="Configure automated stock allocation policies, priority scoring strictness, alert thresholds, and facility parameters."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            System Config
          </span>
        }
        actions={
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleResetDefaults}
            >
              Reset Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSave}
              className="font-semibold shadow-xs"
            >
              Save Changes
            </Button>
          </div>
        }
      />

      {/* Grid Layout: Left Nav Tabs / Right Settings Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Settings Sidebar Navigation */}
        <div className="md:col-span-3 space-y-1">
          <button
            onClick={() => setActiveSection('general')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'general'
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-foreground-secondary hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>General Facility</span>
          </button>

          <button
            onClick={() => setActiveSection('operations')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'operations'
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-foreground-secondary hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Operations & Engines</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'notifications'
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-foreground-secondary hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Telemetry Alerts</span>
          </button>

          <button
            onClick={() => setActiveSection('appearance')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'appearance'
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-foreground-secondary hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>UI & Density</span>
          </button>

          <button
            onClick={() => setActiveSection('system')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
              activeSection === 'system'
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-foreground-secondary hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>System & Demo Reset</span>
          </button>
        </div>

        {/* Right Settings Form Container */}
        <div className="md:col-span-9 space-y-6">
          {/* GENERAL SECTION */}
          {activeSection === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Facility Settings</CardTitle>
                <CardDescription>Primary operating facility, hub location, and global date formats.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={settings.facilityName}
                    onChange={(e) => updateSetting('facilityName', e.target.value)}
                    className="w-full max-w-md h-8 px-2.5 rounded border border-border bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">Default Warehouse Hub</label>
                  <select
                    value={settings.defaultWarehouseId}
                    onChange={(e) => updateSetting('defaultWarehouseId', e.target.value)}
                    className="w-full max-w-md h-8 px-2 rounded border border-border bg-white text-xs"
                  >
                    <option value="wh-alpha">Chicago Central Fulfillment (ORD-1 Alpha)</option>
                    <option value="wh-bravo">Dallas Logistics Hub (DFW-2 Bravo)</option>
                    <option value="wh-charlie">Atlanta Gateway (ATL-3 Charlie)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">Facility Time Zone</label>
                  <select
                    value={settings.timeZone}
                    onChange={(e) => updateSetting('timeZone', e.target.value)}
                    className="w-full max-w-md h-8 px-2 rounded border border-border bg-white text-xs"
                  >
                    <option value="America/Chicago (CST)">America/Chicago (CST / UTC-6)</option>
                    <option value="America/New_York (EST)">America/New_York (EST / UTC-5)</option>
                    <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST / UTC-8)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">Timestamp Display Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    className="w-full max-w-md h-8 px-2 rounded border border-border bg-white text-xs font-mono"
                  >
                    <option value="MM/DD/YYYY HH:mm">MM/DD/YYYY HH:mm (12/24 Hour)</option>
                    <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss (ISO-8601)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* OPERATIONS SECTION */}
          {activeSection === 'operations' && (
            <Card>
              <CardHeader>
                <CardTitle>Autonomous Operations & Engine Tuning</CardTitle>
                <CardDescription>Configure algorithmic allocation policies and threshold triggers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-xs">
                {/* Auto-Allocation Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-subtle border border-border">
                  <div>
                    <span className="font-bold text-foreground block">Autonomous Order Allocation</span>
                    <span className="text-foreground-secondary text-[11px]">
                      Automatically reserve physical bin inventory upon order ingestion without manual supervisor release.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoAllocationEnabled}
                    onChange={(e) => updateSetting('autoAllocationEnabled', e.target.checked)}
                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                </div>

                {/* Priority Scoring Strictness */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Priority Scoring Strictness
                  </label>
                  <select
                    value={settings.priorityScoringStrictness}
                    onChange={(e) => updateSetting('priorityScoringStrictness', e.target.value as any)}
                    className="w-full max-w-md h-8 px-2 rounded border border-border bg-white text-xs"
                  >
                    <option value="aggressive">Aggressive (Heavy weighting on SLA cutoff & VIP Tier)</option>
                    <option value="standard">Standard (Balanced queue progression)</option>
                    <option value="lenient">Lenient (Pure FIFO sequencing)</option>
                  </select>
                </div>

                {/* Low-Stock Threshold Units */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Global Low-Stock Warning Threshold (Units)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={settings.lowStockThresholdUnits}
                    onChange={(e) => updateSetting('lowStockThresholdUnits', parseInt(e.target.value) || 10)}
                    className="w-full max-w-md h-8 px-2.5 rounded border border-border bg-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-foreground-tertiary mt-0.5 block">
                    Trigger visual telemetry alerts when available SKU quantity drops below this buffer.
                  </span>
                </div>

                {/* SLA Warning Threshold Minutes */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    SLA Risk Warning Horizon (Minutes)
                  </label>
                  <input
                    type="number"
                    min={30}
                    step={15}
                    value={settings.slaWarningThresholdMins}
                    onChange={(e) => updateSetting('slaWarningThresholdMins', parseInt(e.target.value) || 120)}
                    className="w-full max-w-md h-8 px-2.5 rounded border border-border bg-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-foreground-tertiary mt-0.5 block">
                    Flag orders as AT RISK when time to carrier cutoff drops below this threshold.
                  </span>
                </div>

                {/* Picking Optimization Mode */}
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Picking Route Optimization Strategy
                  </label>
                  <select
                    value={settings.pickingOptimizationMode}
                    onChange={(e) => updateSetting('pickingOptimizationMode', e.target.value as any)}
                    className="w-full max-w-md h-8 px-2 rounded border border-border bg-white text-xs"
                  >
                    <option value="serpentine">Serpentine S-Shape (Minimizes Aisle Retracing - Recommended)</option>
                    <option value="zone_batched">Zone-Batched Floor Handoff</option>
                    <option value="direct_path">Shortest Vector Direct Path</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Operational Telemetry Alerts</CardTitle>
                <CardDescription>Control which facility anomalies trigger real-time notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-border">
                  <div>
                    <span className="font-bold text-foreground block">Critical Inventory Stockout Alerts</span>
                    <span className="text-[11px] text-foreground-secondary">Alert when active orders cannot be fulfilled due to bin shortage.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.criticalInventoryAlerts}
                    onChange={(e) => updateSetting('criticalInventoryAlerts', e.target.checked)}
                    className="h-4 w-4 rounded text-primary-600"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-border">
                  <div>
                    <span className="font-bold text-foreground block">Carrier Cutoff SLA Risk Alerts</span>
                    <span className="text-[11px] text-foreground-secondary">Alert when high-priority shipments are within 120 mins of flight departure.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.orderRiskAlerts}
                    onChange={(e) => updateSetting('orderRiskAlerts', e.target.checked)}
                    className="h-4 w-4 rounded text-primary-600"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-border">
                  <div>
                    <span className="font-bold text-foreground block">Picking Zone Bottleneck Alerts</span>
                    <span className="text-[11px] text-foreground-secondary">Alert when zone pick speed variance exceeds +50% above baseline.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pickingBottleneckAlerts}
                    onChange={(e) => updateSetting('pickingBottleneckAlerts', e.target.checked)}
                    className="h-4 w-4 rounded text-primary-600"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-border">
                  <div>
                    <span className="font-bold text-foreground block">Outbound Dock Departure Manifest Alerts</span>
                    <span className="text-[11px] text-foreground-secondary">Alert when carrier trucks are staged and electronic BOL is signed.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dispatchAlerts}
                    onChange={(e) => updateSetting('dispatchAlerts', e.target.checked)}
                    className="h-4 w-4 rounded text-primary-600"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* APPEARANCE SECTION */}
          {activeSection === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Display & Density Preferences</CardTitle>
                <CardDescription>Adjust interface table padding and accessibility motion preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">Layout Density</label>
                  <select
                    value={settings.density}
                    onChange={(e) => updateSetting('density', e.target.value as any)}
                    className="w-full max-w-md h-8 px-2 rounded border border-border bg-white text-xs"
                  >
                    <option value="comfortable">Comfortable (Standard Enterprise Spacing)</option>
                    <option value="compact">Compact (High Information Density Control Room)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-subtle border border-border max-w-md">
                  <div>
                    <span className="font-bold text-foreground block">Reduced Motion</span>
                    <span className="text-[11px] text-foreground-secondary">Disable route transition slides and pulsing indicators.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    className="h-4 w-4 rounded text-primary-600"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* SYSTEM & DEMO RESET SECTION */}
          {activeSection === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle>System Information & Prototype Environment</CardTitle>
                <CardDescription>Engine build metadata and one-click demo data reset.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-surface-subtle border border-border">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-foreground-secondary block">Engine Core</span>
                    <span className="font-mono font-bold text-foreground text-sm">v{settings.engineVersion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-foreground-secondary block">Environment</span>
                    <span className="font-semibold text-emerald-700 text-sm">Local In-Memory Persistence</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-foreground-secondary block">Auth Boundary</span>
                    <span className="font-semibold text-indigo-700 text-sm">Demo Mode (Unrestricted)</span>
                  </div>
                </div>

                {/* Reset All Demo Data Section */}
                <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Reset All Demo Data to Initial Baseline</span>
                  </div>
                  <p className="text-[11px] text-rose-900 leading-relaxed">
                    Clears all manual orders, inventory product adjustments, cycle counts, and resolved exception logs, restoring the pristine initial demo environment.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      onClick={handleResetAllDemoData}
                    >
                      Reset All Demo Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
