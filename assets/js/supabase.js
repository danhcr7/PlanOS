import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://gmuabqlzqutfqtwzvgif.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_1P6mAGDCEBaCiSba3iJyKg_Us48xGEj";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const TABLE_NAME = "planos_data";

const DOC_ID = "main";

export async function saveDataToCloud(data) {

  const payload = {
    id: DOC_ID,
    data,
    updated_at:
      new Date().toISOString(),
  };

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function loadDataFromCloud() {

  const { data, error } =
    await supabase
      .from(TABLE_NAME)
      .select("data")
      .eq("id", DOC_ID)
      .maybeSingle();

  if (error) {
    console.error(error);
    throw error;
  }

  return data?.data || null;
}