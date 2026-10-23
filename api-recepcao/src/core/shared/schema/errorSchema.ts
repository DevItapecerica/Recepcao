export const errorSchema = {
  401: {
    description: "Unauthorized",
    type: "object",
    properties: {
      message: { type: "string", example: "Unauthorized" },
    },
  },
  403: {
    description: "Unauthorized",
    type: "object",
    properties: {
      message: { type: "string", example: "Unauthorized" },
    },
  },
  404: {
    description: "Not Found",
    type: "object",
    properties: {
      message: { type: "string", example: "Not found" },
    },
  },
  409: {
    description: "Duplicate",
    type: "object",
    properties: {
      message: { type: "string", example: "Duplicate" },
    },
  },

  500: {
    description: "Internal Server Error",
    type: "object",
    properties: {
      message: { type: "string", example: "Internal Server Error" },
    },
  },
};
