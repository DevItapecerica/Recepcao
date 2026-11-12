import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  getDashboard: vi.fn(), getVisits: vi.fn(), getVisitsByVisitorId: vi.fn(), addVisits: vi.fn(),
}));
vi.mock("@Service/Visits", () => services);
import { useDashboardQuery } from "./useVisits";

const wrapper = ({ children }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("query do dashboard", () => {
  it("aceita um dashboard vazio", async () => {
    services.getDashboard.mockResolvedValue({ dashboard: { totalVisits: 0, ranking: [] } });
    const { result } = renderHook(() => useDashboardQuery({ dateFrom: "2026-09-01", dateTo: "2026-09-30", limit: 5 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.dashboard.ranking).toEqual([]);
  });

  it("expõe falhas da API", async () => {
    services.getDashboard.mockRejectedValue(new Error("API indisponível"));
    const { result } = renderHook(() => useDashboardQuery({ dateFrom: "2026-09-01", dateTo: "2026-09-30", limit: 5 }), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe("API indisponível");
  });
});
