import { baseEntity, field } from './helpers.js';

export const classMetadata = baseEntity({
  entity: 'classes',
  title: 'Class',
  pluralTitle: 'Classes',
  description: 'Academic class or grade offered by a school branch.',
  module: 'academics',
  scopes: {
    schoolScoped: true,
    branchScoped: true,
    academicSessionScoped: true,
  },
  fields: [
    field('id', 'Class ID', 'readonly', {
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
    field('branchId', 'Branch', 'reference', {
      lookup: { entity: 'branches', valueField: 'id', labelField: 'name' },
      filterable: true,
    }),
    field('name', 'Class Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 80,
    }),
    field('code', 'Class Code', 'text', {
      required: true,
      searchable: true,
      unique: true,
      maxLength: 30,
    }),
    field('displayOrder', 'Display Order', 'integer', {
      required: true,
      min: 0,
      sortable: true,
    }),
    field('description', 'Description', 'textarea', { maxLength: 1000 }),
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
      entity: 'sections',
      type: 'one-to-many',
      foreignKey: 'classId',
      displayField: 'name',
    },
  ],
  tabs: [
    {
      title: 'Class Details',
      sections: [
        {
          title: 'Class',
          columns: 2,
          fields: [
            'schoolId',
            'branchId',
            'name',
            'code',
            'displayOrder',
            'description',
            'status',
          ].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: ['displayOrder', 'name', 'code', 'branchId', 'status'],
  filters: ['branchId', 'status'],
  searchFields: ['name', 'code'],
  displayField: 'name',
});
