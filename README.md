# School Management ERP Service

Multi-tenant school management ERP backend built with Node.js, Express,
TypeScript, MongoDB/Mongoose, and Zod.

## Requirements

- Node.js 22 or later
- npm
- MongoDB (or Docker Compose for a local MongoDB instance)

## Getting started

```sh
npm install
cp .env.example .env
# Set MONGODB_URI in .env to a reachable MongoDB instance.
npm run dev
```

The API listens on port `3000` by default. `GET /health` checks that the
process is responding; `GET /ready` reports readiness after the database
connection is established. Initial metadata endpoints are under
`/api/v1/metadata`.

Interactive API documentation is available at
[`http://localhost:3000/api-docs`](http://localhost:3000/api-docs), with the
OpenAPI document at `http://localhost:3000/openapi.json`. Use **Authorize** in
Swagger UI to provide a bearer access token before trying protected endpoints.

To run the service and MongoDB locally with Docker:

```sh
docker compose up --build
```

## Sample school administrator

Set these variables in `.env` with a unique, strong password before running the
seed command:

```dotenv
SEED_TENANT_NAME="Sample School"
SEED_TENANT_CODE="SAMPLE"
SEED_ADMIN_NAME="School Administrator"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="replace-with-a-unique-password-of-at-least-12-characters"
```

Then run:

```sh
npm run seed:admin
```

This creates or updates the sample tenant's `school-admin` role and admin
account. The account receives the `*` permission, which grants all permissions
checked by the API, while remaining scoped to that tenant. Re-running the
command does not reset an existing account's password. The seed data is for
development and should not be used as a production account configuration.

## Development checks

```sh
npm run build
npm test
npm run lint
npm run format:check
```

See [the architecture overview](docs/architecture/architecture.md) for the
current service boundaries and metadata registration model. The initial API
contract is in [openapi.yaml](./openapi.yaml).

Phase 3 and the initial Phase 4 implementation are included: JWT authentication,
refresh-token rotation, tenant-scoped identity, role/permission enforcement,
and metadata allowlisted CRUD with pagination, search, filtering, sorting,
soft deletion, and cross-tenant scope.

Phases 5–8 add registered metadata and secured workflow routes for student
promotion, bulk student attendance, examination result publishing, fee
payments, payroll processing, notification delivery queues, and document
generation jobs. Domain records remain accessible through the generic entity
API and are tenant/school/branch/session scoped according to their metadata.
