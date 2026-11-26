import type { DataSource } from 'typeorm';
import { MailEntity } from './entities/mail.entity.js';
import MailService from './mail.service.js';
import type { Module } from '../../types/module.types.js';
import type { AppConfig } from '../../types/app.types.js';

export interface MailModule extends Module {
  service: MailService;
}

const createMailModule = (
  config: AppConfig,
  dataSource: DataSource
): MailModule => {
  const service = new MailService(dataSource.getRepository(MailEntity), config);

  return {
    name: 'mail',
    entities: [MailEntity],
    service,
  };
};

export default createMailModule;
