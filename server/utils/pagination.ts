const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

interface PaginationParams {
  skip: number;
  take: number;
}

export const parsePagination = (query: { offset?: string; limit?: string }): PaginationParams => {
  const offset = Number(query.offset);
  const limit = Number(query.limit);

  return {
    skip: Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0,
    take: Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : DEFAULT_LIMIT,
  };
};
