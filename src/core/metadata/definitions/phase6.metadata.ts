import { baseEntity, field } from './helpers.js';
import type { EntityMetadata } from '../interfaces/metadata.js';

function entity(
  entity: string,
  title: string,
  module: string,
  fields: EntityMetadata['fields'][number][],
): EntityMetadata {
  const tableColumns = fields
    .filter((item) =>
      [
        'code',
        'name',
        'title',
        'studentId',
        'staffId',
        'examId',
        'status',
        'date',
        'marksObtained',
        'grade',
        'classId',
        'sectionId',
        'subjectId',
        'periodId',
        'dayOfWeek',
      ].includes(item.key),
    )
    .map((item) => item.key);
  if (tableColumns.length === 0) {
    tableColumns.push(
      ...fields
        .slice(4, 7)
        .map((item) => item.key)
        .filter((key) => key !== 'id'),
    );
  }
  return baseEntity({
    entity,
    title,
    pluralTitle: `${title}s`,
    description: `${title} records scoped to tenant, school, branch, and academic session where applicable.`,
    module,
    scopes: {
      schoolScoped: true,
      branchScoped: true,
      academicSessionScoped: true,
    },
    fields,
    tabs: [
      {
        title: 'Details',
        sections: [
          {
            title: 'Record',
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
    columns:
      tableColumns.length > 0
        ? tableColumns
        : fields
            .filter((item) => item.key !== 'id')
            .slice(0, 3)
            .map((item) => item.key),
    filters: fields.filter((item) => item.filterable).map((item) => item.key),
    searchFields: fields
      .filter((item) => item.searchable)
      .map((item) => item.key),
    displayField:
      fields.find((item) => item.searchable)?.key ??
      fields.find((item) => item.key !== 'id')?.key ??
      'id',
  });
}

export const phase6Metadata: EntityMetadata[] = [
  entity('periods', 'Period', 'academics', [
    field('id', 'Period ID', 'readonly', {
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
    field('name', 'Period Name', 'text', { required: true, searchable: true }),
    field('startTime', 'Start Time', 'time', { required: true }),
    field('endTime', 'End Time', 'time', { required: true }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive'].map((value) => ({ label: value, value })),
    }),
  ]),
  entity('timetableEntries', 'Timetable Entry', 'academics', [
    field('id', 'Entry ID', 'readonly', {
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
    field('academicSessionId', 'Academic Session', 'reference', {
      required: true,
      filterable: true,
    }),
    field('classId', 'Class', 'reference', {
      required: true,
      filterable: true,
    }),
    field('sectionId', 'Section', 'reference', {
      required: true,
      filterable: true,
    }),
    field('subjectId', 'Subject', 'reference', {
      required: true,
      filterable: true,
    }),
    field('teacherId', 'Teacher', 'reference', {
      required: true,
      filterable: true,
    }),
    field('periodId', 'Period', 'reference', { required: true }),
    field('dayOfWeek', 'Day of Week', 'integer', {
      required: true,
      min: 1,
      max: 7,
      filterable: true,
    }),
  ]),
  entity('studentAttendance', 'Student Attendance', 'attendance', [
    field('id', 'Attendance ID', 'readonly', {
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
    field('academicSessionId', 'Academic Session', 'reference', {
      required: true,
      filterable: true,
    }),
    field('studentId', 'Student', 'reference', {
      required: true,
      filterable: true,
    }),
    field('classId', 'Class', 'reference', {
      required: true,
      filterable: true,
    }),
    field('sectionId', 'Section', 'reference', {
      required: true,
      filterable: true,
    }),
    field('date', 'Attendance Date', 'date', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('status', 'Status', 'select', {
      required: true,
      filterable: true,
      options: ['present', 'absent', 'late', 'excused'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('remarks', 'Remarks', 'textarea', { maxLength: 1000 }),
  ]),
  entity('staffAttendance', 'Staff Attendance', 'attendance', [
    field('id', 'Attendance ID', 'readonly', {
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
    field('staffId', 'Staff', 'reference', {
      required: true,
      filterable: true,
    }),
    field('date', 'Attendance Date', 'date', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('checkIn', 'Check In', 'datetime'),
    field('checkOut', 'Check Out', 'datetime'),
    field('status', 'Status', 'select', {
      required: true,
      filterable: true,
      options: ['present', 'absent', 'late', 'leave'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('examinations', 'Examination', 'examinations', [
    field('id', 'Exam ID', 'readonly', {
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
    field('academicSessionId', 'Academic Session', 'reference', {
      required: true,
      filterable: true,
    }),
    field('name', 'Examination Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Examination Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('startDate', 'Start Date', 'date', {
      required: true,
      filterable: true,
    }),
    field('endDate', 'End Date', 'date', { required: true, filterable: true }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'draft',
      filterable: true,
      options: ['draft', 'scheduled', 'ongoing', 'completed', 'published'].map(
        (value) => ({ label: value, value }),
      ),
    }),
  ]),
  entity('marks', 'Mark', 'examinations', [
    field('id', 'Mark ID', 'readonly', {
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
    field('academicSessionId', 'Academic Session', 'reference', {
      required: true,
      filterable: true,
    }),
    field('studentId', 'Student', 'reference', {
      required: true,
      filterable: true,
    }),
    field('examId', 'Examination', 'reference', {
      required: true,
      filterable: true,
    }),
    field('subjectId', 'Subject', 'reference', {
      required: true,
      filterable: true,
    }),
    field('marksObtained', 'Marks Obtained', 'decimal', {
      required: true,
      min: 0,
      precision: 6,
      scale: 2,
    }),
    field('maximumMarks', 'Maximum Marks', 'decimal', {
      required: true,
      min: 0,
      precision: 6,
      scale: 2,
    }),
  ]),
  entity('grades', 'Grade', 'examinations', [
    field('id', 'Grade ID', 'readonly', {
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
    field('name', 'Grade Name', 'text', { required: true, searchable: true }),
    field('minimumPercentage', 'Minimum Percentage', 'percentage', {
      required: true,
      min: 0,
      max: 100,
    }),
    field('maximumPercentage', 'Maximum Percentage', 'percentage', {
      required: true,
      min: 0,
      max: 100,
    }),
  ]),
  entity('results', 'Result', 'examinations', [
    field('id', 'Result ID', 'readonly', {
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
    field('academicSessionId', 'Academic Session', 'reference', {
      required: true,
      filterable: true,
    }),
    field('studentId', 'Student', 'reference', {
      required: true,
      filterable: true,
    }),
    field('examId', 'Examination', 'reference', {
      required: true,
      filterable: true,
    }),
    field('percentage', 'Percentage', 'percentage', {
      required: true,
      min: 0,
      max: 100,
    }),
    field('grade', 'Grade', 'text', { required: true, filterable: true }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'draft',
      filterable: true,
      options: ['draft', 'published', 'withheld'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
];
