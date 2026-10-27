import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/config";

beforeEach(() => {
  for (const key of ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]) {
    vi.stubEnv(key, "");
  }
});
afterEach(() => vi.unstubAllEnvs());

it("supports the new server names without any NEXT_PUBLIC variables", () => {
  vi.stubEnv("SUPABASE_URL", " https://demo.supabase.co ");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", " sb_publishable_test ");
  expect(getSupabaseUrl()).toBe("https://demo.supabase.co");
  expect(getSupabasePublishableKey()).toBe("sb_publishable_test");
});

it("keeps legacy deployments working and gives the new names priority", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://legacy.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "legacy-key");
  expect(getSupabaseUrl()).toBe("https://legacy.supabase.co");
  expect(getSupabasePublishableKey()).toBe("legacy-key");
  vi.stubEnv("SUPABASE_URL", "https://demo.supabase.co");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "new-key");
  expect(getSupabaseUrl()).toBe("https://demo.supabase.co");
  expect(getSupabasePublishableKey()).toBe("new-key");
});

it("returns no configuration for missing or whitespace-only variables", () => {
  vi.stubEnv("SUPABASE_URL", "  ");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "  ");
  expect(getSupabaseUrl()).toBeUndefined();
  expect(getSupabasePublishableKey()).toBeUndefined();
});
