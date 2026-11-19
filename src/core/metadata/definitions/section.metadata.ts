import { baseEntity, field } from './helpers.js';

export const sectionMetadata = baseEntity({
  entity: 'sections',
  title: 'Section',
  pluralTitle: 'Sections',
  description:
    'Section or homeroom associated with a class, branch, and academic session.',
  module: 'academics',
  scopes: {
    schoolScoped: true,
    branchScoped: true,
    academicSessionScoped: true,
  },
  fields: [
    field('id', 'Section ID', 'readonly', {
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
    field('academicSessionId', 'Academic Session', 'reference', {
      required: true,
      filterable: true,
    }),
    field('classId', 'Class', 'reference', {
      required: true,
      lookup: { entity: 'classes', valueField: 'id', labelField: 'name' },
      filterable: true,
    }),
    field('name', 'Section Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
      maxLength: 80,
    }),
    field('code', 'Section Code', 'text', {
      required: true,
      searchable: true,
      unique: true,
      maxLength: 30,
    }),
    field('capacity', 'Student Capacity', 'integer', {
      min: 1,
      max: 500,
      defaultValue: 40,
    }),
    field('roomNumber', 'Room Number', 'text', { maxLength: 30 }),
    field('classTeacherId', 'Class Teacher', 'reference'),
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
      entity: 'classes',
      type: 'many-to-one',
      foreignKey: 'classId',
      displayField: 'name',
    },
  ],
  tabs: [
    {
      title: 'Section Details',
      sections: [
        {
          title: 'Placement',
          columns: 2,
          fields: [
            'schoolId',
            'branchId',
            'academicSessionId',
            'classId',
            'name',
            'code',
            'capacity',
            'roomNumber',
            'classTeacherId',
            'status',
          ].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: ['name', 'code', 'classId', 'branchId', 'capacity', 'status'],
  filters: ['academicSessionId', 'branchId', 'classId', 'status'],
  searchFields: ['name', 'code', 'roomNumber'],
  displayField: 'name',
});
