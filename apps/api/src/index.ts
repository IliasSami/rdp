/**
 * Fastify entry point.
 *
 * Loads + validates env first (fail fast), then builds the app and binds
 * to API_PORT. Listens on 0.0.0.0 so Docker port-forwarding works.
 */
import { loadEnv } from '@rdp/utils';

// Validate env BEFORE any other module runs business logic
const env = loadEnv();

import { buildApp } from './app';

async function start(): Promise<void> {
  const app = await buildApp();

  try {
    await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
    app.log.info(
      { port: env.API_PORT, env: env.NODE_ENV },
      'RDP API listening',
    );
  } catch (err) {
    app.log.fatal({ err }, 'Failed to start');
    process.exit(1);
  }
}

void start();
