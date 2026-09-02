import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const authState = { isAuth: false, isInitializing: false, error: null };
vi.mock("../context/auth/AuthContext", () => ({ useAuth: () => authState }));
vi.mock("@/pages/nav/SideNav", () => ({ default: () => <nav>Menu</nav> }));
import ProtectRouter from "./ProtectRouter";

const renderRoutes = () => render(
  <MemoryRouter initialEntries={["/Admin"]}>
    <Routes>
      <Route path="/" element={<ProtectRouter />}><Route path="Admin" element={<div>Dashboard protegido</div>} /></Route>
      <Route index element={<div>Login público</div>} />
    </Routes>
  </MemoryRouter>,
);

describe("ProtectRouter", () => {
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
