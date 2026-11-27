# Complete Web App Boilerplate

## Current Status

Developing...

## Description

A starter project for building full-stack web applications. It brings a public-facing website, an admin dashboard, and a backend API into one workspace. It includes reusable UI components and common features such as account registration, sign-in, email verification, password reset, and role-based access control.

## Technology Stack

- **Public website** — Next.js and React
- **Admin dashboard** — React and Vite
- **Backend API** — Node.js and Express
- **Database** — MySQL with TypeORM
- **UI and styling** — shadcn/ui and Tailwind CSS
- **Language and validation** — TypeScript and Zod
- **Workspace tooling** — pnpm and Turborepo

## API documentation

Start the development API from the workspace root with `pnpm dev:api`. With the `HOST` and `PORT` values in `apps/api/.env.example`, the Scalar API reference is available at [http://127.0.0.1:3000/docs](http://127.0.0.1:3000/docs), and the OpenAPI JSON is available at [http://127.0.0.1:3000/docs/openapi.json](http://127.0.0.1:3000/docs/openapi.json) or [http://127.0.0.1:3000/openapi.json](http://127.0.0.1:3000/openapi.json).

Protected operations require a Bearer access token. Scalar loads its interface assets from jsDelivr.

## Email verification API

Set `OTP_SECRET` to a dedicated random secret of at least 32 bytes in the API environment. For example, generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_FROM_EMAIL`. Set `SMTP_LOGIN_EMAIL` and `SMTP_LOGIN_PASSWORD` together if the SMTP server requires authentication. Development startup uses the existing TypeORM schema synchronization to create the verification table.

These endpoints accept `application/json` and can be called before sign-in without cookies or an access token.

| Request                          | JSON body                                                                            | Successful response              |
| -------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| `POST /auth/sign-up`             | `{ "name": "Example", "email": "user@example.com", "password": "example-password" }` | `201` with `{ "success": true }` |
| `POST /auth/verify/email/resend` | `{ "email": "user@example.com" }`                                                    | `202` with `{ "success": true }` |
| `POST /auth/verify/email`        | `{ "email": "user@example.com", "code": "042613" }`                                  | `200` with `{ "success": true }` |

After registration, call `/auth/verify/email/resend` to request the first code. Registration creates the account without sending an email. Use the same endpoint to request another code. Its `202` response acknowledges the request and is the same for ineligible accounts, rate-limited requests, and delivery failures.

Submit the code as a six-digit string. Codes expire after 10 minutes and allow at most five attempts. Sending is limited to once per minute and five times in a rolling hour per account, starting with the first code request. Issuing a new code invalidates the previous one.

The API returns `400 EMAIL_VERIFICATION_INVALID` for a well-formed code that cannot be used and `400 VALIDATION_ERROR` for invalid request fields. After verification, call `POST /auth/sign-in` to create a session. A correct password for a pending account returns `400 EMAIL_NOT_VERIFIED`.
