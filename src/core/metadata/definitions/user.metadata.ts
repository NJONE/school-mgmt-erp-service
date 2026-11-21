import { baseEntity, field } from './helpers.js';

export const userMetadata = baseEntity({
  entity: 'users',
  title: 'User',
  pluralTitle: 'Users',
  description:
    'User account identity, tenant placement, roles, and permissions.',
  module: 'users',
  fields: [
    field('id', 'User ID', 'readonly', {
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
      lookup: { entity: 'schools', valueField: 'id', labelField: 'name' },
      filterable: true,
    }),
    field('branchId', 'Branch', 'reference', {
      lookup: { entity: 'branches', valueField: 'id', labelField: 'name' },
      filterable: true,
    }),
    field('email', 'Email', 'email', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 254,
    }),
    field('displayName', 'Display Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 160,
    }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'active',
      options: ['active', 'inactive', 'locked'].map((value) => ({
        label: value,
        value,
      })),
      filterable: true,
    }),
    field('isPlatformAdmin', 'Platform Administrator', 'boolean', {
      defaultValue: false,
      sensitive: true,
    }),
    field('roleKeys', 'Roles', 'multiselect', {
      arrayConfig: { itemType: 'text' },
    }),
    field('permissions', 'Permissions', 'multiselect', {
      arrayConfig: { itemType: 'text' },
      sensitive: true,
    }),
  ],
  tabs: [
    {
      title: 'Account',
      sections: [
        {
          title: 'Identity',
          columns: 2,
          fields: ['email', 'displayName', 'status', 'isPlatformAdmin'].map(
            (field) => ({ field }),
          ),
        },
      ],
    },
    {
      title: 'Access',
      sections: [
        {
          title: 'Scope and Access',
          columns: 2,
          fields: [
            'tenantId',
            'schoolId',
            'branchId',
            'roleKeys',
            'permissions',
          ].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: ['email', 'displayName', 'tenantId', 'schoolId', 'status'],
  filters: ['tenantId', 'schoolId', 'branchId', 'status'],
  searchFields: ['email', 'displayName'],
  displayField: 'displayName',
});
