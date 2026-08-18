export interface AppError {
  message: string;
  code?: string;
  originalError?: unknown;
}

export function handleFirebaseError(error: unknown, context: string): AppError {
  const isDev = import.meta.env.DEV;
  let userMessage = `Live data temporarily unavailable for ${context}. Showing demo data.`;
  let code = 'unknown';

  if (error && typeof error === 'object') {
    const err = error as { code?: string; message?: string };
    code = err.code || 'unknown';

    if (code === 'permission-denied') {
      userMessage = `Live ${context} stream is in offline demo mode.`;
    } else if (code === 'unavailable' || code.includes('network')) {
      userMessage = `Connection interrupted. WAREFLOW is using cached demo data for ${context}.`;
    } else if (code === 'not-found') {
      userMessage = `The requested ${context} item was not found in cloud database.`;
    } else if (code === 'already-exists') {
      userMessage = `An item with this identifier already exists in ${context}.`;
    } else if (code === 'resource-exhausted') {
      userMessage = `Cloud quota limit reached for ${context}. Using local storage fallback.`;
    }
  }

  if (isDev) {
    console.debug(`[WAREFLOW ${context} Notice] [${code}]:`, error);
  }

  return {
    message: userMessage,
    code,
    originalError: error,
  };
}
