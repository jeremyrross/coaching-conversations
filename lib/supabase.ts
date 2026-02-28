import { createClient } from "@supabase/supabase-js";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  created_at: string;
};

export type Session = {
  id: string;
  team_member_id: string;
  date: string;
  notes: string;
  created_at: string;
};

export type ActionItem = {
  id: string;
  session_id: string;
  text: string;
  completed: boolean;
  created_at: string;
};

export type ActionItemWithContext = ActionItem & {
  sessions: {
    date: string;
    team_members: {
      id: string;
      name: string;
    };
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
