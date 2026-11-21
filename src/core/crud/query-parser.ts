import type { EntityMetadata } from '../metadata/interfaces/metadata.js';
import { AppError } from '../errors/app-error.js';

export interface ParsedListQuery {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 1 | -1;
  search?: string;
  filters: Record<string, unknown>;
  fields?: string[];
}

export function parseListQuery(
  query: Record<string, unknown>,
  metadata: EntityMetadata,
): ParsedListQuery {
  const page = parsePositiveInteger(query.page, 1);
  const pageSize = parsePositiveInteger(
    query.pageSize,
    metadata.defaultPageSize,
  );
  if (pageSize > metadata.maxPageSize) {
    throw new AppError(`pageSize must not exceed ${metadata.maxPageSize}`, 400);
  }

  const sortableFields = new Set(
    metadata.fields.filter((field) => field.sortable).map((field) => field.key),
  );
  const sortBy =
    typeof query.sortBy === 'string' && sortableFields.has(query.sortBy)
      ? query.sortBy
      : metadata.defaultSort.field;
  const sortOrder =
    query.sortOrder === 'desc'
      ? -1
      : query.sortOrder === 'asc'
        ? 1
        : metadata.defaultSort.order === 'desc'
          ? -1
          : 1;

  const filters = parseFilters(query.filters);
  for (const [key, value] of Object.entries(filters)) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new AppError(`Invalid filter field "${key}"`, 400);
    }
    const field = metadata.fields.find((candidate) => candidate.key === key);
    if (!field?.filterable) {
      throw new AppError(`Filtering is not allowed for field "${key}"`, 400);
    }
    if (typeof value === 'object' && value !== null) {
      throw new AppError(`MongoDB operators are not allowed in filters`, 400);
    }
  }

  let fields: string[] | undefined;
  if (typeof query.fields === 'string') {
    fields = query.fields
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean);
    const allowed = new Set(
      metadata.fields
        .filter((field) => !field.sensitive)
        .map((field) => field.key),
    );
    if (fields.some((field) => !allowed.has(field))) {
      throw new AppError('One or more requested fields are not allowed', 400);
    }
  }

  const search =
    typeof query.search === 'string'
      ? query.search.trim().slice(0, 200)
      : undefined;

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    filters,
    ...(search ? { search } : {}),
    ...(fields ? { fields } : {}),
  };
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'string' || value.trim() === '') return fallback;
  if (!/^\d+$/.test(value))
    throw new AppError('Pagination values must be integers', 400);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new AppError('Pagination values must be positive integers', 400);
  }
  return parsed;
}

function parseFilters(value: unknown): Record<string, unknown> {
  if (value === undefined) return {};
  if (typeof value !== 'string')
    throw new AppError('filters must be a JSON object', 400);
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new AppError('filters must be a JSON object', 400);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('filters must be valid JSON', 400);
  }
}
