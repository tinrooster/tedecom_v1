export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff?: boolean;
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  let attempt = 1;
  let delay = options.delayMs;
  let error: Error | null = null;

  while (attempt <= options.maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === options.maxAttempts) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));

      if (options.backoff) {
        delay *= 2;
      }

      attempt++;
    }
  }

  // This should never be reached due to the throw in the catch block
  throw error || new Error('Retry failed');
} 