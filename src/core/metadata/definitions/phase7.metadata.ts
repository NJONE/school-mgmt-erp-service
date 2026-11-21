import { baseEntity, field } from './helpers.js';
import type { EntityMetadata } from '../interfaces/metadata.js';

function idField(label: string) {
  return field('id', label, 'readonly', { readonly: true, visibleInForm: false });
}

function tenantField() {
  return field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false });
}

function schoolField() {
  return field('schoolId', 'School', 'reference', { required: true, filterable: true });
}

function branchField() {
  return field('branchId', 'Branch', 'reference', { filterable: true });
}

function sessionField() {
  return field('academicSessionId', 'Academic Session', 'reference', { required: true, filterable: true });
}

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
        'status',
        'date',
        'amount',
        'studentId',
        'staffId',
        'referenceNumber',
        'paymentStatus',
        'isbn',
        'registrationNumber',
        'sku',
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
    description: `${title} configuration or transaction record.`,
    module,
    entityType: [
      'feeCategories',
      'feeStructures',
      'salaryStructures',
      'bookCategories',
      'vehicleTypes',
      'inventoryCategories',
    ].includes(entity)
      ? 'master'
      : 'transaction',
    scopes: {
      schoolScoped: true,
      branchScoped: true,
      academicSessionScoped: [
        'studentFees',
        'feePayments',
        'feeReceipts',
        'payrollRuns',
      ].includes(entity),
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
    columns: tableColumns,
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

export const phase7Metadata: EntityMetadata[] = [
  entity('feeCategories', 'Fee Category', 'fees', [
    field('id', 'Category ID', 'readonly', {
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
    field('name', 'Category Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Category Code', 'text', { required: true, unique: true }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive'].map((value) => ({ label: value, value })),
    }),
  ]),
  entity('feeStructures', 'Fee Structure', 'fees', [
    field('id', 'Structure ID', 'readonly', {
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
    field('name', 'Structure Name', 'text', {
      required: true,
      searchable: true,
    }),
    field('classId', 'Class', 'reference', {
      required: true,
      filterable: true,
    }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive', 'archived'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('studentFees', 'Student Fee', 'fees', [
    field('id', 'Fee ID', 'readonly', { readonly: true, visibleInForm: false }),
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
    field('amount', 'Amount Due', 'currency', {
      required: true,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('paidAmount', 'Paid Amount', 'currency', {
      required: true,
      defaultValue: 0,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('balanceAmount', 'Balance Amount', 'currency', {
      required: true,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('dueDate', 'Due Date', 'date', { required: true, filterable: true }),
  ]),
  entity('feePayments', 'Fee Payment', 'fees', [
    field('id', 'Payment ID', 'readonly', {
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
    field('amount', 'Amount', 'currency', {
      required: true,
      min: 0.01,
      precision: 12,
      scale: 2,
    }),
    field('paymentDate', 'Payment Date', 'datetime', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('paymentMethod', 'Payment Method', 'select', {
      required: true,
      options: ['cash', 'bank', 'card', 'upi', 'cheque'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('referenceNumber', 'Reference Number', 'text', {
      searchable: true,
      unique: true,
    }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'completed',
      filterable: true,
      options: ['pending', 'completed', 'failed', 'refunded'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('feeReceipts', 'Fee Receipt', 'fees', [
    field('id', 'Receipt ID', 'readonly', {
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
    field('studentId', 'Student', 'reference', {
      required: true,
      filterable: true,
    }),
    field('paymentId', 'Payment', 'reference', { required: true }),
    field('receiptNumber', 'Receipt Number', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('amount', 'Amount', 'currency', {
      required: true,
      min: 0.01,
      precision: 12,
      scale: 2,
    }),
  ]),
  entity('financialYears', 'Financial Year', 'finance', [
    field('id', 'Year ID', 'readonly', {
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
    field('name', 'Financial Year', 'text', {
      required: true,
      searchable: true,
    }),
    field('startDate', 'Start Date', 'date', {
      required: true,
      filterable: true,
    }),
    field('endDate', 'End Date', 'date', { required: true, filterable: true }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'closed'].map((value) => ({ label: value, value })),
    }),
  ]),
  entity('accounts', 'Account', 'finance', [
    field('id', 'Account ID', 'readonly', {
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
    field('code', 'Account Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('name', 'Account Name', 'text', { required: true, searchable: true }),
    field('accountType', 'Account Type', 'select', {
      required: true,
      options: ['asset', 'liability', 'income', 'expense', 'equity'].map(
        (value) => ({ label: value, value }),
      ),
    }),
  ]),
  entity('expenses', 'Expense', 'finance', [
    field('id', 'Expense ID', 'readonly', {
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
    field('title', 'Expense Title', 'text', {
      required: true,
      searchable: true,
    }),
    field('amount', 'Amount', 'currency', {
      required: true,
      min: 0.01,
      precision: 12,
      scale: 2,
    }),
    field('date', 'Expense Date', 'date', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'pending',
      filterable: true,
      options: ['pending', 'approved', 'paid', 'rejected'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('salaryStructures', 'Salary Structure', 'payroll', [
    field('id', 'Structure ID', 'readonly', {
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
    field('name', 'Structure Name', 'text', {
      required: true,
      searchable: true,
    }),
    field('basicSalary', 'Basic Salary', 'currency', {
      required: true,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive'].map((value) => ({ label: value, value })),
    }),
  ]),
  entity('payrollRuns', 'Payroll Run', 'payroll', [
    field('id', 'Payroll Run ID', 'readonly', {
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
    field('period', 'Pay Period', 'text', { required: true, searchable: true }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'draft',
      filterable: true,
      options: ['draft', 'processing', 'completed', 'failed'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('payrollEntries', 'Payroll Entry', 'payroll', [
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
    field('staffId', 'Staff', 'reference', {
      required: true,
      filterable: true,
    }),
    field('payrollRunId', 'Payroll Run', 'reference', {
      required: true,
      filterable: true,
    }),
    field('grossAmount', 'Gross Amount', 'currency', {
      required: true,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('deductions', 'Deductions', 'currency', {
      required: true,
      defaultValue: 0,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('netAmount', 'Net Amount', 'currency', {
      required: true,
      min: 0,
      precision: 12,
      scale: 2,
    }),
  ]),
  entity('bookCategories', 'Book Category', 'library', [
    field('id', 'Category ID', 'readonly', {
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
    field('name', 'Category Name', 'text', {
      required: true,
      searchable: true,
    }),
    field('code', 'Category Code', 'text', { required: true, unique: true }),
  ]),
  entity('books', 'Book', 'library', [
    field('id', 'Book ID', 'readonly', {
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
    field('title', 'Title', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('isbn', 'ISBN', 'text', { searchable: true, unique: true }),
    field('author', 'Author', 'text', { required: true, searchable: true }),
    field('status', 'Status', 'select', {
      defaultValue: 'available',
      filterable: true,
      options: ['available', 'unavailable', 'archived'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('bookCopies', 'Book Copy', 'library', [
    field('id', 'Copy ID', 'readonly', {
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
    field('bookId', 'Book', 'reference', { required: true, filterable: true }),
    field('barcode', 'Barcode', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'available',
      filterable: true,
      options: ['available', 'issued', 'lost', 'damaged', 'maintenance'].map(
        (value) => ({ label: value, value }),
      ),
    }),
  ]),
  entity('bookIssues', 'Book Issue', 'library', [
    field('id', 'Issue ID', 'readonly', {
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
    field('bookCopyId', 'Book Copy', 'reference', {
      required: true,
      filterable: true,
    }),
    field('memberId', 'Library Member', 'reference', {
      required: true,
      filterable: true,
    }),
    field('issueDate', 'Issue Date', 'date', {
      required: true,
      filterable: true,
    }),
    field('dueDate', 'Due Date', 'date', { required: true, filterable: true }),
    field('returnDate', 'Return Date', 'date'),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'issued',
      filterable: true,
      options: ['issued', 'returned', 'overdue', 'lost'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('vehicles', 'Vehicle', 'transport', [
    field('id', 'Vehicle ID', 'readonly', {
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
    field('name', 'Vehicle Name', 'text', { required: true, searchable: true }),
    field('registrationNumber', 'Registration Number', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('capacity', 'Passenger Capacity', 'integer', {
      required: true,
      min: 1,
      max: 100,
    }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive', 'maintenance'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('transportRoutes', 'Transport Route', 'transport', [
    field('id', 'Route ID', 'readonly', {
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
    field('name', 'Route Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Route Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('vehicleId', 'Vehicle', 'reference', { filterable: true }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'inactive'].map((value) => ({ label: value, value })),
    }),
  ]),
  entity('inventoryCategories', 'Inventory Category', 'inventory', [
    field('id', 'Category ID', 'readonly', {
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
    field('name', 'Category Name', 'text', {
      required: true,
      searchable: true,
    }),
    field('code', 'Category Code', 'text', { required: true, unique: true }),
  ]),
  entity('inventoryItems', 'Inventory Item', 'inventory', [
    field('id', 'Item ID', 'readonly', {
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
    field('name', 'Item Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('sku', 'SKU', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('unit', 'Unit', 'text', { required: true, defaultValue: 'piece' }),
    field('reorderLevel', 'Reorder Level', 'decimal', {
      required: true,
      defaultValue: 0,
      min: 0,
    }),
  ]),
  entity('stockMovements', 'Stock Movement', 'inventory', [
    field('id', 'Movement ID', 'readonly', {
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
    field('itemId', 'Inventory Item', 'reference', {
      required: true,
      filterable: true,
    }),
    field('movementType', 'Movement Type', 'select', {
      required: true,
      filterable: true,
      options: ['in', 'out', 'adjustment'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('quantity', 'Quantity', 'decimal', {
      required: true,
      min: 0,
      precision: 12,
      scale: 3,
    }),
    field('date', 'Movement Date', 'datetime', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('referenceNumber', 'Reference Number', 'text', { searchable: true }),
  ]),
  entity('feeStructureItems', 'Fee Structure Item', 'fees', [idField('Item ID'), tenantField(), schoolField(), branchField(), sessionField(), field('structureId', 'Fee Structure', 'reference', { required: true, filterable: true }), field('categoryId', 'Fee Category', 'reference', { required: true, filterable: true }), field('amount', 'Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 })]),
  entity('feeInstallments', 'Fee Installment', 'fees', [idField('Installment ID'), tenantField(), schoolField(), branchField(), sessionField(), field('studentFeeId', 'Student Fee', 'reference', { required: true, filterable: true }), field('name', 'Installment Name', 'text', { required: true, searchable: true }), field('amount', 'Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('dueDate', 'Due Date', 'date', { required: true, sortable: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'pending', filterable: true, options: ['pending', 'paid', 'overdue', 'cancelled'].map((value) => ({ label: value, value })) })]),
  entity('feeDiscounts', 'Fee Discount', 'fees', [idField('Discount ID'), tenantField(), schoolField(), branchField(), sessionField(), field('name', 'Discount Name', 'text', { required: true, searchable: true }), field('percentage', 'Percentage', 'percentage', { required: true, min: 0, max: 100 }), field('amount', 'Fixed Amount', 'currency', { min: 0, precision: 12, scale: 2 })]),
  entity('scholarships', 'Scholarship', 'fees', [idField('Scholarship ID'), tenantField(), schoolField(), branchField(), sessionField(), field('name', 'Scholarship Name', 'text', { required: true, searchable: true }), field('studentId', 'Student', 'reference', { required: true, filterable: true }), field('amount', 'Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('status', 'Status', 'select', { defaultValue: 'active', filterable: true, options: ['active', 'inactive', 'expired'].map((value) => ({ label: value, value })) })]),
  entity('lateFeeRules', 'Late Fee Rule', 'fees', [idField('Rule ID'), tenantField(), schoolField(), branchField(), sessionField(), field('name', 'Rule Name', 'text', { required: true, searchable: true }), field('daysAfterDue', 'Days After Due', 'integer', { required: true, min: 0 }), field('amount', 'Late Fee Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 })]),
  entity('feeRefunds', 'Fee Refund', 'fees', [idField('Refund ID'), tenantField(), schoolField(), branchField(), sessionField(), field('paymentId', 'Payment', 'reference', { required: true, filterable: true }), field('studentId', 'Student', 'reference', { required: true, filterable: true }), field('amount', 'Refund Amount', 'currency', { required: true, min: 0.01, precision: 12, scale: 2 }), field('reason', 'Reason', 'textarea', { required: true, maxLength: 2000 }), field('status', 'Status', 'select', { defaultValue: 'pending', filterable: true, options: ['pending', 'approved', 'completed', 'rejected'].map((value) => ({ label: value, value })) })]),
  entity('feeConcessions', 'Fee Concession', 'fees', [idField('Concession ID'), tenantField(), schoolField(), branchField(), sessionField(), field('studentId', 'Student', 'reference', { required: true, filterable: true }), field('categoryId', 'Fee Category', 'reference', { required: true, filterable: true }), field('percentage', 'Concession Percentage', 'percentage', { required: true, min: 0, max: 100 }), field('reason', 'Reason', 'textarea', { maxLength: 2000 })]),
  entity('journalEntries', 'Journal Entry', 'finance', [idField('Entry ID'), tenantField(), schoolField(), branchField(), field('financialYearId', 'Financial Year', 'reference', { required: true, filterable: true }), field('entryNumber', 'Entry Number', 'text', { required: true, unique: true, searchable: true }), field('entryDate', 'Entry Date', 'date', { required: true, sortable: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'draft', filterable: true, options: ['draft', 'posted', 'void'].map((value) => ({ label: value, value })) })]),
  entity('journalEntryLines', 'Journal Entry Line', 'finance', [idField('Line ID'), tenantField(), schoolField(), branchField(), field('journalEntryId', 'Journal Entry', 'reference', { required: true, filterable: true }), field('accountId', 'Account', 'reference', { required: true, filterable: true }), field('debit', 'Debit', 'currency', { defaultValue: 0, min: 0, precision: 12, scale: 2 }), field('credit', 'Credit', 'currency', { defaultValue: 0, min: 0, precision: 12, scale: 2 })]),
  entity('expenseCategories', 'Expense Category', 'finance', [idField('Category ID'), tenantField(), schoolField(), branchField(), field('name', 'Category Name', 'text', { required: true, searchable: true }), field('code', 'Category Code', 'text', { required: true, unique: true })]),
  entity('incomeCategories', 'Income Category', 'finance', [idField('Category ID'), tenantField(), schoolField(), branchField(), field('name', 'Category Name', 'text', { required: true, searchable: true }), field('code', 'Category Code', 'text', { required: true, unique: true })]),
  entity('incomeTransactions', 'Income Transaction', 'finance', [idField('Transaction ID'), tenantField(), schoolField(), branchField(), field('categoryId', 'Income Category', 'reference', { required: true, filterable: true }), field('amount', 'Amount', 'currency', { required: true, min: 0.01, precision: 12, scale: 2 }), field('date', 'Income Date', 'date', { required: true, sortable: true, filterable: true }), field('referenceNumber', 'Reference Number', 'text', { searchable: true })]),
  entity('bankAccounts', 'Bank Account', 'finance', [idField('Bank Account ID'), tenantField(), schoolField(), branchField(), field('name', 'Account Name', 'text', { required: true, searchable: true }), field('bankName', 'Bank Name', 'text', { required: true, searchable: true }), field('accountNumber', 'Account Number', 'text', { required: true, sensitive: true }), field('currency', 'Currency', 'text', { required: true, defaultValue: 'USD', maxLength: 3 })]),
  entity('bankTransactions', 'Bank Transaction', 'finance', [idField('Transaction ID'), tenantField(), schoolField(), branchField(), field('bankAccountId', 'Bank Account', 'reference', { required: true, filterable: true }), field('amount', 'Amount', 'currency', { required: true, precision: 12, scale: 2 }), field('date', 'Transaction Date', 'datetime', { required: true, sortable: true, filterable: true }), field('referenceNumber', 'Reference Number', 'text', { searchable: true }), field('type', 'Transaction Type', 'select', { required: true, filterable: true, options: ['credit', 'debit'].map((value) => ({ label: value, value })) })]),
  entity('paymentMethods', 'Payment Method', 'finance', [idField('Method ID'), tenantField(), schoolField(), branchField(), field('name', 'Payment Method', 'text', { required: true, searchable: true }), field('code', 'Method Code', 'text', { required: true, unique: true }), field('active', 'Active', 'boolean', { defaultValue: true, filterable: true })]),
  entity('salaryComponents', 'Salary Component', 'payroll', [idField('Component ID'), tenantField(), schoolField(), branchField(), field('name', 'Component Name', 'text', { required: true, searchable: true }), field('componentType', 'Component Type', 'select', { required: true, filterable: true, options: ['earning', 'deduction', 'employer_contribution'].map((value) => ({ label: value, value })) }), field('amount', 'Default Amount', 'currency', { defaultValue: 0, min: 0, precision: 12, scale: 2 })]),
  entity('payslips', 'Payslip', 'payroll', [idField('Payslip ID'), tenantField(), schoolField(), branchField(), sessionField(), field('payrollEntryId', 'Payroll Entry', 'reference', { required: true, filterable: true }), field('staffId', 'Staff', 'reference', { required: true, filterable: true }), field('grossAmount', 'Gross Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('netAmount', 'Net Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('status', 'Status', 'select', { defaultValue: 'draft', filterable: true, options: ['draft', 'generated', 'published'].map((value) => ({ label: value, value })) })]),
  entity('staffLoans', 'Staff Loan', 'payroll', [idField('Loan ID'), tenantField(), schoolField(), branchField(), field('staffId', 'Staff', 'reference', { required: true, filterable: true }), field('principalAmount', 'Principal Amount', 'currency', { required: true, min: 0.01, precision: 12, scale: 2 }), field('balanceAmount', 'Balance Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('status', 'Status', 'select', { defaultValue: 'active', filterable: true, options: ['active', 'completed', 'cancelled'].map((value) => ({ label: value, value })) })]),
  entity('staffAdvances', 'Staff Advance', 'payroll', [idField('Advance ID'), tenantField(), schoolField(), branchField(), field('staffId', 'Staff', 'reference', { required: true, filterable: true }), field('amount', 'Advance Amount', 'currency', { required: true, min: 0.01, precision: 12, scale: 2 }), field('advanceDate', 'Advance Date', 'date', { required: true, sortable: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'pending', filterable: true, options: ['pending', 'approved', 'deducted', 'rejected'].map((value) => ({ label: value, value })) })]),
  entity('bookAuthors', 'Book Author', 'library', [idField('Author ID'), tenantField(), schoolField(), branchField(), field('name', 'Author Name', 'text', { required: true, searchable: true, sortable: true }), field('biography', 'Biography', 'richtext')]),
  entity('bookPublishers', 'Book Publisher', 'library', [idField('Publisher ID'), tenantField(), schoolField(), branchField(), field('name', 'Publisher Name', 'text', { required: true, searchable: true }), field('email', 'Email', 'email'), field('phone', 'Phone', 'phone')]),
  entity('libraryMembers', 'Library Member', 'library', [idField('Member ID'), tenantField(), schoolField(), branchField(), field('memberType', 'Member Type', 'select', { required: true, filterable: true, options: ['student', 'staff', 'parent'].map((value) => ({ label: value, value })) }), field('studentId', 'Student', 'reference', { filterable: true }), field('staffId', 'Staff', 'reference', { filterable: true }), field('membershipNumber', 'Membership Number', 'text', { required: true, unique: true, searchable: true }), field('status', 'Status', 'select', { defaultValue: 'active', filterable: true, options: ['active', 'suspended', 'expired'].map((value) => ({ label: value, value })) })]),
  entity('bookReservations', 'Book Reservation', 'library', [idField('Reservation ID'), tenantField(), schoolField(), branchField(), field('bookId', 'Book', 'reference', { required: true, filterable: true }), field('memberId', 'Library Member', 'reference', { required: true, filterable: true }), field('reservationDate', 'Reservation Date', 'date', { required: true, sortable: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'pending', filterable: true, options: ['pending', 'fulfilled', 'cancelled', 'expired'].map((value) => ({ label: value, value })) })]),
  entity('libraryFines', 'Library Fine', 'library', [idField('Fine ID'), tenantField(), schoolField(), branchField(), field('memberId', 'Library Member', 'reference', { required: true, filterable: true }), field('bookIssueId', 'Book Issue', 'reference', { required: true, filterable: true }), field('amount', 'Fine Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('status', 'Status', 'select', { defaultValue: 'pending', filterable: true, options: ['pending', 'paid', 'waived'].map((value) => ({ label: value, value })) })]),
  entity('vehicleTypes', 'Vehicle Type', 'transport', [idField('Vehicle Type ID'), tenantField(), schoolField(), field('name', 'Vehicle Type Name', 'text', { required: true, searchable: true }), field('capacity', 'Capacity', 'integer', { required: true, min: 1 })]),
  entity('drivers', 'Driver', 'transport', [idField('Driver ID'), tenantField(), schoolField(), branchField(), field('staffId', 'Staff', 'reference', { required: true, filterable: true }), field('licenseNumber', 'License Number', 'text', { required: true, unique: true, sensitive: true }), field('licenseExpiry', 'License Expiry', 'date', { required: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'active', filterable: true, options: ['active', 'inactive', 'suspended'].map((value) => ({ label: value, value })) })]),
  entity('transportStops', 'Transport Stop', 'transport', [idField('Stop ID'), tenantField(), schoolField(), branchField(), field('name', 'Stop Name', 'text', { required: true, searchable: true }), field('address', 'Address', 'address'), field('latitude', 'Latitude', 'decimal'), field('longitude', 'Longitude', 'decimal')]),
  entity('routeStops', 'Route Stop', 'transport', [idField('Route Stop ID'), tenantField(), schoolField(), branchField(), field('routeId', 'Transport Route', 'reference', { required: true, filterable: true }), field('stopId', 'Transport Stop', 'reference', { required: true, filterable: true }), field('stopOrder', 'Stop Order', 'integer', { required: true, min: 1 }), field('pickupTime', 'Pickup Time', 'time')]),
  entity('studentTransportAssignments', 'Student Transport Assignment', 'transport', [idField('Assignment ID'), tenantField(), schoolField(), branchField(), sessionField(), field('studentId', 'Student', 'reference', { required: true, filterable: true }), field('routeId', 'Transport Route', 'reference', { required: true, filterable: true }), field('stopId', 'Transport Stop', 'reference', { required: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'active', filterable: true, options: ['active', 'inactive'].map((value) => ({ label: value, value })) })]),
  entity('vehicleMaintenance', 'Vehicle Maintenance', 'transport', [idField('Maintenance ID'), tenantField(), schoolField(), branchField(), field('vehicleId', 'Vehicle', 'reference', { required: true, filterable: true }), field('maintenanceDate', 'Maintenance Date', 'date', { required: true, sortable: true, filterable: true }), field('cost', 'Cost', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('description', 'Description', 'textarea', { maxLength: 2000 })]),
  entity('transportFees', 'Transport Fee', 'transport', [idField('Transport Fee ID'), tenantField(), schoolField(), branchField(), sessionField(), field('studentId', 'Student', 'reference', { required: true, filterable: true }), field('routeId', 'Transport Route', 'reference', { required: true, filterable: true }), field('amount', 'Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('status', 'Status', 'select', { defaultValue: 'pending', filterable: true, options: ['pending', 'paid', 'overdue', 'waived'].map((value) => ({ label: value, value })) })]),
  entity('suppliers', 'Supplier', 'inventory', [idField('Supplier ID'), tenantField(), schoolField(), branchField(), field('name', 'Supplier Name', 'text', { required: true, searchable: true }), field('email', 'Email', 'email'), field('phone', 'Phone', 'phone'), field('address', 'Address', 'address')]),
  entity('purchaseOrders', 'Purchase Order', 'inventory', [idField('Purchase Order ID'), tenantField(), schoolField(), branchField(), field('supplierId', 'Supplier', 'reference', { required: true, filterable: true }), field('orderNumber', 'Order Number', 'text', { required: true, unique: true, searchable: true }), field('orderDate', 'Order Date', 'date', { required: true, sortable: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'draft', filterable: true, options: ['draft', 'submitted', 'approved', 'received', 'cancelled'].map((value) => ({ label: value, value })) })]),
  entity('purchaseOrderItems', 'Purchase Order Item', 'inventory', [idField('Item ID'), tenantField(), schoolField(), branchField(), field('purchaseOrderId', 'Purchase Order', 'reference', { required: true, filterable: true }), field('inventoryItemId', 'Inventory Item', 'reference', { required: true, filterable: true }), field('quantity', 'Quantity', 'decimal', { required: true, min: 0, precision: 12, scale: 3 }), field('unitPrice', 'Unit Price', 'currency', { required: true, min: 0, precision: 12, scale: 2 })]),
  entity('goodsReceipts', 'Goods Receipt', 'inventory', [idField('Receipt ID'), tenantField(), schoolField(), branchField(), field('purchaseOrderId', 'Purchase Order', 'reference', { required: true, filterable: true }), field('receivedDate', 'Received Date', 'date', { required: true, sortable: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'received', filterable: true, options: ['partial', 'received', 'rejected'].map((value) => ({ label: value, value })) })]),
  entity('assetCategories', 'Asset Category', 'inventory', [idField('Category ID'), tenantField(), schoolField(), branchField(), field('name', 'Category Name', 'text', { required: true, searchable: true }), field('code', 'Category Code', 'text', { required: true, unique: true })]),
  entity('assets', 'Asset', 'inventory', [idField('Asset ID'), tenantField(), schoolField(), branchField(), field('assetCategoryId', 'Asset Category', 'reference', { required: true, filterable: true }), field('name', 'Asset Name', 'text', { required: true, searchable: true, sortable: true }), field('assetTag', 'Asset Tag', 'text', { required: true, unique: true, searchable: true }), field('purchaseDate', 'Purchase Date', 'date', { filterable: true }), field('status', 'Status', 'select', { defaultValue: 'active', filterable: true, options: ['active', 'maintenance', 'disposed', 'lost'].map((value) => ({ label: value, value })) })]),
  entity('assetAssignments', 'Asset Assignment', 'inventory', [idField('Assignment ID'), tenantField(), schoolField(), branchField(), field('assetId', 'Asset', 'reference', { required: true, filterable: true }), field('assignedToStaffId', 'Assigned Staff', 'reference', { filterable: true }), field('assignmentDate', 'Assignment Date', 'date', { required: true, sortable: true, filterable: true }), field('status', 'Status', 'select', { defaultValue: 'assigned', filterable: true, options: ['assigned', 'returned', 'lost'].map((value) => ({ label: value, value })) })]),
  entity('assetMaintenance', 'Asset Maintenance', 'inventory', [idField('Maintenance ID'), tenantField(), schoolField(), branchField(), field('assetId', 'Asset', 'reference', { required: true, filterable: true }), field('maintenanceDate', 'Maintenance Date', 'date', { required: true, sortable: true, filterable: true }), field('cost', 'Cost', 'currency', { required: true, min: 0, precision: 12, scale: 2 }), field('description', 'Description', 'textarea', { maxLength: 2000 })]),
];
