import { baseEntity, field } from './helpers.js';

export const subjectMetadata = baseEntity({
  entity: 'subjects',
  title: 'Subject',
  pluralTitle: 'Subjects',
  description:
    'Subject catalog entry with academic classification and assessment settings.',
  module: 'academics',
  scopes: { schoolScoped: true, branchScoped: true },
  fields: [
    field('id', 'Subject ID', 'readonly', {
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
    field('code', 'Subject Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
      sortable: true,
      maxLength: 30,
    }),
    field('name', 'Subject Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 120,
    }),
    field('shortName', 'Short Name', 'text', { maxLength: 30 }),
    field('subjectType', 'Subject Type', 'select', {
      required: true,
      options: ['core', 'elective', 'optional', 'co-curricular'].map(
        (value) => ({ label: value, value }),
      ),
      filterable: true,
    }),
    field('description', 'Description', 'textarea', { maxLength: 1000 }),
    field('maximumMarks', 'Maximum Marks', 'decimal', {
      min: 0,
      precision: 6,
      scale: 2,
    }),
    field('passingMarks', 'Passing Marks', 'decimal', {
      min: 0,
      precision: 6,
      scale: 2,
    }),
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
  tabs: [
    {
      title: 'Subject Details',
      sections: [
        {
          title: 'Subject',
          columns: 2,
          fields: [
            'schoolId',
            'branchId',
            'code',
            'name',
            'shortName',
            'subjectType',
            'description',
            'maximumMarks',
            'passingMarks',
            'status',
          ].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: [
    'code',
    'name',
    'shortName',
    'subjectType',
    'maximumMarks',
    'status',
  ],
  filters: ['branchId', 'subjectType', 'status'],
  searchFields: ['code', 'name', 'shortName'],
  displayField: 'name',
});
