export const fieldTypes = [
  'text',
  'textarea',
  'number',
  'integer',
  'decimal',
  'email',
  'password',
  'date',
  'datetime',
  'time',
  'boolean',
  'checkbox',
  'radio',
  'select',
  'multiselect',
  'autocomplete',
  'file',
  'image',
  'phone',
  'currency',
  'percentage',
  'address',
  'richtext',
  'json',
  'object',
  'array',
  'reference',
  'computed',
  'readonly',
] as const;

export type FieldType = (typeof fieldTypes)[number];
export type EntityPermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'approve'
  | 'publish';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface LookupMetadata {
  entity: string;
  valueField: string;
  labelField: string;
  filters?: Record<string, string | number | boolean>;
}

export interface ValidationMetadata {
  name: string;
  value?: string | number | boolean;
  message?: string;
}

export interface RelationMetadata {
  entity: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  foreignKey?: string;
  displayField?: string;
}

export interface ArrayConfig {
  itemType: FieldType;
  minItems?: number;
  maxItems?: number;
}

export interface FieldMetadata {
  key: string;
  label: string;
  description?: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  visibleInForm?: boolean;
  visibleInTable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  importable?: boolean;
  sensitive?: boolean;
  unique?: boolean;
  indexed?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  helpText?: string;
  order?: number;
  width?: number;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  precision?: number;
  scale?: number;
  pattern?: string;
  options?: FieldOption[];
  lookup?: LookupMetadata;
  validators?: ValidationMetadata[];
  permission?: string;
  conditionalVisibility?: string;
  conditionalRequired?: string;
  relation?: RelationMetadata;
  nestedFields?: FieldMetadata[];
  arrayConfig?: ArrayConfig;
}

export interface EntityPermissionMetadata {
  action: EntityPermissionAction;
  permission: string;
  description?: string;
}

export interface EntityScopeMetadata {
  tenant: boolean;
  school: boolean;
  branch: boolean;
  academicSession: boolean;
}

export interface FormFieldLayoutMetadata {
  field: string;
  width?: number;
  readonly?: boolean;
}

export interface FormSectionMetadata {
  title: string;
  description?: string;
  columns?: number;
  fields: FormFieldLayoutMetadata[];
}

export interface FormTabMetadata {
  title: string;
  sections: FormSectionMetadata[];
}

export interface FormLayoutMetadata {
  tabs: FormTabMetadata[];
}

export interface TableColumnMetadata {
  field: string;
  label?: string;
  width?: number;
  pinned?: boolean;
}

export interface TableLayoutMetadata {
  columns: TableColumnMetadata[];
  pageSize?: number;
  selectable?: boolean;
}

export interface FilterFieldMetadata {
  field: string;
  type?: FieldType;
  label?: string;
}

export interface FilterLayoutMetadata {
  fields: FilterFieldMetadata[];
}

export interface NavigationMetadata {
  label: string;
  icon?: string;
  route?: string;
  order?: number;
}

export interface ImportMetadata {
  enabled: boolean;
  templateFields?: string[];
}

export interface ExportMetadata {
  enabled: boolean;
  formats?: ('csv' | 'xlsx' | 'json')[];
}

export interface AuditMetadata {
  enabled: boolean;
  trackChanges?: boolean;
  excludeFields?: string[];
}

export interface EntityFeatureMetadata {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  import?: boolean;
  export?: boolean;
}

export interface EntityMetadata {
  entity: string;
  entityCode: string;
  title: string;
  pluralTitle: string;
  description: string;
  module: string;
  apiEndpoint: string;
  collectionName: string;
  primaryKey: string;
  version: number;
  tenantScoped: boolean;
  schoolScoped: boolean;
  branchScoped: boolean;
  academicSessionScoped: boolean;
  entityType: 'master' | 'transaction' | 'system';
  fields: FieldMetadata[];
  relationships: RelationMetadata[];
  permissions: EntityPermissionMetadata[];
  formLayout: FormLayoutMetadata;
  tableLayout: TableLayoutMetadata;
  filterLayout: FilterLayoutMetadata;
  features: EntityFeatureMetadata;
  audit: AuditMetadata;
  import: ImportMetadata;
  export: ExportMetadata;
  navigation?: NavigationMetadata;
  displayField: string;
  searchFields: string[];
  defaultSort: { field: string; order: 'asc' | 'desc' };
  defaultPageSize: number;
  maxPageSize: number;
}
