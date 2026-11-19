import { describe, expect, it } from 'vitest';
import { initialEntityMetadata } from '../../src/core/metadata/definitions/index.js';
import { MetadataRegistryService } from '../../src/core/metadata/registry/metadata-registry.js';

describe('MetadataRegistryService', () => {
  it('registers and validates the initial entity metadata set', () => {
    const registry = new MetadataRegistryService();
    registry.registerMany(initialEntityMetadata);

    expect(registry.validateAll()).toEqual({ valid: true, errors: [] });
    expect(registry.listEntities()).toHaveLength(8);
    expect(registry.listModules()).toContain('academics');
    expect(
      registry.getByModule('academics').map(({ entityCode }) => entityCode),
    ).toEqual(['classes', 'sections', 'subjects']);
  });

  it('rejects duplicate entity codes without partially registering the batch', () => {
    const registry = new MetadataRegistryService();

    expect(() =>
      registry.registerMany([
        initialEntityMetadata[0]!,
        initialEntityMetadata[0]!,
      ]),
    ).toThrow('Duplicate entity code');
    expect(registry.listEntities()).toHaveLength(0);
  });

  it('rejects duplicate field keys and invalid layout field references', () => {
    const student = structuredClone(
      initialEntityMetadata.find(
        ({ entityCode }) => entityCode === 'students',
      )!,
    );
    student.fields.push({ ...student.fields[0]! });

    const registry = new MetadataRegistryService();
    expect(() => registry.register(student)).toThrow('duplicate field key');

    const invalidLayout = structuredClone(
      initialEntityMetadata.find(
        ({ entityCode }) => entityCode === 'students',
      )!,
    );
    invalidLayout.tableLayout.columns[0]!.field = 'unapprovedField';
    expect(() => registry.register(invalidLayout)).toThrow(
      'table layout references unknown field',
    );
  });

  it('rejects lookups whose display or value fields are absent from the target entity', () => {
    const metadata = structuredClone(initialEntityMetadata);
    const students = metadata.find(
      ({ entityCode }) => entityCode === 'students',
    )!;
    const classField = students.fields.find(({ key }) => key === 'classId')!;
    classField.lookup!.labelField = 'missingName';

    expect(() => new MetadataRegistryService().registerMany(metadata)).toThrow(
      'has no field "missingName"',
    );
  });

  it('keeps returned module lists independent from the registry cache', () => {
    const registry = new MetadataRegistryService();
    registry.registerMany(initialEntityMetadata);
    const results = registry.getByModule('academics');
    results.pop();

    expect(registry.getByModule('academics')).toHaveLength(3);
  });
});
