import { baseEntity, field } from './helpers.js';

export const schoolMetadata = baseEntity({
  entity: 'schools',
  title: 'School',
  pluralTitle: 'Schools',
  description:
    'Tenant school profile, identity, contact, and operational status.',
  module: 'schools',
  scopes: { schoolScoped: false, branchScoped: false },
  fields: [
    field('id', 'School ID', 'readonly', {
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
    field('code', 'School Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
      sortable: true,
      maxLength: 30,
    }),
    field('name', 'School Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 160,
    }),
    field('legalName', 'Legal Name', 'text', { maxLength: 200 }),
    field('email', 'Email', 'email', { required: true, maxLength: 254 }),
    field('phone', 'Phone', 'phone', { required: true, maxLength: 30 }),
    field('website', 'Website', 'text', { maxLength: 255 }),
    field('address', 'Address', 'address', { required: true, maxLength: 500 }),
    field('city', 'City', 'text', { required: true, maxLength: 100 }),
    field('state', 'State', 'text', { maxLength: 100 }),
    field('country', 'Country', 'text', { required: true, maxLength: 100 }),
    field('postalCode', 'Postal Code', 'text', { maxLength: 20 }),
    field('timezone', 'Time Zone', 'text', {
      required: true,
      defaultValue: 'UTC',
      maxLength: 80,
    }),
    field('currency', 'Currency', 'text', { required: true, maxLength: 3 }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'active',
      options: ['active', 'inactive', 'suspended'].map((value) => ({
        label: value,
        value,
      })),
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
  tabs: [
    {
      title: 'School Profile',
      sections: [
        {
          title: 'Identity',
          columns: 2,
          fields: ['code', 'name', 'legalName', 'status'].map((field) => ({
            field,
          })),
        },
      ],
    },
    {
      title: 'Contact',
      sections: [
        {
          title: 'Contact Details',
          columns: 2,
          fields: ['email', 'phone', 'website'].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Address and Locale',
      sections: [
        {
          title: 'Location',
          columns: 2,
          fields: [
            'address',
            'city',
            'state',
            'country',
            'postalCode',
            'timezone',
            'currency',
          ].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: ['code', 'name', 'city', 'country', 'phone', 'status'],
  filters: ['status', 'city', 'country'],
  searchFields: ['code', 'name', 'legalName', 'email', 'city'],
  displayField: 'name',
});
