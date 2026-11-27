import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import jwt from 'jsonwebtoken';
import createApp from '../src/core/app.ts';
import { appConfig } from '../src/core/app-config.ts';
import { dbMain } from '../src/core/index.ts';
import { toResponse } from '../src/core/response-serializer.ts';
import { AuthService } from '../src/core/modules/auth/auth.service.ts';
import UserService from '../src/core/modules/user/user.service.ts';
import { categoryResponseSchema } from '@complete-web-app-boilerplate/shared/modules/category';
import { postResponseSchema } from '@complete-web-app-boilerplate/shared/modules/post';
import { descriptionSchema } from '@complete-web-app-boilerplate/shared/core/validation';

const id = 'bbacf738-b91b-4e49-8900-d848a5dc9830';
const missingId = 'fe6924f8-29b7-443a-9064-b07b6b59961a';
const emptyId = '6115e6db-8bf8-4915-a8da-886a1d1fed2b';
const timestamp = '2026-11-27T00:00:00.000Z';
const samples = [
  {
    path: '/posts',
    entity: 'PostEntity',
    body: { title: 'Example post', slug: 'example-post' },
    record: { id, title: 'Example post', slug: 'example-post', content: null },
    relation: 'categories',
    target: 'category',
    component: 'Post',
    schema: postResponseSchema,
  },
  {
    path: '/categories',
    entity: 'CategoryEntity',
    body: { name: 'Example category', slug: 'example-category' },
    record: { id, name: 'Example category', slug: 'example-category' },
    relation: 'posts',
    target: 'post',
    component: 'Category',
    schema: categoryResponseSchema,
  },
];

const linkedRecords = samples.map(({ record }) => ({
  ...record,
  createdAt: new Date(timestamp),
  updatedAt: new Date(timestamp),
  deletedAt: null,
  disabled: false,
  privateField: 'excluded from the response',
}));
const [post, category] = linkedRecords;
const links = [{ post, category }, {}];
post.categoryPosts = links;
category.categoryPosts = links;

const coreFields = {
  id,
  createdAt: timestamp,
  updatedAt: timestamp,
  disabled: false,
};
const coreRecord = {
  ...coreFields,
  createdAt: new Date(timestamp),
  updatedAt: new Date(timestamp),
  deletedAt: null,
};
const userFields = {
  name: 'Example user',
  email: 'test@example.com',
  isEmailVerified: true,
};
const roleFields = {
  name: 'Example role',
  slug: 'example-role',
  description: null,
};
const moduleFields = {
  name: 'Example module',
  code: 'EXAMPLE',
  description: null,
  routePath: null,
};
const permissions = {
  canRead: true,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
};
const userRecord = { ...coreRecord, ...userFields, passwordHash: 'private' };
const roleRecord = { ...coreRecord, ...roleFields, accessControls: [] };
const moduleRecord = { ...coreRecord, ...moduleFields, accessControls: [] };
const accessRecord = {
  ...coreRecord,
  ...permissions,
  role: roleRecord,
  module: moduleRecord,
};

const repositories = new Map(
  samples.map(({ entity, record, target }, index) => [
    entity,
    {
      manager: {},
      find: async ({ relations } = {}) => [
        relations?.categoryPosts?.[target] ? linkedRecords[index] : record,
        { ...record, id: emptyId, categoryPosts: [] },
      ],
      findOne: async ({ where, relations }) => {
        if (where.id === emptyId) return { ...record, id: emptyId };
        if (where.id !== id) return null;
        return relations?.categoryPosts?.[target]
          ? linkedRecords[index]
          : record;
      },
      create: (data) => ({ ...record, ...data }),
      save: async (entity) => entity,
      update: async () => ({ affected: 1 }),
      delete: async (resourceId) => ({ affected: Number(resourceId === id) }),
    },
  ])
);
const dataSource = {
  getRepository: (entity) => repositories.get(entity.name) ?? { manager: {} },
};
const coreResources = [
  {
    path: '/users',
    entity: 'UserEntity',
    record: userRecord,
    fields: userFields,
    create: {
      name: userFields.name,
      email: userFields.email,
      password: 'fixture-password',
      roleId: id,
    },
  },
  {
    path: '/roles',
    entity: 'RoleEntity',
    record: roleRecord,
    fields: roleFields,
    create: { name: roleFields.name, slug: roleFields.slug },
  },
  {
    path: '/modules',
    entity: 'ModuleEntity',
    record: moduleRecord,
    fields: moduleFields,
    create: { name: moduleFields.name, slug: 'example-module' },
  },
  {
    path: '/access-control',
    entity: 'AccessControlEntity',
    record: accessRecord,
    fields: {
      ...permissions,
      role: { ...coreFields, ...roleFields },
      module: { ...coreFields, ...moduleFields },
    },
    create: { ...permissions, roleId: id, moduleId: id },
    createdFields: { ...permissions, role: { id }, module: { id } },
  },
];
for (const { entity, record } of coreResources) {
  const target = { name: entity };
  repositories.set(entity, {
    target,
    manager: { transaction: async (callback) => callback(dataSource) },
    find: async () => [record],
    findOne: async ({ where }) => {
      if (where.id === emptyId && entity === 'AccessControlEntity')
        return { ...record, id: emptyId, role: undefined, module: undefined };
      if (where.id === emptyId && entity === 'UserEntity')
        return { ...record, id: emptyId, name: undefined };
      return where.id === id ? record : null;
    },
    create: (data) => ({ ...record, ...data }),
    save: async (record) => record,
    update: async () => ({ affected: 1 }),
    delete: async (resourceId) => ({ affected: Number(resourceId === id) }),
  });
}
const config = appConfig(() => ({
  auth: {
    accessSecret: randomBytes(32).toString('hex'),
    verification: { otpSecret: randomBytes(32).toString('hex') },
  },
}));
const token = jwt.sign(
  { sub: id, sid: id, email: 'test@example.com', roles: [], type: 'access' },
  config.auth.accessSecret,
  { issuer: config.auth.issuer, audience: config.auth.audience }
);

