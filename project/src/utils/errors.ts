export class KlerkError extends Error {
  constructor(message: string, public readonly code = 'KLERK_ERROR') {
    super(message);
    this.name = 'KlerkError';
  }
}

export class TransientError extends KlerkError {
  constructor(message: string) {
    super(message, 'TRANSIENT_ERROR');
  }
}

export class RecoverableError extends KlerkError {
  constructor(message: string) {
    super(message, 'RECOVERABLE_ERROR');
  }
}

export class PermanentError extends KlerkError {
  constructor(message: string) {
    super(message, 'PERMANENT_ERROR');
  }
}

export function handleError(error: unknown): void {
  if (error instanceof KlerkError) {
    console.error(`[${error.code}] ${error.message}`);
    return;
  }

  console.error('[UNKNOWN_ERROR]', error);
}
