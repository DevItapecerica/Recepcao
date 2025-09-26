const EditableFields = {
  admin: [
    "name",
    "cpf",
    "email",
    "phone",
    "photo",
    "address",
    "city",
    "state",
    "zipCode",
  ],
  superadmin: [
    "name",
    "cpf",
    "email",
    "phone",
    "photo",
    "address",
    "city",
    "state",
    "zipCode",
  ],
  user: [
    "name",
    "cpf",
    "email",
    "phone",
    "photo",
    "address",
    "city",
    "state",
    "zipCode",
  ],
};

const MethodesPermissions = {
  user: {
    admin: ["GET", "POST"] as string[],
    superadmin: ["GET", "POST", "PUT", "DELETE"] as string[],
    user: [] as string[],
  },
  visitors: {
    admin: ["GET", "POST", "PUT"] as string[],
    superadmin: ["GET", "POST", "PUT", "DELETE"] as string[],
    user: ["GET", "POST", "PUT"] as string[],
  },
  visits: {
    admin: ["GET", "POST"] as string[],
    superadmin: ["GET", "POST", "PUT", "DELETE"] as string[],
    user: ["GET", "POST"] as string[],
  },
};

// Valida se os campos enviados são permitidos
const validateFields = (
  data: object,
  role: keyof typeof EditableFields
): { invalidFields: string[]; ok: boolean; message: string } => {
  const allowedFields = EditableFields[role] || [];
  const invalidFields = Object.keys(data).filter(
    (key) => !allowedFields.includes(key)
  );
  const ok = invalidFields.length === 0;

  return {
    invalidFields,
    ok,
    message: ok ? "Valid fields" : "Invalid fields",
  };
};

// Valida se o método HTTP é permitido para o role no módulo
const validateMethod = (
  method: string,
  role: keyof typeof EditableFields,
  module: keyof typeof MethodesPermissions
): { ok: boolean; message: string } => {
  const allowedMethods = MethodesPermissions[module]?.[role] || [];

  const ok = allowedMethods.includes(method.toUpperCase());

  return {
    ok,
    message: ok ? "Allowed method" : "Method not permitted",
  };
};

// Valida permissão geral (campos + método)
export function validatePermission(
  data: object,
  role: keyof typeof EditableFields,
  method: string,
  module: keyof typeof MethodesPermissions
): {
  ok: boolean;
  invalidFields?: string[];
  message: string;
} {
  if (!role || !method || !module)
    return { ok: false, message: "Missing required" };

  const methodValidation = validateMethod(method, role, module);
  if (!methodValidation.ok) {
    return {
      ok: false,
      message: methodValidation.message,
    };
  }

  if (["PUT"].includes(method.toUpperCase()) && module === "visitors") {
    const fieldValidation = validateFields(data, role);
    if (!fieldValidation.ok) {
      return {
        ok: false,
        invalidFields: fieldValidation.invalidFields,
        message: fieldValidation.message,
      };
    }
  }

  return { ok: true, message: "Permission granted" };
}
