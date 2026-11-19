import type {
  EntityMetadata,
  EntityPermissionMetadata,
  FieldMetadata,
  FormTabMetadata,
  RelationMetadata,
} from '../interfaces/metadata.js';

export function field(
  key: string,
  label: string,
  type: FieldMetadata['type'],
  options: Partial<FieldMetadata> = {},
): FieldMetadata {
  return {
    key,
    label,
    type,
    visibleInForm: true,
    visibleInTable: false,
    searchable: false,
    sortable: false,
    filterable: false,
    exportable: true,
    importable: true,
    ...options,
  };
}

export function baseEntity(input: {
  entity: string;
  title: string;
  pluralTitle: string;
  description: string;
  module: string;
  entityType?: EntityMetadata['entityType'];
  scopes?: Partial<
    Pick<
      EntityMetadata,
      'tenantScoped' | 'schoolScoped' | 'branchScoped' | 'academicSessionScoped'
    >
  >;
  fields: FieldMetadata[];
  relationships?: RelationMetadata[];
  tabs: FormTabMetadata[];
  columns: string[];
  filters?: string[];
  searchFields?: string[];
  displayField?: string;
  permissions?: EntityPermissionMetadata[];
}): EntityMetadata {
  const code = input.entity;
  const scope = {
    tenantScoped: true,
    schoolScoped: false,
    branchScoped: false,
    academicSessionScoped: false,
    ...input.scopes,
  };
  return {
    entity: code,
    entityCode: code,
    title: input.title,
    pluralTitle: input.pluralTitle,
    description: input.description,
    module: input.module,
    apiEndpoint: `/entities/${code}`,
    collectionName: code.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    ),
    primaryKey: 'id',
    version: 1,
    tenantScoped: scope.tenantScoped,
    schoolScoped: scope.schoolScoped,
    branchScoped: scope.branchScoped,
    academicSessionScoped: scope.academicSessionScoped,
    entityType: input.entityType ?? 'master',
    fields: input.fields,
    relationships: input.relationships ?? [],
    permissions: input.permissions ?? [
      { action: 'create', permission: `${code}.create` },
      { action: 'read', permission: `${code}.read` },
      { action: 'update', permission: `${code}.update` },
      { action: 'delete', permission: `${code}.delete` },
      { action: 'export', permission: `${code}.export` },
      { action: 'import', permission: `${code}.import` },
    ],
    formLayout: { tabs: input.tabs },
    tableLayout: {
      columns: input.columns.map((key) => ({ field: key })),
      pageSize: 20,
      selectable: true,
    },
    filterLayout: {
      fields: (input.filters ?? []).map((key) => ({ field: key })),
    },
    features: {
      create: true,
      read: true,
      update: true,
      delete: true,
      import: true,
      export: true,
    },
    audit: { enabled: true, trackChanges: true },
    import: {
      enabled: true,
      templateFields: input.fields
        .filter((item) => item.importable)
        .map((item) => item.key),
    },
    export: { enabled: true, formats: ['csv', 'xlsx', 'json'] },
    navigation: {
      label: input.pluralTitle,
      route: `/admin/${code}`,
      order: 10,
    },
    displayField:
      input.displayField ??
      input.fields.find((item) => item.type === 'text')?.key ??
      'id',
    searchFields: input.searchFields ?? [],
    defaultSort: {
      field: input.fields.find((item) => item.sortable)?.key ?? 'id',
      order: 'asc',
    },
    defaultPageSize: 20,
    maxPageSize: 100,
  };
}
