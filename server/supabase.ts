import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://hoicetkovgcidbjyqpqs.supabase.co";

const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_OJsLdRSsEwU6y1XmVgUgeA__i2FmPf_";

export const supabaseServer: SupabaseClient = createClient(supabaseUrl, supabaseKey);
export const SUPABASE_PROJECT_URL = supabaseUrl;
