import { consola } from 'consola';

export function createLogger(logMode: 'json' | 'human') {
  const logger = consola.create({
    level: logMode === 'json' ? 0 : 3,
  });

  // For JSON mode, we'll handle formatting in the emit function
  return logger;
}