let server;
let origin;

before(async () => {
  server = createApp(config, dataSource).listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

function request(
  path,
  { method = 'GET', authenticated = false, body, cookie } = {}
) {
  return fetch(`${origin}${path}`, {
    method,
    redirect: 'manual',
    headers: {
      ...(authenticated && { Authorization: `Bearer ${token}` }),
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(cookie && { Cookie: cookie }),
    },
    body: JSON.stringify(body),
  });
}

test('OpenAPI describes the two modules and their security and request schemas', async () => {
  const response = await request('/docs/openapi.json');
  assert.equal(response.status, 200);
  const spec = await response.json();
  const legacyResponse = await request('/openapi.json');
  assert.equal(legacyResponse.status, 200);
  await legacyResponse.text();
  assert.equal(spec.openapi, '3.1.1');
  for (const component of ['ApiError', 'Category', 'Post']) {
    assert.ok(spec.components.schemas[component]);
  }
  assert.deepEqual(spec.servers, [{ url: '/' }]);
  assert.deepEqual(spec.components.securitySchemes.bearerAuth, {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });
  const operationIds = new Set();
  for (const { path, body, component, relation } of samples) {
    const relationItem =
      spec.components.schemas[component].properties[relation].items;
    assert.equal(relationItem.properties.createdAt.format, 'date-time');
    assert.equal(relationItem.properties.updatedAt.format, 'date-time');
    assert.equal(relationItem.properties.deletedAt.format, 'date-time');
    assert.equal(relationItem.properties.disabled.type, 'boolean');
    assert.equal(relationItem.properties.categoryPosts, undefined);
    assert.equal(relationItem.properties.posts, undefined);
    assert.equal(relationItem.properties.categories, undefined);
    const collection = spec.paths[path];
    const item = spec.paths[`${path}/{id}`];
    assert.deepEqual(Object.keys(collection).sort(), ['get', 'post']);
    assert.deepEqual(Object.keys(item).sort(), ['delete', 'get', 'patch']);
    assert.deepEqual(collection.get.security, []);
    assert.deepEqual(item.get.security, []);
    for (const operation of [collection.post, item.patch, item.delete]) {
      assert.deepEqual(operation.security, [{ bearerAuth: [] }]);
      assert.ok(operation.responses[401]);
    }
    for (const operation of [
      ...Object.values(collection),
      ...Object.values(item),
    ]) {
      assert.ok(operation.operationId);
      operationIds.add(operation.operationId);
    }
    for (const operation of [item.patch, item.delete]) {
      assert.ok(operation.responses[204]);
      assert.equal(operation.responses[204].content, undefined);
    }
    assert.equal(item.get.parameters[0].schema.format, undefined);
    assert.equal(item.delete.parameters[0].schema.format, undefined);
    assert.equal(item.patch.parameters[0].schema.format, 'uuid');
    const create =
      collection.post.requestBody.content['application/json'].schema;
    const update = item.patch.requestBody.content['application/json'].schema;
    assert.deepEqual(create.required.sort(), Object.keys(body).sort());
    assert.equal(create.additionalProperties, false);
    assert.equal(update.additionalProperties, false);
    assert.equal(update.required, undefined);
  }
  assert.equal(operationIds.size, 10);
});

test('OpenAPI documents all core operations with the existing authentication and responses', async () => {
  const response = await request('/docs/openapi.json');
  assert.equal(response.status, 200);
  const spec = await response.json();
  const publicAuthPaths = [
    '/auth/sign-up',
    '/auth/sign-in',
    '/auth/refresh',
    '/auth/verify/email',
    '/auth/verify/email/resend',
  ];
  const protectedAuthPaths = [
    ['/auth/me', 'get'],
    ['/auth/session', 'get'],
    ['/auth/sessions', 'get'],
    ['/auth/sign-out', 'post'],
    ['/auth/sign-out-all', 'post'],
    ['/auth/sessions/{sessionId}', 'delete'],
    ['/auth/change-password', 'post'],
  ];
  const authOperations = Object.entries(spec.paths)
    .filter(([path]) => path.startsWith('/auth/'))
    .flatMap(([, operations]) => Object.values(operations));
  assert.equal(
    authOperations.length,
    publicAuthPaths.length + protectedAuthPaths.length
  );
  for (const path of publicAuthPaths)
    assert.deepEqual(spec.paths[path].post.security, []);
  for (const [path, method] of protectedAuthPaths) {
    assert.deepEqual(spec.paths[path][method].security, [{ bearerAuth: [] }]);
  }
  const refresh = spec.paths['/auth/refresh'].post;
  assert.equal(refresh.requestBody.required, false);
  assert.ok(
    refresh.parameters.some(
      (value) => value.in === 'cookie' && value.name === 'token'
    )
  );
  assert.ok(refresh.responses[200].headers['Set-Cookie']);
  assert.equal(
    refresh.responses[400].content['application/json'].schema.anyOf.length,
    2
  );
  assert.ok(
    spec.paths['/auth/sign-out'].post.responses[200].headers['Set-Cookie']
  );

  assert.deepEqual(spec.paths['/docs/openapi.json'].get.tags, ['OpenAPI']);
  assert.deepEqual(spec.paths['/docs/openapi.json'].get.security, []);
  assert.equal(spec.paths['/docs'], undefined);
  assert.equal(spec.paths['/session'], undefined);
  for (const { path } of coreResources) {
    const collection = spec.paths[path];
    const item = spec.paths[`${path}/{id}`];
    assert.deepEqual(Object.keys(collection).sort(), ['get', 'post']);
    assert.deepEqual(Object.keys(item).sort(), ['delete', 'get', 'patch']);
    for (const operation of [
      ...Object.values(collection),
      ...Object.values(item),
    ]) {
      assert.deepEqual(operation.security, [{ bearerAuth: [] }]);
    }
    assert.equal(item.patch.parameters[0].schema.format, 'uuid');
    assert.equal(item.patch.responses[204].content, undefined);
    assert.equal(item.delete.responses[204].content, undefined);
    assert.equal(Boolean(item.get.responses[404]), path === '/users');
  }
});

test('core CRUD serializes the existing fields and preserves status codes', async (t) => {
  t.mock.method(UserService.prototype, 'create', async () => userRecord);
  for (const { path, fields, create, createdFields } of coreResources) {
    const item = `${path}/${id}`;
    const unauthorized = await request(path);
    assert.equal(unauthorized.status, 401);
    await unauthorized.text();
    const list = await request(path, { authenticated: true });
    assert.equal(list.status, 200);
    assert.deepEqual(await list.json(), {
      data: [{ ...coreFields, ...fields }],
    });
    const get = await request(item, { authenticated: true });
    assert.equal(get.status, 200);
    assert.deepEqual(await get.json(), { data: { ...coreFields, ...fields } });

    const created = await request(path, {
      method: 'POST',
      authenticated: true,
      body: create,
    });
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), {
      data: { ...coreFields, ...(createdFields ?? fields) },
    });
    const patched = await request(item, {
      method: 'PATCH',
      authenticated: true,
      body: {},
    });
    assert.equal(patched.status, 204);
    assert.equal(await patched.text(), '');
    const deleted = await request(item, {
      method: 'DELETE',
      authenticated: true,
    });
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), '');
    const missing = await request(`${path}/${missingId}`, {
      method: 'DELETE',
      authenticated: true,
    });
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).code, 'NOT_FOUND');
  }
  const withoutRelations = await request(`/access-control/${emptyId}`, {
    authenticated: true,
  });
  assert.equal(withoutRelations.status, 200);
  assert.deepEqual(await withoutRelations.json(), {
    data: {
      ...coreFields,
      id: emptyId,
      ...permissions,
      role: null,
      module: null,
    },
  });
  const missing = await request(`/users/${missingId}`, { authenticated: true });
  assert.equal(missing.status, 404);
  await missing.text();
  const invalidResponse = await request(`/users/${emptyId}`, {
    authenticated: true,
  });
  assert.equal(invalidResponse.status, 500);
  assert.equal((await invalidResponse.json()).code, 'INTERNAL_SERVER_ERROR');
});

