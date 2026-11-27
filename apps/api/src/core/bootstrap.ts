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
import createOpenapiModule from './modules/openapi/index.js';

export type CoreContainer = ReturnType<typeof createCoreContainer>;

const createCoreContainer = (
  config: AppConfig,
  dataSource: DataSource,
  authMiddleware: AuthMiddleware
) => {
  const openapiModule = createOpenapiModule(config);
  const accessControlModule = createAccessControlModule(
    dataSource,
    openapiModule,
    authMiddleware
  );
  const emailModule = createEmailModule(config, dataSource);
  const moduleModule = createModuleModule(
    dataSource,
    openapiModule,
    authMiddleware
  );
  const roleModule = createRoleModule(
    dataSource,
    openapiModule,
    authMiddleware
  );
  const sessionModule = createSessionModule(dataSource);
  const verificationModule = createVerificationModule(config, dataSource);
  const userModule = createUserModule(
    dataSource,
    {
      roleService: roleModule.service,
    },
    openapiModule,
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
    openapiModule,
    authMiddleware
  );

  return {
    openapiModule,
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
