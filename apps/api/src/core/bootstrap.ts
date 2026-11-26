import type { DataSource } from 'typeorm';
import createAccessControlModule from './modules/access-control/index.js';
import createAuthModule from './modules/auth/index.js';
import createEmailModule from './modules/mail/index.js';
import createModuleModule from './modules/modules/index.js';
import createRoleModule from './modules/role/index.js';
import createSessionModule from './modules/session/index.js';
import createUserModule from './modules/user/index.js';
import createVerificationModule from './modules/verification/index.js';
import type { AppConfig } from './types/app.types.js';
import type { AuthMiddleware } from './middlewares/auth.middleware.js';

export type CoreContainer = ReturnType<typeof createCoreContainer>;

const createCoreContainer = (
  config: AppConfig,
  dataSource: DataSource,
  authMiddleware: AuthMiddleware
) => {
  const accessControlModule = createAccessControlModule(
    dataSource,
    authMiddleware
  );
  const emailModule = createEmailModule(config, dataSource);
  const moduleModule = createModuleModule(dataSource, authMiddleware);
  const roleModule = createRoleModule(dataSource, authMiddleware);
  const sessionModule = createSessionModule(dataSource);
  const verificationModule = createVerificationModule(config, dataSource);
  const userModule = createUserModule(
    dataSource,
    {
      roleService: roleModule.service,
    },
    authMiddleware
  );
  const authModule = createAuthModule(
    config,
    {
      mailService: emailModule.service,
      roleService: roleModule.service,
      sessionService: sessionModule.service,
      userService: userModule.service,
      verificationService: verificationModule.service,
    },
    authMiddleware
  );

  return {
    accessControlModule,
    authModule,
    emailModule,
    moduleModule,
    roleModule,
    userModule,
    sessionModule,
    verificationModule,
  };
};

export default createCoreContainer;
