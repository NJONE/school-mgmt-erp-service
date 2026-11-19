import { baseEntity, field } from './helpers.js';

export const parentMetadata = baseEntity({
  entity: 'parents',
  title: 'Parent',
  pluralTitle: 'Parents and Guardians',
  description:
    'Parent and guardian identity, contact, address, and portal access details.',
  module: 'parents',
  fields: [
    field('id', 'Parent ID', 'readonly', {
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
    field('firstName', 'First Name', 'text', {
      required: true,
      searchable: true,
      maxLength: 80,
    }),
    field('lastName', 'Last Name', 'text', {
      required: true,
      searchable: true,
      maxLength: 80,
    }),
    field('fullName', 'Full Name', 'computed', {
      required: true,
      searchable: true,
      readonly: true,
    }),
    field('relationship', 'Relationship to Student', 'select', {
      required: true,
      options: ['mother', 'father', 'guardian', 'other'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('email', 'Email', 'email', {
      required: true,
      searchable: true,
      maxLength: 254,
    }),
    field('mobileNumber', 'Mobile Number', 'phone', {
      required: true,
      searchable: true,
      maxLength: 30,
    }),
    field('alternateMobileNumber', 'Alternate Mobile Number', 'phone', {
      maxLength: 30,
    }),
    field('occupation', 'Occupation', 'text', { maxLength: 120 }),
    field('employer', 'Employer', 'text', { maxLength: 160 }),
    field('address', 'Address', 'address', { maxLength: 500 }),
    field('city', 'City', 'text', { maxLength: 100 }),
    field('state', 'State', 'text', { maxLength: 100 }),
    field('country', 'Country', 'text', { maxLength: 100 }),
    field('postalCode', 'Postal Code', 'text', { maxLength: 20 }),
    field('photo', 'Photo', 'image', { exportable: false }),
    field('isPrimaryContact', 'Primary Contact', 'boolean', {
      defaultValue: false,
    }),
    field('portalAccessEnabled', 'Portal Access Enabled', 'boolean', {
      defaultValue: true,
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
    { entity: 'students', type: 'many-to-many', displayField: 'fullName' },
  ],
  tabs: [
    {
      title: 'Contact Information',
      sections: [
        {
          title: 'Identity',
          columns: 2,
          fields: [
            'firstName',
            'lastName',
            'fullName',
            'relationship',
            'photo',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Contact Details',
      sections: [
        {
          title: 'Contact',
          columns: 2,
          fields: [
            'email',
            'mobileNumber',
            'alternateMobileNumber',
            'occupation',
            'employer',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Address',
      sections: [
        {
          title: 'Address',
          columns: 2,
          fields: ['address', 'city', 'state', 'country', 'postalCode'].map(
            (field) => ({ field }),
          ),
        },
      ],
    },
    {
      title: 'Portal Access',
      sections: [
        {
          title: 'Preferences',
          fields: ['isPrimaryContact', 'portalAccessEnabled'].map((field) => ({
            field,
          })),
        },
      ],
    },
  ],
  columns: [
    'fullName',
    'relationship',
    'email',
    'mobileNumber',
    'isPrimaryContact',
  ],
  filters: ['relationship', 'isPrimaryContact', 'portalAccessEnabled'],
  searchFields: ['firstName', 'lastName', 'fullName', 'email', 'mobileNumber'],
  displayField: 'fullName',
});
