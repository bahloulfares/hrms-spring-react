export const logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // Only log debug in development to avoid leaking details in prod
      console.debug(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.PROD) {
      // Placeholder to plug an error tracker (Sentry, etc.)
      return;
    }
    console.error(...args);
  },
};
