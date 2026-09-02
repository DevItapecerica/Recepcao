import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const state = { isAuth: true, user: { name: "Ana", role: "user" } };
vi.mock("@/context/auth/AuthContext", () => ({ useAuth: () => ({ isAuth: state.isAuth }) }));
vi.mock("@/context/profile/ProfileContext", () => ({ useProfile: () => ({ user: state.user, image: null }) }));
vi.mock("@/context/theme/ThemeContext", () => ({ useThemeContext: () => ({ toggleTheme: vi.fn() }) }));
import Nav from "./Nav";

describe("topbar", () => {
  it("respeita permissões e abre o menu móvel", () => {
    render(<MemoryRouter initialEntries={["/Admin"]}><Nav /></MemoryRouter>);
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Abrir menu"));
    expect(screen.getByRole("navigation", { name: "Navegação móvel" })).toBeInTheDocument();
  });
});
