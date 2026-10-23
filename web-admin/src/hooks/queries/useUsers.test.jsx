import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  getUser: vi.fn(),
  postUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));
vi.mock("@Service/User", () => services);
import { useSaveUser, useUsersQuery } from "./useUsers";

const setup = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
};

describe("queries de usuários", () => {
  it("expõe dados carregados e invalida a lista após salvar", async () => {
    services.getUser.mockResolvedValue({ user: [{ uuid: "1", first_name: "Ana" }], count: 1 });
    services.postUser.mockResolvedValue({ message: "Criado" });
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const query = renderHook(() => useUsersQuery({ page: 0, limit: 10, search: "" }), { wrapper });

    await waitFor(() => expect(query.result.current.isSuccess).toBe(true));
    expect(query.result.current.data.count).toBe(1);

    const mutation = renderHook(() => useSaveUser(), { wrapper });
    await act(() => mutation.result.current.mutateAsync({ user: { first_name: "Maria" } }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["users"] });
  });
});
