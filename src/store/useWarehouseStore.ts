import { create } from 'zustand';
import { WarehouseDetails, WarehouseZone, WarehouseEmployee } from '../types/warehouse';
import { MOCK_WAREHOUSE_DETAILS, MOCK_ZONES } from '../data/warehouse';
import { MOCK_EMPLOYEES } from '../data/employees';
import { WAREHOUSES } from '../lib/constants';

interface WarehouseState {
  currentWarehouseId: string;
  warehouses: typeof WAREHOUSES;
  warehouseDetails: WarehouseDetails;
  zones: WarehouseZone[];
  employees: WarehouseEmployee[];

  // Actions
  setWarehouse: (id: string) => void;
  updateZoneCongestion: (zoneId: string, congestionScore: number) => void;
  reassignEmployeeZone: (employeeId: string, newZone: string) => void;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  currentWarehouseId: 'wh-alpha',
  warehouses: WAREHOUSES,
  warehouseDetails: MOCK_WAREHOUSE_DETAILS,
  zones: MOCK_ZONES,
  employees: MOCK_EMPLOYEES,

  setWarehouse: (id) => {
    const selected = WAREHOUSES.find((w) => w.id === id);
    if (selected) {
      set((state) => ({
        currentWarehouseId: id,
        warehouseDetails: {
          ...state.warehouseDetails,
          id: selected.id,
          name: selected.name,
          code: selected.code,
          city: selected.city,
        },
      }));
    }
  },

  updateZoneCongestion: (zoneId, congestionScore) => {
    set((state) => ({
      zones: state.zones.map((zone) =>
        zone.id === zoneId ? { ...zone, congestionScore, isBottleneck: congestionScore > 75 } : zone
      ),
    }));
  },

  reassignEmployeeZone: (employeeId, newZone) => {
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === employeeId ? { ...emp, currentZone: newZone } : emp
      ),
    }));
  },
}));
