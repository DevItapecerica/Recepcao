import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const state = { isAuth: true, user: { name: "Ana", role: "user" } };
vi.mock("@/context/auth/AuthContext", () => ({ useAuth: () => ({ isAuth: state.isAuth }) }));
vi.mock("@/context/profile/ProfileContext", () => ({ useProfile: () => ({ user: state.user, image: null }) }));
vi.mock("@/context/theme/ThemeContext", () => ({ useThemeContext: () => ({ toggleTheme: vi.fn() }) }));
import Nav from "./Nav";

describe("topbar", () => {
  it("exibe painel, visitas e configurações para viewer", () => {
    state.user = { name: "Ana", role: "viewer" };
    render(<MemoryRouter initialEntries={["/Admin"]}><Nav /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Painel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Visitas" })).toHaveAttribute("href", "/Admin/Visits");
    expect(screen.getByRole("link", { name: "Configurações" })).toBeInTheDocument();
    for (const name of ["Visitantes", "Usuários", "Atendimentos"]) {
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
    }
  });

  it("respeita permissões e abre o menu móvel", () => {
    state.user = { name: "Ana", role: "user" };
    render(<MemoryRouter initialEntries={["/Admin"]}><Nav /></MemoryRouter>);
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Abrir menu"));
    expect(screen.getByRole("navigation", { name: "Navegação móvel" })).toBeInTheDocument();
  });
});
