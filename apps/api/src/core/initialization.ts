import { IS_DEV } from './constants.js';
import 'reflect-metadata';
import type { Server } from 'node:http';
import { InternalServerError } from './errors.js';
import createApp from './app.js';
import appConfig from '../config.js';
import { dbMain as dataSource } from './index.js';
import seeds from './seeds/index.js';

const dbMain = dataSource(appConfig);

export async function start() {
  let server: Server | undefined;
  let isShuttingDown = false;

  try {
    if (!dbMain.isInitialized) {
      console.log('Connecting to database...');
      await dbMain.initialize();
      console.log('Database connected');

      if (IS_DEV) {
        console.log('Synchronizing database...');
        await dbMain.synchronize();
        console.log('Database synchronized');
      }

      await seeds(dbMain);
    }

    const app = createApp(appConfig, dbMain);

    await new Promise<void>((resolve, reject) => {
      server = app.listen(
        appConfig.server.port,
        appConfig.server.host,
        (error?: Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }
      );
    });

    if (!server)
      throw new InternalServerError(
        'Failed to start server. Server instance is undefined.'
      );

    const result = server.address();
    const address = typeof result === 'object' ? result : null;

    console.log(
      `Server running on http://${address?.address || appConfig.server.host}:${String(address?.port || appConfig.server.port)} (${String(address?.family)})`
    );
    server.on('close', () => {
      console.log('HTTP server closed');
    });
  } catch (error) {
    await handleStartupFailure(error);
  }

  async function handleStartupFailure(error: unknown) {
    console.error('Server startup failed:', error);

    try {
      if (dbMain.isInitialized) await dbMain.destroy();
    } catch (cleanupError) {
      console.error(
        'Error closing database after startup failure:',
        cleanupError
      );
    }

    process.exit(1);
  }

  const closeHttpServer = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!server) {
        resolve();
        return;
      }

      server.closeIdleConnections();

      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });

      setTimeout(() => {
        server?.closeAllConnections();
      }, 5000).unref();
    });
  };

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\nReceived ${signal}.`);
    console.log('Shutting down server gracefully...');

    try {
      await closeHttpServer();

      if (dbMain.isInitialized) {
        await dbMain.destroy();
        console.log('Database connection closed');
      }

      console.log('Shutting down server gracefully... Done');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
  });

  process.on('uncaughtExceptionMonitor', (error) => {
    console.error('Uncaught exception (monitor):', error);
  });

  process.on('unhandledRejectionMonitor', (reason) => {
    console.error('Unhandled rejection (monitor):', reason);
  });
}
