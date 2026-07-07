import { env } from './config/env';
import { logger } from './config/logger';
import { handleError } from './utils/errors';

async function main(): Promise<void> {
  logger.info({ databaseUrlConfigured: Boolean(env.DATABASE_URL) }, 'Klerk bootstrapped');
  logger.info('Day 1 foundation is ready');
}

main().catch((error) => {
  handleError(error);
  process.exit(1);
});
