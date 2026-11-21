import { describe, expect, it } from 'vitest';
import { parseListQuery } from '../../src/core/crud/query-parser.js';
import { initialEntityMetadata } from '../../src/core/metadata/definitions/index.js';

const students = initialEntityMetadata.find(
  ({ entityCode }) => entityCode === 'students',
)!;

describe('generic CRUD query parser', () => {
  it('applies safe defaults and metadata-approved sorting', () => {
    expect(
      parseListQuery({ sortBy: '$where', sortOrder: 'desc' }, students),
    ).toMatchObject({
      page: 1,
      pageSize: 20,
      sortBy: 'admissionNumber',
      sortOrder: -1,
    });
  });

  it('rejects operators and fields that are not filterable', () => {
    expect(() =>
      parseListQuery(
        { filters: JSON.stringify({ remarks: 'note' }) },
        students,
      ),
    ).toThrow('Filtering is not allowed');
    expect(() =>
      parseListQuery(
        { filters: JSON.stringify({ studentStatus: { $eq: 'active' } }) },
        students,
      ),
    ).toThrow('MongoDB operators');
  });

  it('rejects excessive pagination and unapproved projected fields', () => {
    expect(() => parseListQuery({ pageSize: '101' }, students)).toThrow(
      'must not exceed',
    );
    expect(() =>
      parseListQuery({ fields: 'fullName,passwordHash' }, students),
    ).toThrow('not allowed');
  });
});
