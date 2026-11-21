import { baseEntity, field } from './helpers.js';
import type { EntityMetadata } from '../interfaces/metadata.js';

interface CatalogEntry {
  entity: string;
  title: string;
  module: string;
  transaction?: boolean;
  academicSessionScoped?: boolean;
  schoolScoped?: boolean;
  branchScoped?: boolean;
}

const entries: CatalogEntry[] = [
  { entity: 'platformSettings', title: 'Platform Setting', module: 'platform' },
  {
    entity: 'platformUsers',
    title: 'Platform User',
    module: 'platform',
    transaction: true,
  },
  { entity: 'platformRoles', title: 'Platform Role', module: 'platform' },
  {
    entity: 'platformPermissions',
    title: 'Platform Permission',
    module: 'platform',
  },
  { entity: 'featureFlags', title: 'Feature Flag', module: 'platform' },
  {
    entity: 'platformAuditLogs',
    title: 'Platform Audit Log',
    module: 'platform',
    transaction: true,
  },
  {
    entity: 'tenantSettings',
    title: 'Tenant Setting',
    module: 'subscriptions',
  },
  { entity: 'tenantDomains', title: 'Tenant Domain', module: 'tenants' },
  {
    entity: 'schoolSettings',
    title: 'School Setting',
    module: 'schools',
    schoolScoped: true,
  },
  {
    entity: 'schoolBranding',
    title: 'School Branding',
    module: 'schools',
    schoolScoped: true,
  },
  {
    entity: 'schoolCalendars',
    title: 'School Calendar',
    module: 'schools',
    schoolScoped: true,
  },
  {
    entity: 'leaveTypes',
    title: 'Leave Type',
    module: 'leave',
    schoolScoped: true,
    branchScoped: true,
  },
  {
    entity: 'leavePolicies',
    title: 'Leave Policy',
    module: 'leave',
    schoolScoped: true,
    branchScoped: true,
  },
  {
    entity: 'leaveRequests',
    title: 'Leave Request',
    module: 'leave',
    schoolScoped: true,
    branchScoped: true,
    transaction: true,
  },
  {
    entity: 'leaveBalances',
    title: 'Leave Balance',
    module: 'leave',
    schoolScoped: true,
    branchScoped: true,
    transaction: true,
  },
  {
    entity: 'auditLogs',
    title: 'Audit Log',
    module: 'system',
    schoolScoped: true,
    branchScoped: true,
    transaction: true,
  },
  { entity: 'systemSettings', title: 'System Setting', module: 'system' },
  {
    entity: 'applicationSettings',
    title: 'Application Setting',
    module: 'system',
    schoolScoped: true,
  },
  { entity: 'lookupValues', title: 'Lookup Value', module: 'system' },
  {
    entity: 'customFields',
    title: 'Custom Field',
    module: 'system',
    schoolScoped: true,
  },
  {
    entity: 'entitySequences',
    title: 'Entity Sequence',
    module: 'system',
    schoolScoped: true,
  },
  {
    entity: 'importJobs',
    title: 'Import Job',
    module: 'system',
    schoolScoped: true,
    transaction: true,
  },
  {
    entity: 'importJobErrors',
    title: 'Import Job Error',
    module: 'system',
    schoolScoped: true,
    transaction: true,
  },
];

export const remainingCatalogMetadata: EntityMetadata[] = entries.map((entry) =>
  baseEntity({
    entity: entry.entity,
    title: entry.title,
    pluralTitle: `${entry.title}s`,
    description: `Production metadata for ${entry.title.toLowerCase()} records.`,
    module: entry.module,
    entityType: entry.transaction ? 'transaction' : 'master',
    scopes: {
      schoolScoped: entry.schoolScoped ?? false,
      branchScoped: entry.branchScoped ?? false,
      academicSessionScoped: entry.academicSessionScoped ?? false,
    },
    fields: [
      field('id', `${entry.title} ID`, 'readonly', {
        required: true,
        readonly: true,
        visibleInForm: false,
        importable: false,
      }),
      field('tenantId', 'Tenant', 'reference', {
        required: true,
        readonly: true,
        visibleInForm: false,
        importable: false,
      }),
      field('schoolId', 'School', 'reference', {
        filterable: entry.schoolScoped ?? false,
      }),
      field('branchId', 'Branch', 'reference', {
        filterable: entry.branchScoped ?? false,
      }),
      field('name', `${entry.title} Name`, 'text', {
        required: true,
        searchable: true,
        sortable: true,
        maxLength: 160,
      }),
      field('code', `${entry.title} Code`, 'text', {
        required: false,
        unique: false,
        searchable: true,
        sortable: true,
        maxLength: 50,
      }),
      field('status', 'Status', 'select', {
        required: true,
        defaultValue: entry.transaction ? 'pending' : 'active',
        filterable: true,
        options: (entry.transaction
          ? ['pending', 'processing', 'completed', 'failed', 'cancelled']
          : ['active', 'inactive', 'archived']
        ).map((value) => ({ label: value, value })),
      }),
      field('effectiveDate', 'Effective Date', 'date', {
        sortable: true,
        filterable: true,
      }),
      field('remarks', 'Remarks', 'textarea', {
        maxLength: 4000,
      }),
    ],
    tabs: [
      {
        title: 'Details',
        sections: [
          {
            title: entry.title,
            columns: 2,
            fields: ['name', 'code', 'status', 'effectiveDate', 'remarks'].map(
              (item) => ({ field: item }),
            ),
          },
        ],
      },
    ],
    columns: ['name', 'code', 'status', 'effectiveDate'],
    filters: ['status', 'effectiveDate'],
    searchFields: ['name', 'code'],
    displayField: 'name',
  }),
);
