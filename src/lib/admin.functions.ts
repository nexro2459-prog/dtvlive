// Admin / profile server functions.
// Public reads use the publishable key; privileged writes use the service-role
// client loaded inside handlers (never at module scope, since this file ships
// to the client bundle as RPC stubs).

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

// ---------- types shared with the client ----------
export interface SiteProfile {
  display_name: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  badges: string[];
  social_links: Record<string, string>;
}

const ProfileSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(120).default(""),
  bio: z.string().trim().max(1000).default(""),
  avatar_url: z
    .string()
    .trim()
    .max(1000)
    .url()
    .or(z.literal(""))
    .nullable()
    .transform((v) => (v ? v : null)),
  badges: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  social_links: z
    .record(z.string().min(1).max(30), z.string().trim().url().max(500))
    .default({}),
});

// ---------- public: read profile ----------
export const getSiteProfile = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteProfile> => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("site_profile")
      .select("display_name, tagline, bio, avatar_url, badges, social_links")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      display_name: data?.display_name ?? "Abu Talib Fahim",
      tagline: data?.tagline ?? "Owner of Dtv",
      bio: data?.bio ?? "",
      avatar_url: data?.avatar_url ?? null,
      badges: (data?.badges as string[] | null) ?? [],
      social_links: (data?.social_links as Record<string, string> | null) ?? {},
    };
  },
);

// ---------- rate-limit helper (called inside handlers) ----------
async function rateLimited(supabaseAdmin: any, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("attempted_at", since);
  return (count ?? 0) >= 8;
}

function clientIp(): string {
  return (
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
    getRequestHeader("x-real-ip") ??
    "unknown"
  );
}

// ---------- admin status (does a password exist?) ----------
export const getAdminStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ initialized: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("admin_credentials")
      .select("password_hash")
      .eq("id", 1)
      .maybeSingle();
    return { initialized: !!data?.password_hash };
  },
);

// ---------- one-time: generate & set admin password ----------
export const initAdminPassword = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ password: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const crypto = await import("./admin-crypto.server");

    const { data: existing } = await supabaseAdmin
      .from("admin_credentials")
      .select("password_hash")
      .eq("id", 1)
      .maybeSingle();
    if (existing?.password_hash) {
      throw new Error("Admin password is already set. Reset it from the database to regenerate.");
    }

    const password = crypto.randomPassword(32);
    const salt = crypto.randomHex(16);
    const hash = await crypto.hashPassword(password, salt);

    const { error } = await supabaseAdmin
      .from("admin_credentials")
      .update({ password_hash: hash, password_salt: salt })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    return { password };
  },
);

// ---------- login ----------
export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) =>
    z.object({ password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ token: string; expiresAt: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const crypto = await import("./admin-crypto.server");
    const ip = clientIp();

    if (await rateLimited(supabaseAdmin, ip)) {
      throw new Error("Too many attempts. Please wait a few minutes and try again.");
    }

    const { data: cred } = await supabaseAdmin
      .from("admin_credentials")
      .select("password_hash, password_salt")
      .eq("id", 1)
      .maybeSingle();

    const recordAttempt = (success: boolean) =>
      supabaseAdmin.from("admin_login_attempts").insert({ ip, success });

    if (!cred?.password_hash || !cred?.password_salt) {
      await recordAttempt(false);
      throw new Error("Admin password not initialized.");
    }

    const computed = await crypto.hashPassword(data.password, cred.password_salt);
    if (!crypto.timingSafeEqualHex(computed, cred.password_hash)) {
      await recordAttempt(false);
      throw new Error("Incorrect password.");
    }

    const token = crypto.randomHex(32);
    const tokenHash = await crypto.sha256Hex(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600_000).toISOString();

    const { error } = await supabaseAdmin
      .from("admin_credentials")
      .update({ session_token: tokenHash, session_expires: expiresAt })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    await recordAttempt(true);
    return { token, expiresAt };
  });

