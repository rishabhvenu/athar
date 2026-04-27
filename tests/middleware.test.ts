import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const middlewareMocks = vi.hoisted(() => ({
  user: null as { id: string } | null,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: middlewareMocks.user } })),
    },
  })),
}));

import { middleware } from "@/middleware";

function createRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

describe("middleware", () => {
  it.each(["/today", "/capture", "/map", "/settings/profile"])(
    "redirects protected route %s to login when unauthenticated",
    async (pathname) => {
      middlewareMocks.user = null;

      const response = await middleware(createRequest(pathname));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    }
  );

  it.each(["/", "/login", "/read/2/286", "/auth/callback"])(
    "allows public route %s while unauthenticated",
    async (pathname) => {
      middlewareMocks.user = null;

      const response = await middleware(createRequest(pathname));

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  );

  it("allows authenticated users through protected routes", async () => {
    middlewareMocks.user = { id: "user-1" };

    const response = await middleware(createRequest("/today"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
