import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import API, { setAccessToken } from "./API";
import { server } from "../test/server";

describe("interceptor de autenticação", () => {
  afterEach(() => setAccessToken(null));
  it("compartilha um único refresh entre respostas 401 simultâneas", async () => {
    let refreshCount = 0;
    server.use(
      http.get("*/api/v1/protected", ({ request }) => request.headers.get("authorization") === "Bearer renewed" ? HttpResponse.json({ ok: true }) : HttpResponse.json({ message: "Unauthorized" }, { status: 401 })),
      http.post("*/api/v1/login/refresh", async () => {
        refreshCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return HttpResponse.json({ token: "Bearer renewed" });
      }),
    );
    setAccessToken("Bearer expired");

    const responses = await Promise.all([API.get("/protected"), API.get("/protected")]);

    expect(responses.every(({ data }) => data.ok)).toBe(true);
    expect(refreshCount).toBe(1);
    expect(localStorage.getItem("token")).toBeNull();
  });
});
