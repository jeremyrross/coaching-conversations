'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase, type TeamMember, type Session, type ActionItem } from "@/lib/supabase";

type SessionWithItems = Session & { action_items: ActionItem[] };

export default function TeamMemberPage() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [sessions, setSessions] = useState<SessionWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: memberData }, { data: sessionsData }] = await Promise.all([
      supabase.from("team_members").select("*").eq("id", id).single(),
      supabase
        .from("sessions")
        .select("*, action_items(*)")
        .eq("team_member_id", id)
        .order("date", { ascending: false }),
    ]);
    setMember(memberData);
    setSessions(sessionsData ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function toggleItem(itemId: string, completed: boolean) {
    await supabase.from("action_items").update({ completed }).eq("id", itemId);
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        action_items: s.action_items.map((item) =>
          item.id === itemId ? { ...item, completed } : item
        ),
      }))
    );
  }

  if (loading) return <p className="text-sm text-zinc-400">Loading…</p>;
  if (!member) return <p className="text-sm text-zinc-400">Member not found.</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/team" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            ← Team
          </Link>
          <h1 className="text-base font-semibold mt-1">{member.name}</h1>
          <p className="text-sm text-zinc-400">{member.role}</p>
        </div>
        <Link
          href={`/team/${id}/new-session`}
          className="text-sm bg-zinc-900 text-white rounded px-4 py-2 hover:bg-zinc-700 transition-colors"
        >
          + New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-zinc-400">No sessions yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="border border-zinc-100 rounded-lg p-4 flex flex-col gap-3">
              <p className="text-xs text-zinc-400">
                {new Date(session.date).toLocaleDateString("en-CA", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
              {session.notes && (
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{session.notes}</p>
              )}
              {session.action_items.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Action items</p>
                  {session.action_items.map((item) => (
                    <label key={item.id} className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => toggleItem(item.id, e.target.checked)}
                        className="mt-0.5 accent-zinc-900"
                      />
                      <span className={`text-sm ${item.completed ? "line-through text-zinc-300" : "text-zinc-700"}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
