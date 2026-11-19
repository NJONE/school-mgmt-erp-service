import { Router } from 'express';
import { metadataRegistry } from '../core/metadata/registry/index.js';

export const metadataRouter = Router();

metadataRouter.get('/', (_request, response) => {
  response.json({ success: true, data: metadataRegistry.listEntities() });
});

metadataRouter.get('/modules', (_request, response) => {
  response.json({ success: true, data: metadataRegistry.listModules() });
});

metadataRouter.get('/:entity/form', (request, response) => {
  const metadata = metadataRegistry.getByEntityCode(request.params.entity);
  if (!metadata) {
    response.status(404).json({
      success: false,
      message: 'Metadata entity not found',
      requestId: request.id,
    });
    return;
  }
  response.json({ success: true, data: metadata.formLayout });
});

metadataRouter.get('/:entity/table', (request, response) => {
  const metadata = metadataRegistry.getByEntityCode(request.params.entity);
  if (!metadata) {
    response.status(404).json({
      success: false,
      message: 'Metadata entity not found',
      requestId: request.id,
    });
    return;
  }
  response.json({ success: true, data: metadata.tableLayout });
});

metadataRouter.get('/:entity/filters', (request, response) => {
  const metadata = metadataRegistry.getByEntityCode(request.params.entity);
  if (!metadata) {
    response.status(404).json({
      success: false,
      message: 'Metadata entity not found',
      requestId: request.id,
    });
    return;
  }
  response.json({ success: true, data: metadata.filterLayout });
});

metadataRouter.get('/:entity', (request, response) => {
  const metadata = metadataRegistry.getByEntityCode(request.params.entity);
  if (!metadata) {
    response.status(404).json({
      success: false,
      message: 'Metadata entity not found',
      requestId: request.id,
    });
    return;
  }
  response.json({ success: true, data: metadata });
});
