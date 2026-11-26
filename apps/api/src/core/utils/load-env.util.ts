import { AppError } from '../errors.js';

function loadEnvFile() {
  if (process.env.NODE_ENV === 'development') {
    process.loadEnvFile('.env.dev');

    console.log('Environment variables loaded from .env.dev');
  } else if (process.env.NODE_ENV === 'production') {
    process.loadEnvFile('.env.prod');

    console.log('Environment variables loaded from .env.prod');
  } else {
    throw new AppError('NODE_ENV is not defined', 500, {
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

loadEnvFile();
