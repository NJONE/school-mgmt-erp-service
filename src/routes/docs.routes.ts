import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

const openApiPath = fileURLToPath(
  new URL('../../openapi.yaml', import.meta.url),
);
const openApiDocument = parse(readFileSync(openApiPath, 'utf8')) as Record<
  string,
  unknown
>;

export const docsRouter = Router();

docsRouter.get('/openapi.json', (_request, response) => {
  response.json(openApiDocument);
});

docsRouter.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    explorer: true,
    swaggerOptions: { displayRequestDuration: true },
  }),
);
