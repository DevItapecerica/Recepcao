import { AppError } from "../types/errorTypes.js";

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,128}$/;

export const assertStrongPassword = (password: string): void => {
  if (!STRONG_PASSWORD.test(password)) {
    throw new AppError(
      "A senha deve ter entre 10 e 128 caracteres e incluir letra maiúscula, minúscula, número e símbolo",
      400,
      "WEAK_PASSWORD",
    );
  }
};
