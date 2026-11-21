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

To run the service and MongoDB locally with Docker:

```sh
docker compose up --build
```

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
