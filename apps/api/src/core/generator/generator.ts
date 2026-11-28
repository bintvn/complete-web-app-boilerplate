import {
  lstat,
  mkdir,
  open,
  readFile,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const moduleNamePattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const windowsDeviceNamePattern = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/;
const reservedNames = new Set([
  'access-control',
  'auth',
  'category',
  'mail',
  'modules',
  'openapi',
  'post',
  'role',
  'session',
  'user',
  'verification',
]);
const reservedPaths = new Set([
  'access-control',
  'auth',
  'categories',
  'docs',
  'modules',
  'posts',
  'roles',
  'users',
]);

async function formatFile(filePath: string, contents: string) {
  const config = await prettier.resolveConfig(filePath, { editorconfig: true });
  return prettier.format(contents, { ...config, filepath: filePath });
}

async function readIfPresent(filePath: string) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return undefined;
  }
}

export const generateModule = async (name: string): Promise<string> => {
  if (name.length > 64 || !moduleNamePattern.test(name)) {
    throw new Error(
      'Module name must be kebab case, start with a letter, and be at most 64 characters'
    );
  }

  if (windowsDeviceNamePattern.test(name)) {
    throw new Error(`Module name "${name}" is reserved on Windows`);
  }

  const routePath = `${name}s`;
  if (reservedNames.has(name) || reservedPaths.has(routePath)) {
    throw new Error(
      `Module "${name}" or route "/${routePath}" is already reserved`
    );
  }

  const parts = name.split('-');
  const pascalName = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
  const entity = `${pascalName}Entity`;
  const service = `${pascalName}Service`;
  const baseServiceAlias =
    service === 'BaseService' ? 'ServiceBase' : undefined;
  const baseServiceImport = baseServiceAlias
    ? `BaseService as ${baseServiceAlias}`
    : 'BaseService';
  const controller = `${pascalName}Controller`;
  const table = parts.join('_');
  const modulesDirectory = fileURLToPath(
    new URL('../../modules/', import.meta.url)
  );
  const moduleDirectory = join(modulesDirectory, name);
  const lockDirectory = join(modulesDirectory, `.${name}.generate.lock`);
  const indexPath = join(moduleDirectory, 'index.ts');
  const sharedModuleDirectory = fileURLToPath(
    new URL(
      `../../../../../packages/shared/src/modules/${name}/`,
      import.meta.url
    )
  );

  const sharedSchema = `import { z } from 'zod';
import { baseSchema } from "../../core/base.schema.js";
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ${camelName}BaseSchema = baseSchema
  .extend({
    id: z.uuid(),
    name: z.string(),
  }).openapi('${pascalName}Base');
export const create${pascalName}Schema = z.strictObject({
  name: z.string().trim().min(1).max(255),
});
export const update${pascalName}Schema = create${pascalName}Schema.partial();
export type Create${pascalName} = z.infer<typeof create${pascalName}Schema>;
export type Update${pascalName} = z.infer<typeof update${pascalName}Schema>;
export type ${pascalName}Base = z.infer<typeof ${camelName}BaseSchema>;
`;

  const legacyIndex = `import type { DataSource } from 'typeorm';
import { ${entity} } from './entities/${name}.entity.js';
import ${service} from './${name}.service.js';
import ${controller} from './${name}.controller.js';
import create${pascalName}Router from './${name}.routes.js';
import type { Module } from '../../core/types/module.types.js';
import type { Router } from 'express';
import type { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';

export interface ${pascalName}Module extends Module {
  service: ${service};
  controller: ${controller};
  router: Router;
}

const create${pascalName}Module = (
  dataSource: DataSource,
  authMiddleware: AuthMiddleware,
): ${pascalName}Module => {
  const service = new ${service}(dataSource.getRepository(${entity}));
  const controller = new ${controller}(service);
  const router = create${pascalName}Router(controller, authMiddleware);

  return {
    name: '${name}',
    entities: [${entity}],
    service,
    controller,
    router,
    routePath: '${routePath}',
  };
};

export default create${pascalName}Module;
`;
  const openApiImport = `import type { OpenapiModule } from '../../core/modules/openapi/index.js';
import { ${camelName}RoutePath, register${pascalName}OpenApi } from './${name}.openapi.js';`;
  const moduleIndex = legacyIndex
    .replace('export interface', `${openApiImport}\n\nexport interface`)
    .replace(
      '  authMiddleware: AuthMiddleware,',
      '  openapiModule: OpenapiModule,\n  authMiddleware: AuthMiddleware,'
    )
    .replace(
      '  return {',
      `  register${pascalName}OpenApi(openapiModule.service);\n\n  return {`
    )
    .replace(`routePath: '${routePath}'`, `routePath: ${camelName}RoutePath`);

  const apiFiles = {
    'index.ts': moduleIndex,
    [`${name}.openapi.ts`]: `import {
  create${pascalName}Schema,
  ${camelName}BaseSchema,
  update${pascalName}Schema,
} from '@complete-web-app-boilerplate/shared/modules/${name}';
import type OpenapiService from '../../core/modules/openapi/openapi.service.js';
import { registerCrudOpenApi } from '../../core/modules/openapi/register-crud.openapi.js';

export const ${camelName}RoutePath = '${routePath}';

export function register${pascalName}OpenApi(service: OpenapiService) {
  registerCrudOpenApi(service, {
    routePath: ${camelName}RoutePath,
    resource: '${name}',
    tag: '${parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}s',
    createSchema: create${pascalName}Schema,
    updateSchema: update${pascalName}Schema,
    responseBaseSchema: ${camelName}BaseSchema,
  });
}
`,
    [`entities/${name}.entity.ts`]: `import { Column, Entity } from 'typeorm';
import { BaseEntity as EntityBase } from '../../../core/base.entity.js';

@Entity('${table}')
export class ${entity} extends EntityBase {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255
  })
  name: string;
}
`,
    [`${name}.service.ts`]: `import type { Repository } from 'typeorm';
import type { ${entity} } from './entities/${name}.entity.js';
import { ${baseServiceImport} } from '../../core/base.service.js';

export default class ${service} extends ${baseServiceAlias ?? 'BaseService'}<
  ${entity},
  Repository<${entity}>
> {
  readonly name = '${name}';

  constructor(readonly repository: Repository<${entity}>) {
    super(repository);
  }
}
`,
    [`${name}.controller.ts`]: `import type { Request, Response } from 'express';
import { NotFoundError } from '../../core/errors.js';
import { parseBody, parsePatchId } from '../../core/validation.js';
import { toResponse } from '../../core/response-serializer.js';
import {
  create${pascalName}Schema,
  ${camelName}BaseSchema,
  update${pascalName}Schema,
} from '@complete-web-app-boilerplate/shared/modules/${name}';
import type ${service} from './${name}.service.js';

export default class ${controller} {
  readonly name = '${name}';

  constructor(private readonly service: ${service}) {}

  getAll = async (_request: Request, response: Response) => {
    const records = await this.service.getAll();

    response.json(records.map((record) => toResponse(${camelName}BaseSchema, record)));
  };

  get = async (request: Request<{ id: string }>, response: Response) => {
    const record = await this.service.get(request.params.id);

    if (!record)
      throw new NotFoundError(
        \`\${this.name} with ID \${request.params.id} not found\`,
      );

    response.json(toResponse(${camelName}BaseSchema, record));
  };

  create = async (request: Request, response: Response) => {
    const data = parseBody(create${pascalName}Schema, request.body);
    const record = await this.service.create(data);

    response.status(201).json(toResponse(${camelName}BaseSchema, record));
  };

  update = async (request: Request<{ id: string }>, response: Response) => {
    const id = parsePatchId(request.params.id);
    const data = parseBody(update${pascalName}Schema, request.body);
    await this.service.update(id, data);

    response.status(204).send();
  };

  delete = async (request: Request<{ id: string }>, response: Response) => {
    await this.service.delete(request.params.id);

    response.status(204).send();
  };
}
`,
    [`${name}.routes.ts`]: `import { Router } from 'express';
import type ${controller} from './${name}.controller.js';
import type { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';

const create${pascalName}Router = (
  controller: ${controller},
  authMiddleware: AuthMiddleware,
) => {
  const router = Router();

  router.get('/', authMiddleware, controller.getAll);
  router.get('/:id', authMiddleware, controller.get);
  router.post('/', authMiddleware, controller.create);
  router.patch('/:id', authMiddleware, controller.update);
  router.delete('/:id', authMiddleware, controller.delete);

  return router;
};

export default create${pascalName}Router;
`,
  };

  const files = new Map(
    Object.entries(apiFiles).map(([filename, contents]) => [
      join(moduleDirectory, filename),
      contents,
    ])
  );
  files.set(join(sharedModuleDirectory, 'schema.ts'), sharedSchema);

  const createdDirectories: string[] = [];
  const createdFiles: string[] = [];
  const stagedIndex = join(lockDirectory, 'index.tmp');

  try {
    await mkdir(lockDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    throw new Error(`Module generation is locked at "${lockDirectory}"`, {
      cause: error,
    });
  }

  try {
    const existingIndex = await readIfPresent(indexPath);
    let upgradeIndex = false;
    if (existingIndex !== undefined) {
      const formattedIndex = await formatFile(indexPath, existingIndex);
      if (formattedIndex === (await formatFile(indexPath, legacyIndex))) {
        const existingController = await readIfPresent(
          join(moduleDirectory, `${name}.controller.ts`)
        );
        if (
          existingController &&
          !existingController.includes(
            `@complete-web-app-boilerplate/shared/modules/${name}`
          )
        ) {
          throw new Error(
            `Move the request and response schemas for "${name}" to packages/shared/src/modules/${name}/schema.ts and update the controller imports before generating OpenAPI.`
          );
        }
        await writeFile(stagedIndex, await formatFile(indexPath, moduleIndex), {
          flag: 'wx',
        });
        upgradeIndex = true;
      } else if (
        formattedIndex !== (await formatFile(indexPath, moduleIndex))
      ) {
        throw new Error(
          `Custom factory "${indexPath}" could not be upgraded safely. Add the OpenapiModule argument and register${pascalName}OpenApi(openapiModule.service), then wire the factory into apps/api/src/bootstrap.ts.`
        );
      }
    }
    for (const directory of [
      moduleDirectory,
      join(moduleDirectory, 'entities'),
      sharedModuleDirectory,
    ]) {
      try {
        await mkdir(directory);
        createdDirectories.push(directory);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;

        if (!(await lstat(directory)).isDirectory()) {
          throw new Error(`Module path "${directory}" is not a directory`, {
            cause: error,
          });
        }
      }
    }

    for (const [filePath, contents] of files) {
      let file;
      try {
        file = await open(filePath, 'wx');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;

        if ((await lstat(filePath)).isFile()) continue;

        throw new Error(`Module file path "${filePath}" is not a file`, {
          cause: error,
        });
      }

      createdFiles.push(filePath);
      try {
        await file.writeFile(contents);
      } finally {
        await file.close();
      }
    }

    for (const filePath of createdFiles) {
      const contents = await readFile(filePath, 'utf8');
      const formatted = await formatFile(filePath, contents);

      if (formatted !== contents) await writeFile(filePath, formatted);
    }
    if (upgradeIndex) {
      if ((await readIfPresent(indexPath)) !== existingIndex) {
        throw new Error(`Factory changed during generation: "${indexPath}"`);
      }
      await rename(stagedIndex, indexPath);
    }
  } catch (error) {
    try {
      await Promise.all(
        createdFiles.map((filePath) => rm(filePath, { force: true }))
      );
      for (const directory of createdDirectories.reverse()) {
        await rmdir(directory);
      }
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        `Could not generate or clean up module "${name}"`,
        { cause: cleanupError }
      );
    }
    throw error;
  } finally {
    await rm(stagedIndex, { force: true });
    await rmdir(lockDirectory);
  }

  return moduleDirectory;
};