test('auth serializes tokens, users, and sessions while preserving signed cookies', async (t) => {
  const tokens = {
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
    tokenType: 'Bearer',
    accessTokenExpiresIn: 300,
    refreshTokenExpiresIn: 3600,
  };
  const session = {
    id,
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(timestamp),
    lastUsedAt: null,
    expiresAt: new Date(timestamp),
    isCurrent: true,
  };
  const expectedSession = {
    ...session,
    createdAt: timestamp,
    expiresAt: timestamp,
  };
  t.mock.method(AuthService.prototype, 'signin', async () => ({
    ...tokens,
    internal: 'hidden',
  }));
  const refresh = t.mock.method(
    AuthService.prototype,
    'refresh',
    async () => tokens
  );
  t.mock.method(AuthService.prototype, 'me', async () => userRecord);
  t.mock.method(AuthService.prototype, 'getSession', async () => ({
    ...session,
    refreshTokenHash: 'private',
  }));
  t.mock.method(AuthService.prototype, 'getActiveSessions', async () => [
    session,
  ]);
  t.mock.method(AuthService.prototype, 'signout', async () => undefined);

  const malformed = await request('/auth/sign-in', {
    method: 'POST',
    body: {},
  });
  assert.equal(malformed.status, 400);
  const validation = await malformed.json();
  assert.equal(validation.code, 'VALIDATION_ERROR');
  assert.ok(validation.errors.length > 0);
  const signedIn = await request('/auth/sign-in', {
    method: 'POST',
    body: { email: userFields.email, password: 'fixture-password' },
  });
  assert.equal(signedIn.status, 200);
  assert.deepEqual(await signedIn.json(), { success: true, data: tokens });
  const setCookie = signedIn.headers.getSetCookie()[0];
  assert.match(setCookie, /^token=s%3A/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
  const cookie = setCookie.split(';')[0];

  for (const [body, expectedToken] of [
    [undefined, tokens.refreshToken],
    [{ refreshToken: 'body-token' }, 'body-token'],
  ]) {
    const refreshed = await request('/auth/refresh', {
      method: 'POST',
      body,
      cookie,
    });
    assert.equal(refreshed.status, 200);
    assert.deepEqual(await refreshed.json(), { success: true, data: tokens });
    assert.equal(refresh.mock.calls.at(-1).arguments[0], expectedToken);
    assert.match(refreshed.headers.getSetCookie()[0], /^token=s%3A/);
  }
  const missingToken = await request('/auth/refresh', { method: 'POST' });
  assert.equal(missingToken.status, 401);
  assert.equal((await missingToken.json()).code, 'TOKEN_MISSING');

  for (const [path, expected] of [
    ['/auth/me', { ...coreFields, ...userFields }],
    ['/auth/session', expectedSession],
    ['/auth/sessions', [expectedSession]],
  ]) {
    const unauthorized = await request(path);
    assert.equal(unauthorized.status, 401);
    await unauthorized.text();
    const result = await request(path, { authenticated: true });
    assert.equal(result.status, 200);
    assert.deepEqual(await result.json(), { success: true, data: expected });
  }
  const signedOut = await request('/auth/sign-out', {
    method: 'POST',
    authenticated: true,
  });
  assert.equal(signedOut.status, 200);
  assert.deepEqual(await signedOut.json(), { success: true });
  assert.match(
    signedOut.headers.getSetCookie()[0],
    /^token=.*Expires=Thu, 01 Jan 1970/
  );
});

for (const [index, sample] of samples.entries()) {
  const { path, body, record, relation, schema } = sample;
  test(`${path} matches its documented public reads and protected writes`, async () => {
    const itemPath = `${path}/${id}`;
    const resource = { ...record, [relation]: [] };
    const emptyResource = { ...resource, id: emptyId };
    const related = {
      ...record,
      [relation]: [
        {
          ...samples[1 - index].record,
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          disabled: false,
        },
        null,
      ],
    };
    const list = await request(path);
    assert.equal(list.status, 200);
    assert.deepEqual(await list.json(), { data: [related, emptyResource] });

    const detail = await request(itemPath);
    assert.equal(detail.status, 200);
    const detailBody = await detail.json();
    assert.deepEqual(detailBody, { data: related });
    assert.equal(schema.safeParse(detailBody.data).success, true);

    const empty = await request(`${path}/${emptyId}`);
    assert.equal(empty.status, 200);
    assert.deepEqual(await empty.json(), { data: emptyResource });

    const absentPath = `${path}/${missingId}`;
    const missing = await request(absentPath);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).code, 'NOT_FOUND');

    for (const [method, target] of [
      ['POST', path],
      ['PATCH', itemPath],
      ['DELETE', itemPath],
    ]) {
      const refused = await request(target, { method });
      assert.equal(refused.status, 401);
      assert.equal(refused.headers.get('WWW-Authenticate'), 'Bearer');
      assert.equal((await refused.json()).code, 'TOKEN_MISSING');
    }

    const created = await request(path, {
      method: 'POST',
      authenticated: true,
      body,
    });
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), { data: resource });

    const updated = await request(itemPath, {
      method: 'PATCH',
      authenticated: true,
      body,
    });
    assert.equal(updated.status, 204);
    assert.equal(await updated.text(), '');

    const deleted = await request(itemPath, {
      method: 'DELETE',
      authenticated: true,
    });
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), '');

    const badId = await request(`${path}/invalid-id`, {
      method: 'PATCH',
      authenticated: true,
      body,
    });
    assert.equal(badId.status, 400);
    assert.equal((await badId.json()).details[0].field, 'id');

    for (const [method, target] of [
      ['POST', path],
      ['PATCH', itemPath],
    ]) {
      const invalid = await request(target, {
        method,
        authenticated: true,
        body: { ...body, extraField: true },
      });
      assert.equal(invalid.status, 422);
      assert.equal((await invalid.json()).code, 'VALIDATION_ERROR');
    }
  });
}

