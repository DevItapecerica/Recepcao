import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: { username: "ana.silva", role: "viewer" },
  alterPassword: vi.fn(),
  Logout: vi.fn(),
  showToast: vi.fn(),
}));
vi.mock("@Context/profile/ProfileContext", () => ({ useProfile: () => ({ user: state.user }) }));
vi.mock("@Context/toast/ToastContext", () => ({ useToast: () => ({ showToast: state.showToast }) }));
vi.mock("@Context/auth/AuthContext", () => ({ useAuth: () => ({ Logout: state.Logout }) }));
vi.mock("../../../service/Login", () => ({ alterPassword: state.alterPassword }));
import Config from "./Config";

describe("alteração da própria senha em Configurações", () => {
  beforeEach(() => {
    state.alterPassword.mockReset().mockResolvedValue({ message: "Senha alterada com sucesso" });
    state.Logout.mockReset().mockResolvedValue(undefined);
    state.showToast.mockReset();
  });

  it.each(["viewer", "user", "recepcionist", "admin", "superadmin"])(
    "permite que %s preencha e envie a alteração de senha",
    async (role) => {
      state.user = { username: "ana.silva", role };
      render(<MemoryRouter><Config /></MemoryRouter>);
      expect(screen.getByLabelText("Usuário")).toBeDisabled();
      for (const [label, value] of [
        ["Senha atual", "SenhaAntiga1!"],
        ["Nova senha", "SenhaNovaForte2@"],
        ["Confirmar nova senha", "SenhaNovaForte2@"],
      ]) {
        const input = screen.getByLabelText(label);
        expect(input).toBeEnabled();
        fireEvent.change(input, { target: { value } });
      }
      const submit = screen.getByRole("button", { name: "Alterar senha" });
      expect(submit).toBeEnabled();
      fireEvent.click(submit);
      await waitFor(() => expect(state.alterPassword).toHaveBeenCalledWith(expect.objectContaining({
        old_password: "SenhaAntiga1!",
        new_password: "SenhaNovaForte2@",
      })));
      await waitFor(() => expect(state.Logout).toHaveBeenCalledOnce());
    },
  );
});
