import { cpf } from "cpf-cnpj-validator";
import CPFResult from "../types/validatorCPFTypes.js";
import { AppError } from "../types/errorTypes.js";

const validatorCPF = (data: string): CPFResult => {
  if (!cpf.isValid(data)) {
    throw new AppError("Invalid CPF", 400);
  }

  return { ok: true, message: "Valid CPF" };
};

export default validatorCPF;
