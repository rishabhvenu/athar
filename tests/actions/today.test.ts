import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildSupabaseMock,
  createQueryChain,
  type SupabaseChain,
} from "../helpers/supabase-mock";

const actionMocks = vi.hoisted(() => ({
  currentSupabase: undefined as unknown,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => actionMocks.currentSupabase),
}));

import { addReflection, getTodayCard } from "@/app/actions/today";

describe("today actions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when there is no authenticated user", async () => {
    actionMocks.currentSupabase = buildSupabaseMock({ user: null });

    await expect(getTodayCard()).resolves.toBeNull();
  });

  it("fetches today's card and reflections", async () => {
    const card = {
      id: "card-1",
      memory_id: "memory-1",
      memory: { id: "memory-1", surah: 2, ayah: 286 },
    };
    const reflections = [{ id: "reflection-1", body: "A thought" }];
    const dailyCards = createQueryChain({ data: card, error: null });
    const reflectionsChain = createQueryChain(
      { data: null, error: null },
      { data: reflections, error: null }
    );
    actionMocks.currentSupabase = buildSupabaseMock({
      queries: {
        daily_cards: dailyCards as unknown as SupabaseChain<unknown>,
        reflections: reflectionsChain as unknown as SupabaseChain<unknown>,
      },
    });

    await expect(getTodayCard()).resolves.toEqual({ card, reflections });
    expect(dailyCards.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(dailyCards.eq).toHaveBeenCalledWith("card_date", "2026-04-27");
    expect(reflectionsChain.eq).toHaveBeenCalledWith("memory_id", "memory-1");
    expect(reflectionsChain.order).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("returns null when today's card query misses", async () => {
    actionMocks.currentSupabase = buildSupabaseMock({
      queries: {
        daily_cards: createQueryChain({
          data: null,
          error: new Error("not found"),
        }) as unknown as SupabaseChain<unknown>,
      },
    });

    await expect(getTodayCard()).resolves.toBeNull();
  });

  it("adds a reflection for the authenticated user", async () => {
    const reflection = { id: "reflection-1", body: "new thought" };
    const reflections = createQueryChain({ data: reflection, error: null });
    actionMocks.currentSupabase = buildSupabaseMock({
      queries: {
        reflections: reflections as unknown as SupabaseChain<unknown>,
      },
    });

    await expect(addReflection("memory-1", "new thought")).resolves.toEqual(reflection);
    expect(reflections.insert).toHaveBeenCalledWith({
      memory_id: "memory-1",
      user_id: "user-1",
      body: "new thought",
    });
  });

  it("throws when adding a reflection without an authenticated user", async () => {
    actionMocks.currentSupabase = buildSupabaseMock({ user: null });

    await expect(addReflection("memory-1", "new thought")).rejects.toThrow("Unauthorized");
  });
});
