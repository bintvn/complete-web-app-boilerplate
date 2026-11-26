import type { DataSource } from 'typeorm';
import { EmailEntity } from './entities/email.entity.js';
import EmailService from './email.service.js';
import type { Module } from '../../types/module.types.js';
import type { AppConfig } from '../../types/app.types.js';

export interface EmailModule extends Module {
  service: EmailService;
}

const createEmailModule = (
  config: AppConfig,
  dataSource: DataSource
): EmailModule => {
  const service = new EmailService(
    dataSource.getRepository(EmailEntity),
    config
  );

  return {
    name: 'email',
    entities: [EmailEntity],
    service,
  };
};

export default createEmailModule;
