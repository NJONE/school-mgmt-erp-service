import { baseEntity, field } from './helpers.js';

export const permissionMetadata = baseEntity({
  entity: 'permissions',
  title: 'Permission',
  pluralTitle: 'Permissions',
  description: 'Resource and action permission definition.',
  module: 'permissions',
  fields: [
    field('id', 'Permission ID', 'readonly', {
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
    field('key', 'Permission Key', 'text', {
      required: true,
      unique: true,
      searchable: true,
      sortable: true,
      maxLength: 120,
    }),
    field('name', 'Permission Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 160,
    }),
    field('description', 'Description', 'textarea', { maxLength: 500 }),
  ],
  tabs: [
    {
      title: 'Permission Details',
      sections: [
        {
          title: 'Permission',
          columns: 2,
          fields: ['key', 'name', 'description'].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: ['key', 'name'],
  searchFields: ['key', 'name', 'description'],
  displayField: 'name',
});
