import { z } from 'zod';
import { fieldTypes } from '../interfaces/metadata.js';

const fieldOptionSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
  disabled: z.boolean().optional(),
});

const lookupSchema = z.object({
  entity: z.string().min(1),
  valueField: z.string().min(1),
  labelField: z.string().min(1),
  filters: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

const validationSchema = z.object({
  name: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  message: z.string().optional(),
});

const relationSchema = z.object({
  entity: z.string().min(1),
  type: z.enum(['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many']),
  foreignKey: z.string().optional(),
  displayField: z.string().optional(),
});

const fieldSchema: z.ZodType = z.lazy(() =>
  z.object({
    key: z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/),
    label: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(fieldTypes),
    required: z.boolean().optional(),
    readonly: z.boolean().optional(),
    disabled: z.boolean().optional(),
    hidden: z.boolean().optional(),
    visibleInForm: z.boolean().optional(),
    visibleInTable: z.boolean().optional(),
    searchable: z.boolean().optional(),
    sortable: z.boolean().optional(),
    filterable: z.boolean().optional(),
    exportable: z.boolean().optional(),
    importable: z.boolean().optional(),
    sensitive: z.boolean().optional(),
    unique: z.boolean().optional(),
    indexed: z.boolean().optional(),
    defaultValue: z.unknown().optional(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    order: z.number().optional(),
    width: z.number().positive().optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().nonnegative().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    precision: z.number().int().nonnegative().optional(),
    scale: z.number().int().nonnegative().optional(),
    pattern: z.string().optional(),
    options: z.array(fieldOptionSchema).optional(),
    lookup: lookupSchema.optional(),
    validators: z.array(validationSchema).optional(),
    permission: z.string().optional(),
    conditionalVisibility: z.string().optional(),
    conditionalRequired: z.string().optional(),
    relation: relationSchema.optional(),
    nestedFields: z.array(fieldSchema).optional(),
    arrayConfig: z
      .object({
        itemType: z.enum(fieldTypes),
        minItems: z.number().int().nonnegative().optional(),
        maxItems: z.number().int().nonnegative().optional(),
      })
      .optional(),
  }),
);

const permissionSchema = z.object({
  action: z.enum([
    'create',
    'read',
    'update',
    'delete',
    'export',
    'import',
    'approve',
    'publish',
  ]),
  permission: z.string().min(1),
  description: z.string().optional(),
});

const formFieldSchema = z.object({
  field: z.string().min(1),
  width: z.number().positive().optional(),
  readonly: z.boolean().optional(),
});

const formSectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  columns: z.number().int().positive().optional(),
  fields: z.array(formFieldSchema),
});

export const entityMetadataSchema = z
  .object({
    entity: z.string().min(1),
    entityCode: z.string().regex(/^[a-z][a-zA-Z0-9]*$/),
    title: z.string().min(1),
    pluralTitle: z.string().min(1),
    description: z.string().min(1),
    module: z.string().min(1),
    apiEndpoint: z.string().regex(/^\/[a-zA-Z0-9/_-]*$/),
    collectionName: z.string().regex(/^[a-z][a-z0-9_]*$/),
    primaryKey: z.string().min(1),
    version: z.number().int().positive(),
    tenantScoped: z.boolean(),
    schoolScoped: z.boolean(),
    branchScoped: z.boolean(),
    academicSessionScoped: z.boolean(),
    entityType: z.enum(['master', 'transaction', 'system']),
    fields: z.array(fieldSchema).min(1),
    relationships: z.array(relationSchema),
    permissions: z.array(permissionSchema).min(1),
    formLayout: z.object({
      tabs: z
        .array(
          z.object({
            title: z.string().min(1),
            sections: z.array(formSectionSchema),
          }),
        )
        .min(1),
    }),
    tableLayout: z.object({
      columns: z
        .array(
          z.object({
            field: z.string().min(1),
            label: z.string().optional(),
            width: z.number().positive().optional(),
            pinned: z.boolean().optional(),
          }),
        )
        .min(1),
      pageSize: z.number().int().positive().optional(),
      selectable: z.boolean().optional(),
    }),
    filterLayout: z.object({
      fields: z.array(
        z.object({
          field: z.string().min(1),
          type: z.enum(fieldTypes).optional(),
          label: z.string().optional(),
        }),
      ),
    }),
    features: z.object({
      create: z.boolean(),
      read: z.boolean(),
      update: z.boolean(),
      delete: z.boolean(),
      import: z.boolean().optional(),
      export: z.boolean().optional(),
    }),
    audit: z.object({
      enabled: z.boolean(),
      trackChanges: z.boolean().optional(),
      excludeFields: z.array(z.string()).optional(),
    }),
    import: z.object({
      enabled: z.boolean(),
      templateFields: z.array(z.string()).optional(),
    }),
    export: z.object({
      enabled: z.boolean(),
      formats: z.array(z.enum(['csv', 'xlsx', 'json'])).optional(),
    }),
    navigation: z
      .object({
        label: z.string().min(1),
        icon: z.string().optional(),
        route: z.string().optional(),
        order: z.number().optional(),
      })
      .optional(),
    displayField: z.string().min(1),
    searchFields: z.array(z.string()),
    defaultSort: z.object({
      field: z.string().min(1),
      order: z.enum(['asc', 'desc']),
    }),
    defaultPageSize: z.number().int().positive(),
    maxPageSize: z.number().int().positive(),
  })
  .refine((metadata) => metadata.defaultPageSize <= metadata.maxPageSize, {
    message: 'defaultPageSize must not exceed maxPageSize',
    path: ['defaultPageSize'],
  });
