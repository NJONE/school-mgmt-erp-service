# Architecture

## Initial service boundary

This repository contains the Node.js API only. The first implementation slice
provides an Express application, MongoDB connection lifecycle, validated
environment configuration, structured logging, health/readiness endpoints, and
a metadata registry. Authentication, tenant context, CRUD persistence, and
business workflows are intentionally not exposed until their authorization and
database constraints are implemented.

## Runtime flow

`server.ts` validates process configuration, connects to MongoDB, and only then
starts the HTTP listener. `app.ts` configures security headers, CORS, JSON size
limits, request logging, health endpoints, and API routes. Errors are normalized
to a request-ID-bearing response; internal error details are not returned in
production.

## Metadata design

Entity definitions are static, reviewed TypeScript modules. Zod validates their
shape and the registry validates field/layout references, duplicate entity and
field keys, and cross-entity lookup/relationship targets. The registry loads the
initial entity batch at import/startup time and does not accept client-defined
metadata or collection names.

The UI metadata endpoints expose definitions and layouts only. They are not a
generic database access mechanism. Entity persistence must be implemented
separately with explicit Mongoose schemas and authenticated tenant/school/
branch scope.

## Initial modules

The registry currently includes schools, branches, students, parents, staff,
classes, sections, and subjects. Student metadata is the reference form/table
definition, including student-specific tabs, columns, and filtering.

## Local operation

Copy `.env.example` to `.env`, provide a MongoDB URI, then run `npm install`,
`npm run dev`, `npm run build`, and `npm test`. `docker compose up --build`
starts the API and a local MongoDB instance.
