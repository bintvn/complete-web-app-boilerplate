import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  authMeResponseSchema,
  authMessageResponseSchema,
  authSessionResponseSchema,
  authSessionsResponseSchema,
  authSuccessSchema,
  authTokenResponseSchema,
  changeEmailSchema,
  changePasswordSchema,
  refreshSchema,
  registerSchema,
  resendEmailVerificationSchema,
  signInSchema,
  verifyEmailSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/auth';
import {
  apiErrorSchema,
  requestValidationErrorSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/openapi';
import type OpenapiService from '../openapi/openapi.service.js';

export const authRoutePath = 'auth';

function jsonBody(schema: z.ZodType, required = true) {
  return { required, content: { 'application/json': { schema } } };
}

export function registerAuthOpenApi(service: OpenapiService) {
  const errors = service.errors;
  const badRequest = {
    ...errors.badRequest,
    ...service.jsonResponse(
      'Malformed request or invalid input.',
      z.union([apiErrorSchema, requestValidationErrorSchema])
    ),
  };
  const bodyErrors = { 400: badRequest, 413: errors.payloadTooLarge };
  const setCookie = {
    'Set-Cookie': {
      description:
        'Sets or clears the signed, HttpOnly token cookie when configured.',
      schema: { type: 'string' as const },
    },
  };
  const tokenResponse = {
    ...service.jsonResponse(
      'Access and refresh tokens.',
      authTokenResponseSchema
    ),
    headers: setCookie,
  };
  const signedOut = {
    ...service.jsonResponse('Signed out.', authSuccessSchema),
    headers: setCookie,
  };

  function register(
    route: Omit<RouteConfig, 'tags' | 'security'>,
    bearer = true
  ) {
    service.registry.registerPath({
      ...route,
      path: `/${authRoutePath}${route.path}`,
      tags: ['Auth'],
      security: bearer ? service.bearerSecurity : [],
      responses: {
        ...(bearer && { 400: errors.badRequest, 401: errors.unauthorized }),
        500: errors.internal,
        ...route.responses,
      },
    });
  }

  register(
    {
      method: 'post',
      path: '/sign-up',
      operationId: 'authSignUp',
      summary: 'Register an account',
      request: { body: jsonBody(registerSchema) },
      responses: {
        201: service.jsonResponse('Account created.', authSuccessSchema),
        404: errors.notFound,
        409: errors.conflict,
        ...bodyErrors,
      },
    },
    false
  );
  register(
    {
      method: 'post',
      path: '/sign-in',
      operationId: 'authSignIn',
      summary: 'Sign in',
      request: { body: jsonBody(signInSchema) },
      responses: {
        200: tokenResponse,
        401: errors.unauthorized,
        404: errors.notFound,
        ...bodyErrors,
      },
    },
    false
  );
  register(
    {
      method: 'post',
      path: '/refresh',
      operationId: 'authRefresh',
      summary: 'Refresh access and refresh tokens',
      description:
        'Provide a refresh token in the JSON body or use the signed token cookie. The body token takes precedence.',
      parameters: [
        {
          name: 'token',
          in: 'cookie',
          description: 'Signed refresh token cookie set by the server.',
          schema: { type: 'string' },
        },
      ],
      request: { body: jsonBody(refreshSchema, false) },
      responses: {
        200: tokenResponse,
        401: errors.unauthorized,
        ...bodyErrors,
      },
    },
    false
  );
  register(
    {
      method: 'post',
      path: '/verify/email',
      operationId: 'authVerifyEmail',
      summary: 'Verify an email address',
      request: { body: jsonBody(verifyEmailSchema) },
      responses: {
        200: service.jsonResponse('Email verified.', authSuccessSchema),
        ...bodyErrors,
      },
    },
    false
  );
  register(
    {
      method: 'post',
      path: '/verify/email/resend',
      operationId: 'authResendVerification',
      summary: 'Request another verification email',
      request: { body: jsonBody(resendEmailVerificationSchema) },
      responses: {
        202: service.jsonResponse('Request accepted.', authSuccessSchema),
        ...bodyErrors,
      },
    },
    false
  );
  register({
    method: 'get',
    path: '/me',
    operationId: 'authMe',
    summary: 'Get the current user',
    responses: {
      200: service.jsonResponse('Current user.', authMeResponseSchema),
    },
  });
  register({
    method: 'get',
    path: '/session',
    operationId: 'authSession',
    summary: 'Get the current session',
    responses: {
      200: service.jsonResponse('Current session.', authSessionResponseSchema),
    },
  });
  register({
    method: 'get',
    path: '/sessions',
    operationId: 'authListSessions',
    summary: 'List active sessions',
    responses: {
      200: service.jsonResponse('Active sessions.', authSessionsResponseSchema),
    },
  });
  register({
    method: 'post',
    path: '/sign-out',
    operationId: 'authSignOut',
    summary: 'Sign out of the current session',
    responses: { 200: signedOut },
  });
  register({
    method: 'post',
    path: '/sign-out-all',
    operationId: 'authSignOutAll',
    summary: 'Sign out of all sessions',
    responses: { 200: signedOut },
  });
  register({
    method: 'delete',
    path: '/sessions/{sessionId}',
    operationId: 'authRevokeSession',
    summary: 'Revoke a session',
    request: { params: z.object({ sessionId: z.string() }) },
    responses: {
      200: service.jsonResponse('Session revoked.', authMessageResponseSchema),
      404: errors.notFound,
    },
  });
  register({
    method: 'post',
    path: '/change-password',
    operationId: 'authChangePassword',
    summary: 'Change the current user’s password',
    request: { body: jsonBody(changePasswordSchema) },
    responses: {
      200: service.jsonResponse('Password changed.', authMessageResponseSchema),
      403: service.jsonResponse('Invalid old password.', apiErrorSchema),
      404: errors.notFound,
      ...bodyErrors,
    },
  });
  register({
    method: 'post',
    path: '/change-email',
    operationId: 'authChangeEmail',
    summary: 'Change the user email',
    request: { body: jsonBody(changeEmailSchema) },
    responses: {
      200: service.jsonResponse(
        'Email successfully changed',
        authMessageResponseSchema
      ),
      404: errors.notFound,
      ...bodyErrors,
    },
  });
}
