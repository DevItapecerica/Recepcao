import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../types/errorTypes.js";
import { parsePagination } from "./pagination.js";

test("parses pagination defaults and string query values", () => {
  assert.deepEqual(parsePagination({}), { page: 0, limit: 10, offset: 0, search: "" });
  assert.deepEqual(parsePagination({ page: "2", limit: "20", search: " Ana " }), {
    page: 2,
    limit: 20,
    offset: 40,
    search: "Ana",
  });
});

test("rejects unsafe pagination values", () => {
  for (const input of [{ page: -1 }, { limit: 0 }, { limit: 101 }, { page: "x" }]) {
    assert.throws(
      () => parsePagination(input),
      (error: unknown) => error instanceof AppError && error.code === "INVALID_PAGINATION",
    );
  }
});
