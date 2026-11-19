import { baseEntity, field } from './helpers.js';

export const branchMetadata = baseEntity({
  entity: 'branches',
  title: 'Branch',
  pluralTitle: 'Branches',
  description:
    'School branch identity, location, contact, and operating status.',
  module: 'branches',
  scopes: { schoolScoped: true, branchScoped: false },
  fields: [
    field('id', 'Branch ID', 'readonly', {
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
      required: true,
      lookup: { entity: 'schools', valueField: 'id', labelField: 'name' },
      filterable: true,
    }),
    field('code', 'Branch Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
      sortable: true,
      maxLength: 30,
    }),
    field('name', 'Branch Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 160,
    }),
    field('email', 'Email', 'email', { maxLength: 254 }),
    field('phone', 'Phone', 'phone', { required: true, maxLength: 30 }),
    field('address', 'Address', 'address', { required: true, maxLength: 500 }),
    field('city', 'City', 'text', { required: true, maxLength: 100 }),
    field('state', 'State', 'text', { maxLength: 100 }),
    field('country', 'Country', 'text', { required: true, maxLength: 100 }),
    field('isMainBranch', 'Main Branch', 'boolean', { defaultValue: false }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'active',
      options: ['active', 'inactive'].map((value) => ({ label: value, value })),
      filterable: true,
    }),
    field('createdAt', 'Created At', 'datetime', {
      readonly: true,
      visibleInForm: false,
      importable: false,
    }),
    field('updatedAt', 'Updated At', 'datetime', {
      readonly: true,
      visibleInForm: false,
      importable: false,
    }),
  ],
  relationships: [
    {
      entity: 'schools',
      type: 'many-to-one',
      foreignKey: 'schoolId',
      displayField: 'name',
    },
  ],
  tabs: [
    {
      title: 'Branch Details',
      sections: [
        {
          title: 'Identity',
          columns: 2,
          fields: ['schoolId', 'code', 'name', 'isMainBranch', 'status'].map(
            (field) => ({ field }),
          ),
        },
      ],
    },
    {
      title: 'Contact and Location',
      sections: [
        {
          title: 'Contact',
          columns: 2,
          fields: ['email', 'phone', 'address', 'city', 'state', 'country'].map(
            (field) => ({ field }),
          ),
        },
      ],
    },
  ],
  columns: ['code', 'name', 'city', 'phone', 'isMainBranch', 'status'],
  filters: ['schoolId', 'city', 'status', 'isMainBranch'],
  searchFields: ['code', 'name', 'email', 'city'],
  displayField: 'name',
});
