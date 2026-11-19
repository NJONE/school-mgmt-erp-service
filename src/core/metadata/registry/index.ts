import { initialEntityMetadata } from '../definitions/index.js';
import { MetadataRegistryService } from './metadata-registry.js';

export const metadataRegistry = new MetadataRegistryService();
metadataRegistry.registerMany(initialEntityMetadata);

export { MetadataRegistryService } from './metadata-registry.js';
export type { MetadataValidationReport } from './metadata-registry.js';
