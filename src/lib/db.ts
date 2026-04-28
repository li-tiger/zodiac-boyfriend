import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

class DatabaseClient {
  private supabase;

  constructor() {
    this.supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  }

  async getUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("user_id")?.value || null;
  }

  from(table: string) {
    return this.supabase.from(table);
  }
}

export async function createClient() {
  const client = new DatabaseClient();
  return {
    from: (table: string) => client.from(table),
    getUserId: () => client.getUserId(),
  };
}
