import { baseEntity, field } from './helpers.js';
import type { EntityMetadata } from '../interfaces/metadata.js';
import { branchMetadata } from './branch.metadata.js';
import { parentMetadata } from './parent.metadata.js';
import { schoolMetadata } from './school.metadata.js';
import { staffMetadata } from './staff.metadata.js';
import { studentMetadata } from './student.metadata.js';

function simpleEntity(
  entity: string,
  title: string,
  module: string,
  fields: EntityMetadata['fields'][number][],
): EntityMetadata {
  const name = fields.find((item) => item.key === 'name');
  const tableColumns = fields
    .filter((item) =>
      [
        'code',
        'name',
        'title',
        'status',
        'startDate',
        'endDate',
        'date',
      ].includes(item.key),
    )
    .map((item) => item.key);
  if (tableColumns.length === 0) {
    tableColumns.push(
      ...fields
        .filter((item) => item.key !== 'id')
        .slice(0, 3)
        .map((item) => item.key),
    );
  }
  return baseEntity({
    entity,
    title,
    pluralTitle: `${title}s`,
    description: `${title} records for tenant, school, and branch operations.`,
    module,
    scopes: { schoolScoped: true, branchScoped: true },
    fields,
    tabs: [
      {
        title: `${title} Details`,
        sections: [
          {
            title: 'Details',
            columns: 2,
            fields: fields
              .filter(
                (item) =>
                  !['id', 'tenantId', 'createdAt', 'updatedAt'].includes(
                    item.key,
                  ),
              )
              .map((item) => ({ field: item.key })),
          },
        ],
      },
    ],
    columns: tableColumns,
    filters: fields.filter((item) => item.filterable).map((item) => item.key),
    searchFields: fields
      .filter((item) => item.searchable)
      .map((item) => item.key),
    displayField: name?.key ?? fields[1]?.key ?? 'id',
  });
}

export const phase5Metadata: EntityMetadata[] = [
  studentMetadata,
  parentMetadata,
  staffMetadata,
  schoolMetadata,
  branchMetadata,
  simpleEntity('academicSessions', 'Academic Session', 'academics', [
    field('id', 'Session ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', {
      required: true,
      filterable: true,
    }),
    field('branchId', 'Branch', 'reference', { filterable: true }),
    field('name', 'Session Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Session Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('startDate', 'Start Date', 'date', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('endDate', 'End Date', 'date', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive', 'closed'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  simpleEntity('holidays', 'Holiday', 'schools', [
    field('id', 'Holiday ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', {
      required: true,
      filterable: true,
    }),
    field('name', 'Holiday Name', 'text', { required: true, searchable: true }),
    field('date', 'Holiday Date', 'date', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('holidayType', 'Holiday Type', 'select', {
      required: true,
      options: ['public', 'school', 'restricted'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  simpleEntity('schoolDepartments', 'School Department', 'schools', [
    field('id', 'Department ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', {
      required: true,
      filterable: true,
    }),
    field('name', 'Department Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Department Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive'].map((value) => ({ label: value, value })),
    }),
  ]),
  simpleEntity('schoolDesignations', 'School Designation', 'staff', [
    field('id', 'Designation ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', {
      required: true,
      filterable: true,
    }),
    field('name', 'Designation Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Designation Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive'].map((value) => ({ label: value, value })),
    }),
  ]),
];
