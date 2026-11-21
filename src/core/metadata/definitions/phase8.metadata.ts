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
        'name',
        'title',
        'code',
        'status',
        'channel',
        'type',
        'format',
        'scheduledAt',
        'recipientCount',
        'documentType',
        'reportType',
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
    description: `${title} configuration or transactional record for platform communications and reporting.`,
    module,
    entityType: [
      'subscriptionPlans',
      'reportDefinitions',
      'notificationTemplates',
      'documentTemplates',
    ].includes(entity)
      ? 'master'
      : 'transaction',
    scopes: {
      schoolScoped: [
        'announcements',
        'notifications',
        'documentGenerationJobs',
      ].includes(entity),
      branchScoped: false,
      academicSessionScoped: false,
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

export const phase8Metadata: EntityMetadata[] = [
  entity('announcements', 'Announcement', 'communications', [
    field('id', 'Announcement ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('title', 'Title', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('body', 'Message', 'richtext', { required: true, maxLength: 10000 }),
    field('audience', 'Audience', 'select', {
      required: true,
      options: ['all', 'students', 'parents', 'staff'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('publishAt', 'Publish At', 'datetime', {
      required: true,
      filterable: true,
    }),
    field('expiresAt', 'Expires At', 'datetime'),
    field('status', 'Status', 'select', {
      defaultValue: 'draft',
      filterable: true,
      options: ['draft', 'scheduled', 'published', 'archived'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('notificationTemplates', 'Notification Template', 'communications', [
    field('id', 'Template ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('name', 'Template Name', 'text', {
      required: true,
      searchable: true,
    }),
    field('code', 'Template Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('channel', 'Channel', 'select', {
      required: true,
      filterable: true,
      options: ['email', 'sms', 'whatsapp', 'push', 'in-app'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('subject', 'Subject', 'text', { maxLength: 200 }),
    field('body', 'Body', 'richtext', { required: true, maxLength: 10000 }),
  ]),
  entity('notifications', 'Notification', 'communications', [
    field('id', 'Notification ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('recipientId', 'Recipient', 'reference', {
      required: true,
      filterable: true,
    }),
    field('channel', 'Channel', 'select', {
      required: true,
      filterable: true,
      options: ['email', 'sms', 'whatsapp', 'push', 'in-app'].map((value) => ({
        label: value,
        value,
      })),
    }),
    field('subject', 'Subject', 'text', { maxLength: 200 }),
    field('body', 'Message', 'textarea', { required: true, maxLength: 10000 }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'pending',
      filterable: true,
      options: ['pending', 'queued', 'sent', 'failed', 'cancelled'].map(
        (value) => ({ label: value, value }),
      ),
    }),
  ]),
  entity('reportDefinitions', 'Report Definition', 'reports', [
    field('id', 'Report ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('name', 'Report Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Report Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('reportType', 'Report Type', 'select', {
      required: true,
      filterable: true,
      options: [
        'student',
        'attendance',
        'examination',
        'fee',
        'payroll',
        'inventory',
        'custom',
      ].map((value) => ({ label: value, value })),
    }),
    field('format', 'Format', 'select', {
      required: true,
      defaultValue: 'pdf',
      options: ['pdf', 'csv', 'xlsx', 'json'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('reportExecutionLogs', 'Report Execution Log', 'reports', [
    field('id', 'Execution ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('reportDefinitionId', 'Report Definition', 'reference', {
      required: true,
      filterable: true,
    }),
    field('startedAt', 'Started At', 'datetime', {
      required: true,
      sortable: true,
      filterable: true,
    }),
    field('completedAt', 'Completed At', 'datetime'),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'queued',
      filterable: true,
      options: ['queued', 'running', 'completed', 'failed'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('subscriptionPlans', 'Subscription Plan', 'subscriptions', [
    field('id', 'Plan ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('name', 'Plan Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('code', 'Plan Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('monthlyPrice', 'Monthly Price', 'currency', {
      required: true,
      min: 0,
      precision: 12,
      scale: 2,
    }),
    field('annualPrice', 'Annual Price', 'currency', {
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
  entity('subscriptions', 'Subscription', 'subscriptions', [
    field('id', 'Subscription ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      required: true,
      filterable: true,
    }),
    field('planId', 'Subscription Plan', 'reference', {
      required: true,
      filterable: true,
    }),
    field('startDate', 'Start Date', 'date', {
      required: true,
      filterable: true,
    }),
    field('endDate', 'End Date', 'date', { required: true, filterable: true }),
    field('billingCycle', 'Billing Cycle', 'select', {
      required: true,
      options: ['monthly', 'annual'].map((value) => ({ label: value, value })),
    }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'active',
      filterable: true,
      options: ['trial', 'active', 'past_due', 'cancelled', 'expired'].map(
        (value) => ({ label: value, value }),
      ),
    }),
  ]),
  entity('documents', 'Document', 'documents', [
    field('id', 'Document ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('name', 'Document Name', 'text', {
      required: true,
      searchable: true,
      sortable: true,
    }),
    field('documentType', 'Document Type', 'text', {
      required: true,
      filterable: true,
    }),
    field('fileUrl', 'File URL', 'file', { required: true, exportable: false }),
    field('status', 'Status', 'select', {
      defaultValue: 'active',
      filterable: true,
      options: ['active', 'archived', 'deleted'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('documentTemplates', 'Document Template', 'documents', [
    field('id', 'Template ID', 'readonly', {
      readonly: true,
      visibleInForm: false,
    }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('name', 'Template Name', 'text', {
      required: true,
      searchable: true,
    }),
    field('code', 'Template Code', 'text', {
      required: true,
      unique: true,
      searchable: true,
    }),
    field('documentType', 'Document Type', 'text', {
      required: true,
      filterable: true,
    }),
    field('body', 'Template Body', 'richtext', {
      required: true,
      maxLength: 50000,
    }),
  ]),
  entity('documentGenerationJobs', 'Document Generation Job', 'documents', [
    field('id', 'Job ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', {
      readonly: true,
      visibleInForm: false,
    }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('templateId', 'Document Template', 'reference', {
      required: true,
      filterable: true,
    }),
    field('documentType', 'Document Type', 'text', { required: true }),
    field('status', 'Status', 'select', {
      required: true,
      defaultValue: 'queued',
      filterable: true,
      options: ['queued', 'processing', 'completed', 'failed'].map((value) => ({
        label: value,
        value,
      })),
    }),
  ]),
  entity('announcementRecipients', 'Announcement Recipient', 'communications', [
    field('id', 'Recipient ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('announcementId', 'Announcement', 'reference', { required: true, filterable: true }),
    field('recipientId', 'Recipient', 'reference', { required: true, filterable: true }),
    field('channel', 'Channel', 'select', { required: true, filterable: true, options: ['email', 'sms', 'whatsapp', 'push', 'in-app'].map((value) => ({ label: value, value })) }),
    field('status', 'Delivery Status', 'select', { required: true, defaultValue: 'pending', filterable: true, options: ['pending', 'sent', 'failed', 'read'].map((value) => ({ label: value, value })) }),
  ]),
  entity('notificationDeliveries', 'Notification Delivery', 'communications', [
    field('id', 'Delivery ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('notificationId', 'Notification', 'reference', { required: true, filterable: true }),
    field('provider', 'Provider', 'text', { required: true, searchable: true }),
    field('providerMessageId', 'Provider Message ID', 'text', { searchable: true }),
    field('sentAt', 'Sent At', 'datetime', { sortable: true, filterable: true }),
    field('status', 'Status', 'select', { required: true, defaultValue: 'pending', filterable: true, options: ['pending', 'queued', 'sent', 'failed', 'bounced'].map((value) => ({ label: value, value })) }),
  ]),
  entity('messageThreads', 'Message Thread', 'communications', [
    field('id', 'Thread ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('subject', 'Subject', 'text', { required: true, searchable: true }),
    field('participantIds', 'Participants', 'array', { arrayConfig: { itemType: 'reference', maxItems: 500 } }),
    field('status', 'Status', 'select', { required: true, defaultValue: 'open', filterable: true, options: ['open', 'closed', 'archived'].map((value) => ({ label: value, value })) }),
  ]),
  entity('messages', 'Message', 'communications', [
    field('id', 'Message ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('threadId', 'Message Thread', 'reference', { required: true, filterable: true }),
    field('senderId', 'Sender', 'reference', { required: true, filterable: true }),
    field('body', 'Message', 'richtext', { required: true, maxLength: 20000 }),
    field('sentAt', 'Sent At', 'datetime', { required: true, sortable: true, filterable: true }),
  ]),
  entity('communicationPreferences', 'Communication Preference', 'communications', [
    field('id', 'Preference ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('recipientId', 'Recipient', 'reference', { required: true, filterable: true }),
    field('emailEnabled', 'Email Enabled', 'boolean', { defaultValue: true }),
    field('smsEnabled', 'SMS Enabled', 'boolean', { defaultValue: true }),
    field('whatsappEnabled', 'WhatsApp Enabled', 'boolean', { defaultValue: true }),
    field('pushEnabled', 'Push Enabled', 'boolean', { defaultValue: true }),
  ]),
  entity('documentCategories', 'Document Category', 'documents', [
    field('id', 'Category ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('name', 'Category Name', 'text', { required: true, searchable: true }),
    field('code', 'Category Code', 'text', { required: true, unique: true, searchable: true }),
    field('status', 'Status', 'select', { required: true, defaultValue: 'active', filterable: true, options: ['active', 'inactive'].map((value) => ({ label: value, value })) }),
  ]),
  entity('reportSchedules', 'Report Schedule', 'reports', [
    field('id', 'Schedule ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('reportDefinitionId', 'Report Definition', 'reference', { required: true, filterable: true }),
    field('cronExpression', 'Cron Expression', 'text', { required: true }),
    field('format', 'Format', 'select', { required: true, defaultValue: 'pdf', options: ['pdf', 'csv', 'xlsx', 'json'].map((value) => ({ label: value, value })) }),
    field('nextRunAt', 'Next Run At', 'datetime', { sortable: true, filterable: true }),
    field('status', 'Status', 'select', { required: true, defaultValue: 'active', filterable: true, options: ['active', 'paused', 'disabled'].map((value) => ({ label: value, value })) }),
  ]),
  entity('exportJobs', 'Export Job', 'reports', [
    field('id', 'Export ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { readonly: true, visibleInForm: false }),
    field('schoolId', 'School', 'reference', { filterable: true }),
    field('entity', 'Entity', 'text', { required: true, searchable: true }),
    field('format', 'Format', 'select', { required: true, options: ['csv', 'xlsx', 'json'].map((value) => ({ label: value, value })) }),
    field('fileUrl', 'File URL', 'file', { exportable: false }),
    field('status', 'Status', 'select', { required: true, defaultValue: 'queued', filterable: true, options: ['queued', 'processing', 'completed', 'failed'].map((value) => ({ label: value, value })) }),
  ]),
  entity('subscriptionInvoices', 'Subscription Invoice', 'subscriptions', [
    field('id', 'Invoice ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { required: true, filterable: true }),
    field('subscriptionId', 'Subscription', 'reference', { required: true, filterable: true }),
    field('invoiceNumber', 'Invoice Number', 'text', { required: true, unique: true, searchable: true }),
    field('amount', 'Amount', 'currency', { required: true, min: 0, precision: 12, scale: 2 }),
    field('dueDate', 'Due Date', 'date', { required: true, sortable: true, filterable: true }),
    field('status', 'Status', 'select', { required: true, defaultValue: 'draft', filterable: true, options: ['draft', 'issued', 'paid', 'overdue', 'void'].map((value) => ({ label: value, value })) }),
  ]),
  entity('subscriptionPayments', 'Subscription Payment', 'subscriptions', [
    field('id', 'Payment ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { required: true, filterable: true }),
    field('subscriptionId', 'Subscription', 'reference', { required: true, filterable: true }),
    field('invoiceId', 'Invoice', 'reference', { required: true, filterable: true }),
    field('amount', 'Amount', 'currency', { required: true, min: 0.01, precision: 12, scale: 2 }),
    field('paidAt', 'Paid At', 'datetime', { required: true, sortable: true, filterable: true }),
    field('referenceNumber', 'Reference Number', 'text', { searchable: true, unique: true }),
    field('status', 'Status', 'select', { required: true, defaultValue: 'pending', filterable: true, options: ['pending', 'completed', 'failed', 'refunded'].map((value) => ({ label: value, value })) }),
  ]),
  entity('subscriptionUsage', 'Subscription Usage', 'subscriptions', [
    field('id', 'Usage ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { required: true, filterable: true }),
    field('subscriptionId', 'Subscription', 'reference', { required: true, filterable: true }),
    field('metric', 'Usage Metric', 'text', { required: true, searchable: true }),
    field('quantity', 'Quantity', 'decimal', { required: true, min: 0, precision: 12, scale: 3 }),
    field('periodStart', 'Period Start', 'date', { required: true, sortable: true, filterable: true }),
    field('periodEnd', 'Period End', 'date', { required: true, sortable: true, filterable: true }),
  ]),
  entity('tenantFeatureOverrides', 'Tenant Feature Override', 'subscriptions', [
    field('id', 'Override ID', 'readonly', { readonly: true, visibleInForm: false }),
    field('tenantId', 'Tenant', 'reference', { required: true, filterable: true }),
    field('featureCode', 'Feature Code', 'text', { required: true, searchable: true }),
    field('enabled', 'Enabled', 'boolean', { required: true, defaultValue: false, filterable: true }),
    field('effectiveDate', 'Effective Date', 'date', { required: true, sortable: true, filterable: true }),
    field('expiryDate', 'Expiry Date', 'date', { filterable: true }),
  ]),
];
