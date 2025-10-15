import { supabase } from "@/shared/utils/supabase/client";
import type { Scan } from "@/shared/utils/storage";
import type { AnalysisResult } from "@/shared/utils/analyze";

/**
 * Inserts a scan row and returns its id. Defaults to saved=false so users can save later.
 */
export async function createScan(params: {
  source: "image" | "text";
  image_url?: string | null;
  raw_text: string;
  cleaned_ingredients: string[];
  analysis: AnalysisResult;
  saved?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") } as const;
  const { data, error } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      source: params.source,
      image_url: params.image_url ?? null,
      raw_text: params.raw_text,
      cleaned_ingredients: params.cleaned_ingredients,
      analysis: params.analysis,
      saved: params.saved ?? false,
    })
    .select("id")
    .single();
  return { id: data?.id ?? null, error } as const;
}

/** Marks an existing scan as saved. */
export async function markScanSaved(scanId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") } as const;
  const { error } = await supabase
    .from("scans")
    .update({ saved: true })
    .eq("id", scanId)
    .eq("user_id", user.id);
  return { error } as const;
}

/** Backwards-compatible helper that inserts a saved scan immediately. Returns id. */
export async function saveScanToSupabase(scan: Scan) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated"), id: null } as const;
  const { data, error } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      source: scan.source,
      image_url: scan.image_path,
      raw_text: scan.raw_text,
      cleaned_ingredients: scan.cleaned_ingredients,
      analysis: scan.analysis,
      saved: true,
    })
    .select("id")
    .single();
  return { error, id: data?.id ?? null } as const;
}

/** Add a chat message (user/assistant/system). Optionally associate with a scan. */
export async function addChatMessage(params: {
  role: "user" | "assistant" | "system";
  content: string;
  scan_id?: string | null;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated"), id: null } as const;
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id: user.id,
      role: params.role,
      content: params.content,
      scan_id: params.scan_id ?? null,
    })
    .select("id")
    .single();
  return { error, id: data?.id ?? null } as const;
}

/** Fetch chat history for the current user. If scanId provided, filter by that scan. */
export async function fetchChatHistory(params?: { scan_id?: string | null; limit?: number }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated"), rows: [] as Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; created_at: string; scan_id: string | null }> } as const;
  let query = supabase
    .from("chat_messages")
    .select("id, role, content, created_at, scan_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (params?.scan_id) query = query.eq("scan_id", params.scan_id);
  if (params?.limit) query = query.limit(params.limit);
  const { data, error } = await query;
  return { error, rows: data ?? [] } as const;
}

/** Fetch the most recent scan for the user. */
export async function fetchLatestScan() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated"), row: null } as const;
  const { data, error } = await supabase
    .from("scans")
    .select("id, raw_text, analysis, cleaned_ingredients, created_at, saved, source, image_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return { error, row: data ?? null } as const;
}