test('response validation failures are internal server errors', () => {
  assert.throws(() => toResponse(postResponseSchema, {}), {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
  });
});

test('TypeORM builds joins through the correct foreign keys in both directions', async () => {
  const source = dbMain(config);
  await source.buildMetadatas();

  for (const { entity, target } of samples) {
    const repository = source.getRepository(entity);
    const link =
      repository.metadata.findRelationWithPropertyPath('categoryPosts');
    const other =
      link.inverseEntityMetadata.findRelationWithPropertyPath(target);
    const sourceKey = entity === 'PostEntity' ? 'post_id' : 'category_id';
    const targetKey = target === 'post' ? 'post_id' : 'category_id';
    assert.equal(link.inverseRelation.joinColumns[0].databaseName, sourceKey);
    assert.equal(other.joinColumns[0].databaseName, targetKey);

    const sql = repository
      .createQueryBuilder('root')
      .setFindOptions({ relations: { categoryPosts: { [target]: true } } })
      .getSql();
    assert.match(
      sql,
      new RegExp('ON `[^`]+`\\.`' + sourceKey + '`\\s*=\\s*`root`\\.`id`')
    );
    assert.match(
      sql,
      new RegExp('ON `[^`]+`\\.`id`\\s*=\\s*`[^`]+`\\.`' + targetKey + '`')
    );
  }
});

