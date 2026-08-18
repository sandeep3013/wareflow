import { create } from 'zustand';
import { OperationalException, ExceptionStatus, ExceptionSeverity } from '../types/exception';
import { MOCK_EXCEPTIONS } from '../data/exceptions';
import { exceptionService } from '../services/exceptionService';

interface ExceptionState {
  exceptions: OperationalException[];
  selectedExceptionId: string | null;
  statusFilter: ExceptionStatus | 'ALL';
  severityFilter: ExceptionSeverity | 'ALL';
  isLoading: boolean;
  error: string | null;

  // Actions
  initExceptions: () => Promise<void>;
  setSelectedExceptionId: (id: string | null) => void;
  setStatusFilter: (status: ExceptionStatus | 'ALL') => void;
  setSeverityFilter: (severity: ExceptionSeverity | 'ALL') => void;
  addException: (exception: OperationalException) => Promise<void>;
  resolveException: (exceptionId: string, resolutionId: string, resolutionNotes?: string) => Promise<void>;
  resetExceptions: () => Promise<void>;
  getExceptionById: (id: string) => OperationalException | undefined;
  getActiveCount: () => number;
}

let isExceptionsSubscribed = false;

export const useExceptionStore = create<ExceptionState>((set, get) => ({
  exceptions: MOCK_EXCEPTIONS,
  selectedExceptionId: 'EXC-101',
  statusFilter: 'ALL',
  severityFilter: 'ALL',
  isLoading: false,
  error: null,

  initExceptions: async () => {
    if (isExceptionsSubscribed) return;
    set({ isLoading: true, error: null });

    try {
      // 1. Initial fetch
      const loadedExceptions = await exceptionService.getExceptions();
      set({ exceptions: loadedExceptions, isLoading: false });

      // 2. Real-time subscription
      isExceptionsSubscribed = true;
      exceptionService.subscribeExceptions(
        (updatedExceptions) => {
          set({ exceptions: updatedExceptions });
        },
        (appErr) => {
          set({ error: appErr.message });
        }
      );
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Unable to load exceptions.' });
    }
  },

  setSelectedExceptionId: (id) => set({ selectedExceptionId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSeverityFilter: (severity) => set({ severityFilter: severity }),

  addException: async (exception) => {
    // 1. Write to Firestore
    await exceptionService.createException(exception);

    // 2. Optimistic local update
    set((state) => ({
      exceptions: [exception, ...state.exceptions.filter((e) => e.id !== exception.id)],
    }));
  },

  resolveException: async (exceptionId, resolutionId, resolutionNotes) => {
    const now = new Date().toISOString();
    // 1. Optimistic local update
    set((state) => ({
      exceptions: state.exceptions.map((exc) => {
        if (exc.id === exceptionId) {
          return {
            ...exc,
            status: 'RESOLVED',
            selectedResolutionId: resolutionId,
            resolvedAt: now,
            resolvedBy: 'Marcus Vance (Ops Manager)',
            resolutionNotes: resolutionNotes || 'Autonomous resolution approved & executed by operator.',
          };
        }
        return exc;
      }),
    }));

    // 2. Write to Firestore
    await exceptionService.resolveException(exceptionId, resolutionId, resolutionNotes);
  },

  resetExceptions: async () => {
    await exceptionService.resetExceptions();
    set({ exceptions: MOCK_EXCEPTIONS, selectedExceptionId: 'EXC-101' });
  },

  getExceptionById: (id) => {
    return get().exceptions.find((exc) => exc.id === id);
  },

  getActiveCount: () => {
    return get().exceptions.filter((e) => e.status !== 'RESOLVED' && e.status !== 'DISMISSED').length;
  },
}));
