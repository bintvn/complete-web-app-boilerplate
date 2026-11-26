import {
  lstat,
  mkdir,
  open,
  readFile,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const moduleNamePattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const windowsDeviceNamePattern = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/;

export const generateModule = async (name: string): Promise<string> => {
  if (name.length > 64 || !moduleNamePattern.test(name)) {
    throw new Error(
      'Module name must be kebab case, start with a letter, and be at most 64 characters'
    );
  }

  if (windowsDeviceNamePattern.test(name)) {
    throw new Error(`Module name "${name}" is reserved on Windows`);
  }

  const parts = name.split('-');
  const pascalName = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  const dto = `${pascalName.charAt(0).toLowerCase()}${pascalName.slice(1)}Dto`;
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

  const files = {
    'index.ts': `import type { DataSource } from 'typeorm';
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
    routePath: '${name}s',
  };
};

export default create${pascalName}Module;
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
    [`${name}.schema.ts`]: `import { z } from 'zod';

export const create${pascalName}Schema = z.strictObject({
  name: z.string().trim().min(1).max(255),
});
export const update${pascalName}Schema = create${pascalName}Schema.partial();
export type Create${pascalName} = z.infer<typeof create${pascalName}Schema>;
export type Update${pascalName} = z.infer<typeof update${pascalName}Schema>;
`,
    [`${name}.dto.ts`]: `import type { ${entity} } from './entities/${name}.entity.js';

const ${dto} = (entity: ${entity}) => ({
  id: entity.id,
  name: entity.name,
});

export default ${dto};
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
import ${dto} from './${name}.dto.js';
import {
  create${pascalName}Schema,
  update${pascalName}Schema,
} from './${name}.schema.js';
import type ${service} from './${name}.service.js';

export default class ${controller} {
  readonly name = '${name}';

  constructor(private readonly service: ${service}) {}

  getAll = async (_request: Request, response: Response) => {
    const records = await this.service.getAll();
    response.json({ data: records.map(${dto}) });
  };

  get = async (request: Request<{ id: string }>, response: Response) => {
    const record = await this.service.get(request.params.id);

    if (!record)
      throw new NotFoundError(
        \`\${this.name} with ID \${request.params.id} not found\`,
      );

    response.json({ data: ${dto}(record) });
  };

  create = async (request: Request, response: Response) => {
    const data = parseBody(create${pascalName}Schema, request.body);
    const record = await this.service.create(data);

    response.status(201).json({ data: ${dto}(record) });
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

  const createdDirectories: string[] = [];
  const createdFiles: string[] = [];
  try {
    for (const directory of [
      moduleDirectory,
      join(moduleDirectory, 'entities'),
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

    for (const [filename, contents] of Object.entries(files)) {
      const filePath = join(moduleDirectory, filename);
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
      const config = await prettier.resolveConfig(filePath, {
        editorconfig: true,
      });
      const formatted = await prettier.format(contents, {
        ...config,
        filepath: filePath,
      });

      if (formatted !== contents) await writeFile(filePath, formatted);
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
  }

  if (createdFiles.length === 0) {
    throw new Error('Module Exists!');
  }

  return moduleDirectory;
};