test('shared description validation measures UTF-8 bytes', () => {
  const atLimit = 'é'.repeat(32_767) + 'a';
  assert.equal(descriptionSchema.parse(atLimit), atLimit);
  assert.equal(descriptionSchema.parse(undefined), undefined);
  const tooLong = descriptionSchema.safeParse(atLimit + 'b');
  assert.equal(tooLong.success, false);
  assert.equal(
    tooLong.error.issues[0].message,
    'Description must be at most 65,535 bytes in UTF-8'
  );
});

test('Scalar reference loads and trailing slash follows the API setting', async () => {
  const docs = await request('/docs');
  assert.equal(docs.status, 200);
  assert.match(
    docs.headers.get('content-security-policy'),
    /script-src 'self' https:\/\/cdn\.jsdelivr\.net 'nonce-/
  );
  const html = await docs.text();

  assert.match(html, /Scalar API Reference/);
  assert.match(html, /\/docs\/openapi\.json/);
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/@scalar\/api-reference/);

  for (const path of ['/docs', '/docs/openapi.json']) {
    const trailing = await request(`${path}/?sample=test`);
    if (process.env.REDIRECT_TRAILING_SLASH === 'true') {
      assert.equal(trailing.status, 308);
      assert.equal(trailing.headers.get('location'), `${path}?sample=test`);
      const target = await request(trailing.headers.get('location'));
      assert.equal(target.status, 200);
      await target.text();
    } else {
      assert.equal(trailing.status, 200);
    }
    await trailing.text();
  }
});
