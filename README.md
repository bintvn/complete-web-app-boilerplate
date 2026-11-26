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

## Email verification API

Set `OTP_SECRET` to a dedicated random secret of at least 32 bytes in the API environment. For example, generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_FROM_EMAIL`. Set `SMTP_LOGIN_EMAIL` and `SMTP_LOGIN_PASSWORD` together if the SMTP server requires authentication. Development startup uses the existing TypeORM schema synchronization to create the verification table.

These endpoints accept `application/json` and can be called before sign-in without cookies or an access token.

| Request                          | JSON body                                                                            | Successful response                                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/sign-up`             | `{ "name": "Example", "email": "user@example.com", "password": "example-password" }` | `201` with `{ "success": true, "data": { "verificationDelivery": "sent" } }`. `verificationDelivery` is `retry_required` if SMTP did not confirm acceptance. The account can request another code. |
| `POST /auth/verify/email`        | `{ "email": "user@example.com", "code": "042613" }`                                  | `200` with `{ "success": true }`. The code must be a six-digit string.                                                                                                                             |
| `POST /auth/verify/email/resend` | `{ "email": "user@example.com" }`                                                    | `202` with `{ "success": true }`. This response acknowledges the request and is the same for accounts that are ineligible, rate-limited, or encounter delivery failure.                            |

Codes expire after 10 minutes and allow at most five attempts. Sending is limited to once per minute and five times in a rolling hour per account for email verification, including the initial send. Issuing a new code invalidates the previous one.

The API returns `400 EMAIL_VERIFICATION_INVALID` for a well-formed code that cannot be used and `400 VALIDATION_ERROR` for invalid request fields. After verification, call `POST /auth/sign-in` to create a session. A correct password for a pending account returns `400 EMAIL_NOT_VERIFIED`.
