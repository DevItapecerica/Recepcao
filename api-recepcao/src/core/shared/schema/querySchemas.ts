export const paginationQuerySchema = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 0, default: 0 },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
    search: { type: "string", maxLength: 100 },
  },
};

export const uuidParamsSchema = {
  type: "object",
  required: ["uuid"],
  properties: { uuid: { type: "string", format: "uuid" } },
};
