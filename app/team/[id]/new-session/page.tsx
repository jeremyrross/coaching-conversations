'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, type TeamMember } from "@/lib/supabase";

export default function NewSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("team_members").select("*").eq("id", id).single()
      .then(({ data }) => setMember(data));
  }, [id]);

  function updateItem(index: number, value: string) {
    setActionItems((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function addItem() {
    setActionItems((prev) => [...prev, ""]);
  }

  function removeItem(index: number) {
    setActionItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data: session } = await supabase
      .from("sessions")
      .insert({ team_member_id: id, date, notes: notes.trim() })
      .select()
      .single();

    if (session) {
      const items = actionItems.map((t) => t.trim()).filter(Boolean);
      if (items.length > 0) {
        await supabase.from("action_items").insert(
          items.map((text) => ({ session_id: session.id, text }))
        );
      }
    }

    router.push(`/team/${id}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href={`/team/${id}`} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          ← {member?.name ?? "Back"}
        </Link>
        <h1 className="text-base font-semibold mt-1">New session</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400 w-48"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you discuss?"
            rows={5}
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400 resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Action items</label>
          {actionItems.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`Action item ${i + 1}`}
                className="flex-1 border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addItem(); }
                }}
              />
              {actionItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-zinc-300 hover:text-zinc-500 transition-colors px-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors self-start"
          >
            + Add item
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-zinc-900 text-white text-sm rounded px-4 py-2 hover:bg-zinc-700 transition-colors disabled:opacity-50 self-start"
        >
          {saving ? "Saving…" : "Save session"}
        </button>
      </form>
    </div>
  );
}
