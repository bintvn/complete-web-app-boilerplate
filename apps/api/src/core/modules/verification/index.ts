import type { DataSource } from 'typeorm';
import { InternalServerError } from '../../errors.js';
import type { AppConfig } from '../../types/app.types.js';
import type { Module } from '../../types/module.types.js';
import { VerificationEntity } from './entities/verification.entity.js';
import VerificationService from './verification.service.js';

export interface VerificationModule extends Module {
  service: VerificationService;
}

const createVerificationModule = (
  config: AppConfig,
  dataSource: DataSource
): VerificationModule => {
  const otpSecret = config.auth.verification.otpSecret;

  if (!otpSecret || Buffer.byteLength(otpSecret) < 32)
    throw new InternalServerError('OTP_SECRET must contain at least 32 bytes');

  return {
    name: 'verification',
    entities: [VerificationEntity],
    service: new VerificationService(
      dataSource.getRepository(VerificationEntity),
      {
        ...config.auth.verification,
        otpSecret,
      }
    ),
  };
};

export default createVerificationModule;
