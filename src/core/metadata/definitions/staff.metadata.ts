import { baseEntity, field } from './helpers.js';

export const staffMetadata = baseEntity({
  entity: 'staff',
  title: 'Staff Member',
  pluralTitle: 'Staff',
  description:
    'Staff identity, employment, contact, organizational placement, and account status.',
  module: 'staff',
  scopes: { schoolScoped: true, branchScoped: true },
  fields: [
    field('id', 'Staff ID', 'readonly', {
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
    field('employeeNumber', 'Employee Number', 'text', {
      required: true,
      unique: true,
      searchable: true,
      sortable: true,
      filterable: true,
      maxLength: 40,
    }),
    field('firstName', 'First Name', 'text', {
      required: true,
      searchable: true,
      maxLength: 80,
    }),
    field('middleName', 'Middle Name', 'text', { maxLength: 80 }),
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
    field('dateOfBirth', 'Date of Birth', 'date'),
    field('gender', 'Gender', 'select', {
      options: ['female', 'male', 'other'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('dateOfJoining', 'Date of Joining', 'date', {
      required: true,
      filterable: true,
    }),
    field('employmentType', 'Employment Type', 'select', {
      required: true,
      options: ['full-time', 'part-time', 'contract', 'temporary'].map(
        (value) => ({ label: value, value }),
      ),
      filterable: true,
    }),
    field('designation', 'Designation', 'text', {
      required: true,
      filterable: true,
      maxLength: 120,
    }),
    field('department', 'Department', 'text', {
      filterable: true,
      maxLength: 120,
    }),
    field('reportsToStaffId', 'Reports To', 'reference', {
      lookup: { entity: 'staff', valueField: 'id', labelField: 'fullName' },
    }),
    field('address', 'Address', 'address', { maxLength: 500 }),
    field('status', 'Employment Status', 'select', {
      required: true,
      defaultValue: 'active',
      options: ['active', 'on-leave', 'suspended', 'terminated'].map(
        (value) => ({ label: value, value }),
      ),
      filterable: true,
    }),
    field('photo', 'Photo', 'image', { exportable: false }),
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
      title: 'Personal Information',
      sections: [
        {
          title: 'Identity',
          columns: 2,
          fields: [
            'employeeNumber',
            'firstName',
            'middleName',
            'lastName',
            'fullName',
            'dateOfBirth',
            'gender',
            'photo',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Employment',
      sections: [
        {
          title: 'Assignment',
          columns: 2,
          fields: [
            'schoolId',
            'branchId',
            'dateOfJoining',
            'employmentType',
            'designation',
            'department',
            'reportsToStaffId',
            'status',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Contact',
      sections: [
        {
          title: 'Contact Details',
          columns: 2,
          fields: [
            'email',
            'mobileNumber',
            'alternateMobileNumber',
            'address',
          ].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: [
    'employeeNumber',
    'fullName',
    'designation',
    'department',
    'mobileNumber',
    'status',
  ],
  filters: [
    'branchId',
    'department',
    'designation',
    'employmentType',
    'status',
    'dateOfJoining',
  ],
  searchFields: [
    'employeeNumber',
    'firstName',
    'lastName',
    'fullName',
    'email',
    'mobileNumber',
  ],
  displayField: 'fullName',
});
