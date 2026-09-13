export type SortOrder = 'asc' | 'desc';

export interface ListingState {
  searchQuery: string;
  dateSortOrder: SortOrder;
}

export function matchesQuery(fields: Array<string | number | null | undefined>, query: string): boolean {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return fields.some((field) => `${field ?? ''}`.toLowerCase().includes(normalized));
}

export function sortByDate<T>(items: T[], getDate: (item: T) => string | null | undefined, order: SortOrder): T[] {
  return [...items].sort((a, b) => {
    const left = new Date(getDate(a) ?? '').getTime() || 0;
    const right = new Date(getDate(b) ?? '').getTime() || 0;
    return order === 'asc' ? left - right : right - left;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = Math.max(0, (page - 1) * pageSize);
  return items.slice(start, start + pageSize);
}

export function totalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
