import { supabase } from "../lib/supabaseClient";

export async function CheckSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    return true;
  }

  return false;
}
