import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = { isAuth: false, isInitializing: false, error: null };
vi.mock("../context/auth/AuthContext", () => ({ useAuth: () => authState }));
const profileState = { user: null };
vi.mock("../context/profile/ProfileContext", () => ({ useProfile: () => profileState }));
import ProtectRouter from "./ProtectRouter";

const renderRoutes = (path = "/Admin") => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/" element={<ProtectRouter />}>
        <Route path="Admin" element={<div>Dashboard protegido</div>} />
        <Route path="Admin/Configurations" element={<div>Configurações protegidas</div>} />
        <Route path="Admin/:page" element={<div>Página restrita</div>} />
        <Route path="Singout" element={<div>Sair da conta</div>} />
      </Route>
      <Route index element={<div>Login público</div>} />
    </Routes>
  </MemoryRouter>,
);

describe("ProtectRouter", () => {
  beforeEach(() => {
    Object.assign(authState, { isAuth: false, isInitializing: false, error: null });
    profileState.user = { role: "user" };
  });

  it.each(["Visitors", "Users", "Attendances"])("bloqueia acesso direto do viewer a %s", (page) => {
    Object.assign(authState, { isAuth: true, isInitializing: false });
    profileState.user = { role: "viewer" };
    renderRoutes(`/Admin/${page}`);
    expect(screen.getByText("Dashboard protegido")).toBeInTheDocument();
    expect(screen.queryByText("Página restrita")).not.toBeInTheDocument();
  });

  it.each([
    ["/Admin", "Dashboard protegido"],
    ["/Admin/Visits", "Página restrita"],
    ["/admin/visits/", "Página restrita"],
    ["/Admin/Configurations", "Configurações protegidas"],
    ["/Singout", "Sair da conta"],
  ])("permite ao viewer acessar %s", (path, content) => {
    Object.assign(authState, { isAuth: true, isInitializing: false });
    profileState.user = { role: "viewer" };
    renderRoutes(path);
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it("redireciona visitante anônimo", () => {
    Object.assign(authState, { isAuth: false, isInitializing: false });
    renderRoutes();
    expect(screen.getByText("Login público")).toBeInTheDocument();
  });

  it("renderiza rota para usuário autenticado", () => {
    Object.assign(authState, { isAuth: true, isInitializing: false });
    renderRoutes();
    expect(screen.getByText("Dashboard protegido")).toBeInTheDocument();
  });
});
