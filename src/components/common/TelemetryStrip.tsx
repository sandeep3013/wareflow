import { Activity, Users, Layers, Truck, Gauge } from 'lucide-react';
import { useWarehouseStore } from '../../store/useWarehouseStore';

export function TelemetryStrip() {
  const { zones } = useWarehouseStore();
  const congestedZonesCount = zones.filter((z) => z.congestionScore > 60).length;

  return (
    <div className="w-full bg-white border border-border rounded-lg p-3 sm:px-4 shadow-subtle flex items-center justify-between overflow-x-auto gap-4 sm:gap-6 no-scrollbar text-xs">
      <div className="flex items-center space-x-2 shrink-0">
        <div className="p-1 rounded bg-indigo-50 text-indigo-700">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
            Throughput
          </span>
          <span className="font-mono font-bold text-foreground tabular-nums text-xs sm:text-sm">
            18.4 <span className="text-[10px] font-normal text-foreground-tertiary">orders/min</span>
          </span>
        </div>
      </div>

      <div className="h-6 w-px bg-border shrink-0" />

      <div className="flex items-center space-x-2 shrink-0">
        <div className="p-1 rounded bg-blue-50 text-blue-700">
          <Users className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
            Pickers Active
          </span>
          <span className="font-mono font-bold text-foreground tabular-nums text-xs sm:text-sm">
            14 <span className="text-[10px] font-normal text-foreground-tertiary">/ 18 floor staff</span>
          </span>
        </div>
      </div>

      <div className="h-6 w-px bg-border shrink-0" />

      <div className="flex items-center space-x-2 shrink-0">
        <div className="p-1 rounded bg-purple-50 text-purple-700">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
            Pack Stations
          </span>
          <span className="font-mono font-bold text-foreground tabular-nums text-xs sm:text-sm">
            7 <span className="text-[10px] font-normal text-foreground-tertiary">/ 8 lines active</span>
          </span>
        </div>
      </div>

      <div className="h-6 w-px bg-border shrink-0" />

      <div className="flex items-center space-x-2 shrink-0">
        <div className="p-1 rounded bg-emerald-50 text-emerald-700">
          <Truck className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
            Dock Capacity
          </span>
          <span className="font-mono font-bold text-foreground tabular-nums text-xs sm:text-sm">
            82% <span className="text-[10px] font-normal text-foreground-tertiary">bay loading</span>
          </span>
        </div>
      </div>

      <div className="h-6 w-px bg-border shrink-0" />

      <div className="flex items-center space-x-2 shrink-0">
        <div className="p-1 rounded bg-amber-50 text-amber-700">
          <Gauge className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
            Zone Congestion
          </span>
          <div className="flex items-center space-x-1.5 font-bold text-xs sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className={congestedZonesCount > 0 ? 'text-amber-700' : 'text-emerald-700'}>
              {congestedZonesCount > 0 ? 'Moderate (Zone B)' : 'Nominal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
