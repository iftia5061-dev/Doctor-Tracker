export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const buildPagination = (
  page: number = 1,
  limit: number = 10,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
};
