import { useState } from 'react';
import { Navigation, User, ArrowRight, Zap, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface WarehouseFloorMapProps {
  activeRouteBins?: string[];
  currentPicker?: {
    id: string;
    name: string;
    currentBin: string;
  };
  highlightZone?: string;
  className?: string;
}

export function WarehouseFloorMap({
  activeRouteBins = ['A-03', 'B-04', 'C-02'],
  currentPicker = { id: 'P-07', name: 'Darius Thorne', currentBin: 'A-03' },
  className,
}: WarehouseFloorMapProps) {
  const [selectedBin, setSelectedBin] = useState<string | null>(null);

  const zones = [
    {
      code: 'A',
      name: 'Zone A (Fast Electronics)',
      color: 'blue',
      congestion: 28,
      bins: ['A-01', 'A-02', 'A-03', 'A-04', 'A-05'],
    },
    {
      code: 'B',
      name: 'Zone B (Displays & Heavy)',
      color: 'amber',
      congestion: 84, // Congested!
      bins: ['B-01', 'B-02', 'B-03', 'B-04', 'B-05'],
    },
    {
      code: 'C',
      name: 'Zone C (Cables & Adapters)',
      color: 'indigo',
      congestion: 42,
      bins: ['C-01', 'C-02', 'C-03', 'C-04', 'C-05'],
    },
    {
      code: 'D',
      name: 'Zone D (High-Value Secured)',
      color: 'purple',
      congestion: 15,
      bins: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05'],
    },
  ];

  return (
    <div className={cn('rounded-lg border border-border bg-white p-5 shadow-card space-y-4', className)}>
      {/* Top Header & Route Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-50 text-indigo-700">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Warehouse Floor Map & Serpentine Routing
            </h3>
            <span className="text-[11px] text-foreground-secondary">
              Real-time picker coordinates, aisle congestion heatmap & optimized travel vectors
            </span>
          </div>
        </div>

        {/* Route Optimization Savings Metric Badge */}
        <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Route Optimization:</span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="text-gray-400 line-through">142m</span>
            <ArrowRight className="w-3 h-3 text-emerald-600" />
            <span className="font-bold text-emerald-900">108m</span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
              24% time saved
            </span>
          </div>
        </div>
      </div>

      {/* SVG Warehouse Floor Plan */}
      <div className="relative w-full bg-[#0B0F19] rounded-lg p-4 text-white overflow-hidden shadow-inner">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Operational Stations Banner */}
        <div className="flex items-center justify-between px-2 pb-3 border-b border-gray-800 text-[11px] font-mono">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700 text-blue-300 font-bold">
              INBOUND DOCK 01-02
            </span>
            <span className="text-gray-500">→</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">
              STAGING BUFFER
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Picker {currentPicker.id} active
            </span>
          </div>
        </div>

        {/* Aisle & Zone Grid Layout */}
        <div className="py-4 space-y-3">
          {zones.map((zone) => {
            const isCongested = zone.congestion > 70;
            return (
              <div key={zone.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono px-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider">
                      {zone.name}
                    </span>
                    {isCongested && (
                      <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/80 border border-rose-800 px-1.5 py-0.2 rounded font-bold">
                        <Flame className="w-2.5 h-2.5" />
                        {zone.congestion}% Congested
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400">Aisle {zone.code}01-{zone.code}05</span>
                </div>

                {/* Bins Row */}
                <div className="grid grid-cols-5 gap-2">
                  {zone.bins.map((bin) => {
                    const isPickTarget = activeRouteBins.some((b) => b.includes(bin));
                    const isPickerHere = currentPicker.currentBin.includes(bin);
                    const isSelected = selectedBin === bin;

                    return (
                      <div
                        key={bin}
                        onClick={() => setSelectedBin(bin)}
                        className={cn(
                          'relative h-14 rounded-md border p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 select-none',
                          isPickerHere
                            ? 'bg-indigo-950/90 border-indigo-400 ring-2 ring-indigo-500 shadow-glow-primary'
                            : isPickTarget
                              ? 'bg-emerald-950/70 border-emerald-500/80 hover:bg-emerald-900/60'
                              : isCongested
                                ? 'bg-amber-950/40 border-amber-800/60 hover:bg-amber-900/40'
                                : 'bg-gray-900/80 border-gray-800 hover:border-gray-700 hover:bg-gray-800/50',
                          isSelected && 'ring-2 ring-white'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-gray-200">
                            {bin}
                          </span>
                          {isPickTarget && (
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </div>

                        {/* Picker Coordinate Token */}
                        {isPickerHere && (
                          <div className="flex items-center space-x-1 text-[9px] font-bold text-indigo-300 bg-indigo-900/80 px-1 py-0.5 rounded w-fit">
                            <User className="w-2.5 h-2.5" />
                            <span>{currentPicker.id}</span>
                          </div>
                        )}

                        {!isPickerHere && isPickTarget && (
                          <span className="text-[9px] text-emerald-400 font-semibold font-mono">
                            Pick Stop
                          </span>
                        )}

                        {!isPickerHere && !isPickTarget && (
                          <span className="text-[9px] text-gray-600 font-mono">
                            Stock OK
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Destination Flow (Packing & Dispatch Dock) */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-[11px] font-mono">
          <div className="flex items-center space-x-2 text-indigo-300">
            <Navigation className="w-3.5 h-3.5" />
            <span className="font-bold">CURRENT PICK ROUTE:</span>
            <span className="text-gray-300">START → A-03 → B-04 → C-02 → PACKING P1</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300 font-bold">
              PACKING STATION P1-P4
            </span>
            <span className="text-gray-500">→</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
              DISPATCH DOCK 03
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Bin Inspector Footer */}
      {selectedBin && (
        <div className="p-3 rounded-lg bg-surface-subtle border border-border flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              Bin {selectedBin}
            </span>
            <span className="text-foreground-secondary">
              Assigned SKU: <strong className="text-foreground">SKU-DKS-003</strong> (Docking Station) • 24 units on-hand
            </span>
          </div>
          <button
            onClick={() => setSelectedBin(null)}
            className="text-[11px] text-foreground-secondary hover:text-foreground font-medium underline"
          >
            Close Inspector
          </button>
        </div>
      )}
    </div>
  );
}