// ---------- verify token (used on /customize page reload) ----------
async function verifyToken(token: string): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const crypto = await import("./admin-crypto.server");
  const { data } = await supabaseAdmin
    .from("admin_credentials")
    .select("session_token, session_expires")
    .eq("id", 1)
    .maybeSingle();
  if (!data?.session_token || !data?.session_expires) return false;
  if (new Date(data.session_expires).getTime() < Date.now()) return false;
  const hash = await crypto.sha256Hex(token);
  return crypto.timingSafeEqualHex(hash, data.session_token);
}

export const verifyAdminToken = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) =>
    z.object({ token: z.string().min(10).max(200) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ valid: boolean }> => ({
    valid: await verifyToken(data.token),
  }));

// ---------- logout ----------
export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("admin_credentials")
    .update({ session_token: null, session_expires: null })
    .eq("id", 1);
  return { ok: true };
});

// ---------- protected: update profile ----------
export const updateSiteProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; profile: unknown }) =>
    z
      .object({
        token: z.string().min(10).max(200),
        profile: ProfileSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<SiteProfile> => {
    if (!(await verifyToken(data.token))) {
      throw new Error("Unauthorized. Please log in again.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("site_profile")
      .update({
        display_name: data.profile.display_name,
        tagline: data.profile.tagline,
        bio: data.profile.bio,
        avatar_url: data.profile.avatar_url,
        badges: data.profile.badges,
        social_links: data.profile.social_links,
      })
      .eq("id", 1)
      .select("display_name, tagline, bio, avatar_url, badges, social_links")
      .single();
    if (error) throw new Error(error.message);
    return {
      display_name: row.display_name,
      tagline: row.tagline,
      bio: row.bio,
      avatar_url: row.avatar_url,
      badges: (row.badges as string[]) ?? [],
      social_links: (row.social_links as Record<string, string>) ?? {},
    };
  });

// =====================================================
// Channel stream overrides — admin-managed source swaps
// =====================================================

export interface ChannelOverride {
  channel_id: string;
  streams: string[];
  type: "hls" | "iframe";
  embed_url: string | null;
  updated_at: string;
}

// Public: list all overrides so the player can merge them into the catalog.
export const listChannelOverrides = createServerFn({ method: "GET" }).handler(
  async (): Promise<ChannelOverride[]> => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("channel_stream_overrides")
      .select("channel_id, streams, type, embed_url, updated_at");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      channel_id: r.channel_id,
      streams: Array.isArray(r.streams) ? (r.streams as string[]) : [],
      type: (r.type as "hls" | "iframe") ?? "hls",
      embed_url: r.embed_url ?? null,
      updated_at: r.updated_at,
    }));
  },
);

const OverrideInput = z.object({
  channel_id: z.string().trim().min(1).max(120),
  streams: z.array(z.string().trim().url().max(1000)).max(50).default([]),
  type: z.enum(["hls", "iframe"]).default("hls"),
  embed_url: z
    .string()
    .trim()
    .max(1000)
    .url()
    .or(z.literal(""))
    .nullable()
    .transform((v) => (v ? v : null))
    .optional(),
});

// Admin: upsert an override for a channel.
export const upsertChannelOverride = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; override: unknown }) =>
    z.object({ token: z.string().min(10).max(200), override: OverrideInput }).parse(d),
  )
  .handler(async ({ data }): Promise<ChannelOverride> => {
    if (!(await verifyToken(data.token))) throw new Error("Unauthorized.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("channel_stream_overrides")
      .upsert(
        {
          channel_id: data.override.channel_id,
          streams: data.override.streams,
          type: data.override.type,
          embed_url: data.override.embed_url ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "channel_id" },
      )
      .select("channel_id, streams, type, embed_url, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return {
      channel_id: row.channel_id,
      streams: (row.streams as string[]) ?? [],
      type: (row.type as "hls" | "iframe") ?? "hls",
      embed_url: row.embed_url ?? null,
      updated_at: row.updated_at,
    };
  });

// Admin: remove an override, restoring the default catalog streams.
export const deleteChannelOverride = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; channel_id: string }) =>
    z
      .object({
        token: z.string().min(10).max(200),
        channel_id: z.string().trim().min(1).max(120),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true }> => {
    if (!(await verifyToken(data.token))) throw new Error("Unauthorized.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("channel_stream_overrides")
      .delete()
      .eq("channel_id", data.channel_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
