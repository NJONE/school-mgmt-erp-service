import type { EntityMetadata } from '../interfaces/metadata.js';
import { classMetadata } from './class.metadata.js';
import { sectionMetadata } from './section.metadata.js';
import { subjectMetadata } from './subject.metadata.js';
import { tenantMetadata } from './tenant.metadata.js';
import { userMetadata } from './user.metadata.js';
import { roleMetadata } from './role.metadata.js';
import { permissionMetadata } from './permission.metadata.js';
import { phase5Metadata } from './phase5.metadata.js';
import { phase6Metadata } from './phase6.metadata.js';
import { phase7Metadata } from './phase7.metadata.js';
import { phase8Metadata } from './phase8.metadata.js';
import { remainingCatalogMetadata } from './remaining-catalog.metadata.js';

export const initialEntityMetadata: EntityMetadata[] = [
  classMetadata,
  sectionMetadata,
  subjectMetadata,
  tenantMetadata,
  userMetadata,
  roleMetadata,
  permissionMetadata,
  ...phase5Metadata,
  ...phase6Metadata,
  ...phase7Metadata,
  ...phase8Metadata,
  ...remainingCatalogMetadata,
];
