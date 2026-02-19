import { ApiError } from "./api-error";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const parsePagination = (query: { page?: string; pageSize?: string }) => {
  const page = query.page ? Number(query.page) : DEFAULT_PAGE;
  const pageSize = query.pageSize ? Number(query.pageSize) : DEFAULT_PAGE_SIZE;

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "Invalid page value");
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new ApiError(400, "Invalid pageSize value");
  }

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};
