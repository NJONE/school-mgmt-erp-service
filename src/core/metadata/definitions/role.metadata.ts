import { baseEntity, field } from './helpers.js';

export const roleMetadata = baseEntity({
  entity: 'roles',
  title: 'Role',
  pluralTitle: 'Roles',
  description: 'Named tenant or system role containing resource permissions.',
  module: 'roles',
  fields: [
    field('id', 'Role ID', 'readonly', {
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
    field('key', 'Role Key', 'text', {
      required: true,
      unique: true,
      searchable: true,
      sortable: true,
      maxLength: 80,
    }),
    field('name', 'Role Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 120,
    }),
    field('permissions', 'Permissions', 'multiselect', {
      required: true,
      arrayConfig: { itemType: 'text', minItems: 1 },
    }),
    field('system', 'System Role', 'boolean', {
      defaultValue: false,
      readonly: true,
    }),
  ],
  tabs: [
    {
      title: 'Role Details',
      sections: [
        {
          title: 'Role',
          columns: 2,
          fields: ['key', 'name', 'permissions', 'system'].map((field) => ({
            field,
          })),
        },
      ],
    },
  ],
  columns: ['key', 'name', 'system'],
  filters: ['system'],
  searchFields: ['key', 'name'],
  displayField: 'name',
});
