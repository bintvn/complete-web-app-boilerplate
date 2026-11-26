import type { DataSource } from 'typeorm';
import { SessionEntity } from './entities/session.entity.js';
import SessionService from './session.service.js';
import type { Module } from '../../types/module.types.js';

export interface SessionModule extends Module {
  service: SessionService;
}

const createSessionModule = (dataSource: DataSource): SessionModule => {
  return {
    name: 'session',
    entities: [SessionEntity],
    service: new SessionService(dataSource.getRepository(SessionEntity)),
    routePath: 'session',
  };
};

export default createSessionModule;
