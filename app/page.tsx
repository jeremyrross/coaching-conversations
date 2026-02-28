'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type ActionItemWithContext } from "@/lib/supabase";

export default function Dashboard() {
  const [items, setItems] = useState<ActionItemWithContext[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("action_items")
      .select("*, sessions(date, team_members(id, name))")
      .eq("completed", false)
      .order("created_at", { ascending: true });
    setItems((data as ActionItemWithContext[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleItem(id: string, completed: boolean) {
    await supabase.from("action_items").update({ completed }).eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  // Group by team member
  const grouped = items.reduce<Record<string, { name: string; id: string; items: ActionItemWithContext[] }>>(
    (acc, item) => {
      const memberId = item.sessions.team_members.id;
      const memberName = item.sessions.team_members.name;
      if (!acc[memberId]) acc[memberId] = { name: memberName, id: memberId, items: [] };
      acc[memberId].items.push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-base font-semibold">Open action items</h1>

      {loading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">No open action items. Nice work.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.values(grouped).map(({ name, id, items: memberItems }) => (
            <div key={id} className="flex flex-col gap-2">
              <Link
                href={`/team/${id}`}
                className="text-xs font-medium text-zinc-400 uppercase tracking-wide hover:text-zinc-600 transition-colors"
              >
                {name}
              </Link>
              {memberItems.map((item) => (
                <label key={item.id} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => toggleItem(item.id, e.target.checked)}
                    className="mt-0.5 accent-zinc-900"
                  />
                  <div>
                    <span className="text-sm text-zinc-700">{item.text}</span>
                    <p className="text-xs text-zinc-300">
                      {new Date(item.sessions.date).toLocaleDateString("en-CA", {
                        month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
