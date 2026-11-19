import type { EntityMetadata, FieldMetadata } from '../interfaces/metadata.js';
import { entityMetadataSchema } from '../validators/metadata-schema.js';

export interface MetadataValidationReport {
  valid: boolean;
  errors: string[];
}

export class MetadataRegistryService {
  private readonly entities = new Map<string, EntityMetadata>();
  private readonly moduleCache = new Map<string, EntityMetadata[]>();

  register(metadata: EntityMetadata): void {
    const parsed = entityMetadataSchema.safeParse(metadata);
    if (!parsed.success) {
      const details = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      throw new Error(`Invalid metadata "${metadata.entityCode}": ${details}`);
    }

    if (this.entities.has(metadata.entityCode)) {
      throw new Error(`Duplicate entity code "${metadata.entityCode}"`);
    }

    const errors = this.validateLocalReferences(metadata);
    if (errors.length > 0) {
      throw new Error(
        `Invalid metadata "${metadata.entityCode}": ${errors.join('; ')}`,
      );
    }

    this.entities.set(metadata.entityCode, metadata);
    this.moduleCache.delete(metadata.module);
  }

  registerMany(metadata: EntityMetadata[]): void {
    const batchCodes = new Set<string>();
    for (const entity of metadata) {
      if (
        batchCodes.has(entity.entityCode) ||
        this.entities.has(entity.entityCode)
      ) {
        throw new Error(`Duplicate entity code "${entity.entityCode}"`);
      }
      batchCodes.add(entity.entityCode);
      const parsed = entityMetadataSchema.safeParse(entity);
      if (!parsed.success) {
        const details = parsed.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; ');
        throw new Error(`Invalid metadata "${entity.entityCode}": ${details}`);
      }
      const localErrors = this.validateLocalReferences(entity);
      if (localErrors.length > 0) {
        throw new Error(
          `Invalid metadata "${entity.entityCode}": ${localErrors.join('; ')}`,
        );
      }
    }

    for (const entity of metadata) {
      this.entities.set(entity.entityCode, entity);
      this.moduleCache.delete(entity.module);
    }

    const report = this.validateAll();
    if (!report.valid) {
      for (const entity of metadata) {
        this.entities.delete(entity.entityCode);
      }
      this.moduleCache.clear();
      throw new Error(
        `Invalid metadata registration: ${report.errors.join('; ')}`,
      );
    }
  }

  getByEntityCode(entityCode: string): EntityMetadata | undefined {
    return this.entities.get(entityCode);
  }

  getByModule(module: string): EntityMetadata[] {
    const cached = this.moduleCache.get(module);
    if (cached) return [...cached];

    const results = [...this.entities.values()].filter(
      (entity) => entity.module === module,
    );
    this.moduleCache.set(module, results);
    return [...results];
  }

  listEntities(): EntityMetadata[] {
    return [...this.entities.values()];
  }

  listModules(): string[] {
    return [
      ...new Set([...this.entities.values()].map((entity) => entity.module)),
    ].sort();
  }

  validateAll(): MetadataValidationReport {
    const errors: string[] = [];
    for (const metadata of this.entities.values()) {
      for (const field of this.flattenFields(metadata.fields)) {
        if (field.lookup) {
          const target = this.entities.get(field.lookup.entity);
          if (!target) {
            errors.push(
              `${metadata.entityCode}.${field.key}: unknown lookup entity "${field.lookup.entity}"`,
            );
          } else {
            const targetFields = new Set(
              this.flattenFields(target.fields).map(
                (targetField) => targetField.key,
              ),
            );
            for (const reference of [
              field.lookup.valueField,
              field.lookup.labelField,
            ]) {
              if (!targetFields.has(reference)) {
                errors.push(
                  `${metadata.entityCode}.${field.key}: lookup entity "${field.lookup.entity}" has no field "${reference}"`,
                );
              }
            }
          }
        }
        if (field.relation) {
          const target = this.entities.get(field.relation.entity);
          if (!target) {
            errors.push(
              `${metadata.entityCode}.${field.key}: unknown relationship entity "${field.relation.entity}"`,
            );
          } else if (
            field.relation.displayField &&
            !this.flattenFields(target.fields).some(
              (targetField) => targetField.key === field.relation?.displayField,
            )
          ) {
            errors.push(
              `${metadata.entityCode}.${field.key}: relationship entity "${field.relation.entity}" has no display field "${field.relation.displayField}"`,
            );
          }
        }
      }
      for (const relation of metadata.relationships) {
        const target = this.entities.get(relation.entity);
        if (!target) {
          errors.push(
            `${metadata.entityCode}: unknown relationship entity "${relation.entity}"`,
          );
          continue;
        }
        const foreignKeyFields =
          relation.type === 'one-to-many'
            ? this.flattenFields(target.fields)
            : this.flattenFields(metadata.fields);
        if (
          relation.foreignKey &&
          !foreignKeyFields.some((field) => field.key === relation.foreignKey)
        ) {
          errors.push(
            `${metadata.entityCode}: relationship references unknown foreign key "${relation.foreignKey}"`,
          );
        }
        if (
          relation.displayField &&
          !this.flattenFields(target.fields).some(
            (field) => field.key === relation.displayField,
          )
        ) {
          errors.push(
            `${metadata.entityCode}: relationship entity "${relation.entity}" has no display field "${relation.displayField}"`,
          );
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  exportMetadata(): EntityMetadata[] {
    return this.listEntities().map((entity) => structuredClone(entity));
  }

  private validateLocalReferences(metadata: EntityMetadata): string[] {
    const errors: string[] = [];
    const keys = new Set<string>();
    const fields = this.flattenFields(metadata.fields);
    for (const field of fields) {
      if (keys.has(field.key))
        errors.push(`duplicate field key "${field.key}"`);
      keys.add(field.key);
    }

    const fieldKeys = new Set(fields.map((field) => field.key));
    for (const key of [
      metadata.primaryKey,
      metadata.displayField,
      metadata.defaultSort.field,
      ...metadata.searchFields,
    ]) {
      if (!fieldKeys.has(key)) errors.push(`unknown field reference "${key}"`);
    }
    for (const tab of metadata.formLayout.tabs) {
      for (const section of tab.sections) {
        for (const item of section.fields) {
          if (!fieldKeys.has(item.field))
            errors.push(`form layout references unknown field "${item.field}"`);
        }
      }
    }
    for (const column of metadata.tableLayout.columns) {
      if (!fieldKeys.has(column.field))
        errors.push(`table layout references unknown field "${column.field}"`);
    }
    for (const filter of metadata.filterLayout.fields) {
      if (filter.field !== 'search' && !fieldKeys.has(filter.field))
        errors.push(`filter layout references unknown field "${filter.field}"`);
    }
    for (const field of fields) {
      if (
        field.lookup &&
        field.lookup.entity === metadata.entityCode &&
        !fieldKeys.has(field.lookup.valueField)
      ) {
        errors.push(
          `${field.key}: lookup references unknown local value field "${field.lookup.valueField}"`,
        );
      }
      if (
        field.lookup &&
        field.lookup.entity === metadata.entityCode &&
        !fieldKeys.has(field.lookup.labelField)
      ) {
        errors.push(
          `${field.key}: lookup references unknown local label field "${field.lookup.labelField}"`,
        );
      }
    }
    return errors;
  }

  private flattenFields(fields: FieldMetadata[]): FieldMetadata[] {
    return fields.flatMap((field) => [
      field,
      ...(field.nestedFields ? this.flattenFields(field.nestedFields) : []),
    ]);
  }
}
