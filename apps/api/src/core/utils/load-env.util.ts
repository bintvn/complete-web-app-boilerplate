import { AppError } from '../errors.js';

function loadEnvFile() {
  if (process.env.NODE_ENV === 'development') {
    process.loadEnvFile('.env.development');

    console.log('Environment variables loaded from .env.development');
  } else if (process.env.NODE_ENV === 'production') {
    process.loadEnvFile('.env.production');

    console.log('Environment variables loaded from .env.production');
  } else {
    throw new AppError('NODE_ENV is not defined', 500, {
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

try {
  loadEnvFile();
} catch (error: unknown) {
  if (error instanceof AppError) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  if (error instanceof Error) {
    if (error.message.includes('no such file or directory')) {
      console.warn(
        '⚠️  Warning: Environment variables file not found. Using default values.'
      );
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
