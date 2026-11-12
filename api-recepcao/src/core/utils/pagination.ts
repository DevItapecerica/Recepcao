import { AppError } from "../types/errorTypes.js";

export interface PaginationInput {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
}

export const parsePagination = (input: PaginationInput) => {
  const page = input.page === undefined ? 0 : Number(input.page);
  const limit = input.limit === undefined ? 10 : Number(input.limit);
  const search = input.search === undefined ? "" : String(input.search).trim();

  if (
    !Number.isInteger(page) ||
    page < 0 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    search.length > 100
  ) {
    throw new AppError("Invalid pagination filters", 400, "INVALID_PAGINATION");
  }

  return { page, limit, offset: page * limit, search };
};
