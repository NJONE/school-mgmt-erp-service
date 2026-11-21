import { baseEntity, field } from './helpers.js';

export const tenantMetadata = baseEntity({
  entity: 'tenants',
  title: 'Tenant',
  pluralTitle: 'Tenants',
  description: 'SaaS organization tenant account and operating status.',
  module: 'tenants',
  scopes: { tenantScoped: false },
  fields: [
    field('id', 'Tenant ID', 'readonly', {
      required: true,
      readonly: true,
      visibleInForm: false,
      importable: false,
    }),
    field('name', 'Tenant Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 200,
    }),
    field('code', 'Tenant Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
      sortable: true,
      maxLength: 30,
    }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'active',
      options: ['active', 'suspended', 'inactive'].map((value) => ({
        label: value,
        value,
      })),
      filterable: true,
    }),
  ],
  tabs: [
    {
      title: 'Tenant Details',
      sections: [
        {
          title: 'Identity',
          columns: 2,
          fields: ['name', 'code', 'status'].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: ['code', 'name', 'status'],
  filters: ['status'],
  searchFields: ['name', 'code'],
  displayField: 'name',
});
