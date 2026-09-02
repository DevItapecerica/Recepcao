import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authApi = vi.hoisted(() => ({
  refreshSession: vi.fn(),
  validateToken: vi.fn(),
  logoutSession: vi.fn(),
}));
vi.mock("../../service/Login", () => authApi);

import AuthProvider from "./AuthProvider";
import { useAuth } from "./AuthContext";
import ProfileProvider from "../profile/ProfileProvider";

const token = (expirationSeconds) => {
  const payload = btoa(JSON.stringify({ exp: expirationSeconds }));
  return `Bearer header.${payload}.signature`;
};

const Probe = () => {
  const { isAuth, isInitializing, Logout } = useAuth();
  return <div>
    <span>{isInitializing ? "inicializando" : isAuth ? "autenticado" : "anônimo"}</span>
    <button onClick={() => Logout().catch(() => undefined)}>sair</button>
  </div>;
};

const renderProvider = () => render(<ProfileProvider><AuthProvider><Probe /></AuthProvider></ProfileProvider>);

describe("AuthProvider", () => {
  beforeEach(() => {
    authApi.refreshSession.mockResolvedValue(token(Date.now() / 1000 + 900));
    authApi.validateToken.mockResolvedValue({ user: { uuid: "user-id", name: "Ana", role: "admin" } });
    authApi.logoutSession.mockResolvedValue({});
  });

  it("recupera a sessão pelo refresh quando não há access token", async () => {
    renderProvider();
    expect(screen.getByText("inicializando")).toBeInTheDocument();
    expect(await screen.findByText("autenticado")).toBeInTheDocument();
    expect(authApi.refreshSession).toHaveBeenCalledTimes(1);
    expect(authApi.validateToken).toHaveBeenCalledTimes(1);
  });

  it("fica anônimo quando a recuperação da sessão falha", async () => {
    authApi.refreshSession.mockRejectedValue(new Error("refresh inválido"));
    renderProvider();
    expect(await screen.findByText("anônimo")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("limpa a sessão mesmo quando o logout remoto falha", async () => {
    localStorage.setItem("token", token(Date.now() / 1000 + 900));
    authApi.logoutSession.mockRejectedValue(new Error("offline"));
    renderProvider();
    await screen.findByText("autenticado");

    fireEvent.click(screen.getByText("sair"));

    await waitFor(() => expect(screen.getByText("anônimo")).toBeInTheDocument());
    expect(localStorage.getItem("token")).toBeNull();
  });
});
