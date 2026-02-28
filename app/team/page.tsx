'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type TeamMember } from "@/lib/supabase";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("name");
    setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    setAdding(true);
    await supabase.from("team_members").insert({ name: name.trim(), role: role.trim() });
    setName("");
    setRole("");
    setShowForm(false);
    setAdding(false);
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Team</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add member"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addMember} className="flex flex-col gap-3 p-4 border border-zinc-100 rounded-lg">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
          <input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-zinc-900 text-white text-sm rounded px-4 py-2 hover:bg-zinc-700 transition-colors disabled:opacity-50 self-start"
          >
            {adding ? "Adding…" : "Add member"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-zinc-400">No team members yet. Add one above.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/team/${m.id}`}
              className="flex items-center justify-between py-3 hover:text-zinc-600 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-zinc-400">{m.role}</p>
              </div>
              <span className="text-zinc-300 group-hover:text-zinc-400 transition-colors">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
