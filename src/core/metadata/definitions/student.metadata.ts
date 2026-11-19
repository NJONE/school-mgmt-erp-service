import { baseEntity, field } from './helpers.js';

const genderOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
];

export const studentMetadata = baseEntity({
  entity: 'students',
  title: 'Student',
  pluralTitle: 'Students',
  description:
    'Student identity, admission, contact, guardian, academic, medical, and service information.',
  module: 'students',
  entityType: 'master',
  scopes: {
    schoolScoped: true,
    branchScoped: true,
    academicSessionScoped: true,
  },
  fields: [
    field('id', 'Student ID', 'readonly', {
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
    field('admissionNumber', 'Admission Number', 'text', {
      required: true,
      unique: true,
      searchable: true,
      sortable: true,
      filterable: true,
      maxLength: 40,
    }),
    field('registrationNumber', 'Registration Number', 'text', {
      searchable: true,
      filterable: true,
      maxLength: 40,
    }),
    field('rollNumber', 'Roll Number', 'text', {
      searchable: true,
      filterable: true,
      maxLength: 20,
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
      sortable: true,
      readonly: true,
    }),
    field('dateOfBirth', 'Date of Birth', 'date', {
      required: true,
      filterable: true,
    }),
    field('gender', 'Gender', 'select', {
      required: true,
      options: genderOptions,
      filterable: true,
    }),
    field('bloodGroup', 'Blood Group', 'select', {
      options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
        (value) => ({ label: value, value }),
      ),
    }),
    field('nationality', 'Nationality', 'text', { maxLength: 80 }),
    field('religion', 'Religion', 'text', { maxLength: 80 }),
    field('category', 'Category', 'text', { maxLength: 80, filterable: true }),
    field('motherTongue', 'Mother Tongue', 'text', { maxLength: 80 }),
    field('photo', 'Photo', 'image', { exportable: false }),
    field('admissionDate', 'Admission Date', 'date', {
      required: true,
      filterable: true,
    }),
    field('admissionType', 'Admission Type', 'select', {
      options: ['new', 'transfer', 're-admission'].map((value) => ({
        label: value,
        value,
      })),
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
    field('sectionId', 'Section', 'reference', {
      lookup: { entity: 'sections', valueField: 'id', labelField: 'name' },
      filterable: true,
    }),
    field('streamId', 'Stream', 'reference'),
    field('houseId', 'House', 'reference'),
    field('studentStatus', 'Student Status', 'select', {
      required: true,
      defaultValue: 'active',
      options: [
        'active',
        'inactive',
        'transferred',
        'withdrawn',
        'graduated',
      ].map((value) => ({ label: value, value })),
      filterable: true,
    }),
    field('previousSchool', 'Previous School', 'text', { maxLength: 160 }),
    field('previousClass', 'Previous Class', 'text', { maxLength: 80 }),
    field('transferCertificateNumber', 'Transfer Certificate Number', 'text', {
      maxLength: 60,
    }),
    field('email', 'Email', 'email', { maxLength: 254 }),
    field('mobileNumber', 'Mobile Number', 'phone', {
      required: true,
      maxLength: 30,
      searchable: true,
    }),
    field('alternateMobileNumber', 'Alternate Mobile Number', 'phone', {
      maxLength: 30,
    }),
    field('currentAddress', 'Current Address', 'address', { maxLength: 500 }),
    field('permanentAddress', 'Permanent Address', 'address', {
      maxLength: 500,
    }),
    field('city', 'City', 'text', { maxLength: 100, filterable: true }),
    field('district', 'District', 'text', { maxLength: 100 }),
    field('state', 'State', 'text', { maxLength: 100 }),
    field('country', 'Country', 'text', { maxLength: 100 }),
    field('postalCode', 'Postal Code', 'text', { maxLength: 20 }),
    field('parentIds', 'Parents', 'array', {
      arrayConfig: { itemType: 'reference', maxItems: 10 },
      lookup: { entity: 'parents', valueField: 'id', labelField: 'fullName' },
    }),
    field('primaryGuardianId', 'Primary Guardian', 'reference', {
      lookup: { entity: 'parents', valueField: 'id', labelField: 'fullName' },
    }),
    field('emergencyContactId', 'Emergency Contact', 'reference', {
      lookup: { entity: 'parents', valueField: 'id', labelField: 'fullName' },
    }),
    field('medicalConditions', 'Medical Conditions', 'textarea', {
      maxLength: 2000,
      sensitive: true,
    }),
    field('allergies', 'Allergies', 'textarea', {
      maxLength: 2000,
      sensitive: true,
    }),
    field('medications', 'Medications', 'textarea', {
      maxLength: 2000,
      sensitive: true,
    }),
    field('emergencyMedicalNotes', 'Emergency Medical Notes', 'textarea', {
      maxLength: 2000,
      sensitive: true,
    }),
    field('specialNeeds', 'Special Needs', 'textarea', {
      maxLength: 2000,
      sensitive: true,
    }),
    field('transportRouteId', 'Transport Route', 'reference'),
    field('transportStopId', 'Transport Stop', 'reference'),
    field('hostelId', 'Hostel', 'reference'),
    field('boardingStatus', 'Boarding Status', 'select', {
      options: ['day', 'boarding'].map((value) => ({ label: value, value })),
    }),
    field('scholarshipId', 'Scholarship', 'reference'),
    field('discountId', 'Discount', 'reference'),
    field('remarks', 'Remarks', 'textarea', { maxLength: 4000 }),
    field('documents', 'Documents', 'array', {
      arrayConfig: { itemType: 'file', maxItems: 50 },
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
    { entity: 'parents', type: 'many-to-many', displayField: 'fullName' },
    {
      entity: 'classes',
      type: 'many-to-one',
      foreignKey: 'classId',
      displayField: 'name',
    },
    {
      entity: 'sections',
      type: 'many-to-one',
      foreignKey: 'sectionId',
      displayField: 'name',
    },
  ],
  tabs: [
    {
      title: 'Personal Information',
      sections: [
        {
          title: 'Identity',
          columns: 3,
          fields: [
            'photo',
            'firstName',
            'middleName',
            'lastName',
            'fullName',
            'dateOfBirth',
            'gender',
            'bloodGroup',
            'nationality',
            'religion',
            'category',
            'motherTongue',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Admission Details',
      sections: [
        {
          title: 'Admission',
          columns: 3,
          fields: [
            'admissionNumber',
            'registrationNumber',
            'rollNumber',
            'admissionDate',
            'admissionType',
            'academicSessionId',
            'studentStatus',
            'previousSchool',
            'previousClass',
            'transferCertificateNumber',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Parent Information',
      sections: [
        {
          title: 'Guardians',
          columns: 2,
          fields: ['parentIds', 'primaryGuardianId', 'emergencyContactId'].map(
            (field) => ({ field }),
          ),
        },
      ],
    },
    {
      title: 'Address',
      sections: [
        {
          title: 'Contact and Address',
          columns: 2,
          fields: [
            'email',
            'mobileNumber',
            'alternateMobileNumber',
            'currentAddress',
            'permanentAddress',
            'city',
            'district',
            'state',
            'country',
            'postalCode',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Medical Information',
      sections: [
        {
          title: 'Health',
          columns: 2,
          fields: [
            'medicalConditions',
            'allergies',
            'medications',
            'emergencyMedicalNotes',
            'specialNeeds',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Academic Information',
      sections: [
        {
          title: 'Placement',
          columns: 3,
          fields: ['classId', 'sectionId', 'streamId', 'houseId'].map(
            (field) => ({ field }),
          ),
        },
      ],
    },
    {
      title: 'Transport',
      sections: [
        {
          title: 'Services',
          columns: 2,
          fields: [
            'transportRouteId',
            'transportStopId',
            'hostelId',
            'boardingStatus',
            'scholarshipId',
            'discountId',
          ].map((field) => ({ field })),
        },
      ],
    },
    {
      title: 'Documents',
      sections: [
        {
          title: 'Records',
          fields: ['documents', 'remarks'].map((field) => ({ field })),
        },
      ],
    },
  ],
  columns: [
    'admissionNumber',
    'photo',
    'fullName',
    'classId',
    'sectionId',
    'gender',
    'dateOfBirth',
    'mobileNumber',
    'studentStatus',
  ],
  filters: [
    'academicSessionId',
    'classId',
    'sectionId',
    'gender',
    'studentStatus',
    'admissionDate',
    'search',
  ],
  searchFields: [
    'admissionNumber',
    'registrationNumber',
    'firstName',
    'middleName',
    'lastName',
    'fullName',
    'mobileNumber',
  ],
  displayField: 'fullName',
});
