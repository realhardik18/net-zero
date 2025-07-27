/* app/dashboard/profile/page.tsx */
"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

/* ─────────────  ENV + SUPABASE  ───────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ─────────────  TYPES  ───────────── */
type Creds = { email: string; password: string };

interface Profile {
  id: string;
  email: string;
  name: string | null;
  x: string | null;
  github: string | null;
  linkedin: string | null;
  avatar_link: string | null;
  bio: string | null;
}

/* ─────────────  CONSTANTS  ───────────── */
const API = "http://localhost:8000";
const ACCENT = "#A02DED";

/* ─────────────  COMPONENT  ───────────── */
export default function ProfilePage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  /* —————————————————  STATE  ————————————————— */
  const [hydrated, setHydrated] = useState(false);
  const [creds, setCreds] = useState<Creds>({ email: "", password: "" });
  const [profile, setProfile] = useState<Profile | null>(null);

  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  /* —————————————————  HYDRATE CREDS  ————————————————— */
  useEffect(() => {
    const raw = localStorage.getItem("netzero_creds");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Creds;
        if (parsed.email && parsed.password) setCreds(parsed);
      } catch {
        localStorage.removeItem("netzero_creds");
      }
    }
    setHydrated(true);
  }, []);

  /* —————————————————  AUTH GUARD  ————————————————— */
  useEffect(() => {
    if (!hydrated) return;
    if (!creds.email) router.replace("/auth");
  }, [hydrated, creds.email, router]);

  /* —————————————————  FETCH PROFILE  ————————————————— */
  useEffect(() => {
    if (!creds.email) return;
    (async () => {
      try {
        const res = await fetch(
          `${API}/profile/${encodeURIComponent(creds.email)}?password=${encodeURIComponent(
            creds.password
          )}`
        );
        if (!res.ok) throw new Error("auth");
        const data: Profile = await res.json();
        setProfile(data);
      } catch {
        localStorage.removeItem("netzero_creds");
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    })();
  }, [creds, router]);

  /* —————————————————  HANDLERS  ————————————————— */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);

    try {
      const filename = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("storage").upload(filename, file);
      if (error) throw error;

      const {
        data: { publicUrl }
      } = supabase.storage.from("storage").getPublicUrl(filename);

      setUploadedAvatar(publicUrl);
      setMsg({ kind: "success", text: "Avatar uploaded." });
    } catch {
      setMsg({ kind: "error", text: "Avatar upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !formRef.current) return;
    setSaving(true);
    setMsg(null);

    const formData = new FormData(formRef.current);
    const updatedProfile = {
      ...profile,
      name: formData.get("name") as string,
      x: formData.get("x") as string,
      github: formData.get("github") as string,
      linkedin: formData.get("linkedin") as string,
      bio: formData.get("bio") as string,
      avatar_link: uploadedAvatar || profile.avatar_link,
      password: creds.password
    };

    try {
      const res = await fetch(`${API}/profile/${encodeURIComponent(creds.email)}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      });
      if (!res.ok) throw await res.json();
      
      setProfile({ ...updatedProfile });
      setMsg({ kind: "success", text: "Profile updated." });
      setEdit(false);
      setUploadedAvatar(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const text =
        typeof err?.detail === "string"
          ? err.detail
          : typeof err?.msg === "string"
          ? err.msg
          : "Update failed";
      setMsg({ kind: "error", text });
    } finally {
      setSaving(false);
    }
  };

  /* —————————————————  UI HELPERS  ————————————————— */
  const Field = ({ label, value }: { label: string; value: string | null }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-200 break-all">{value || "—"}</p>
    </div>
  );

  const Input = ({ label, ...rest }: React.ComponentProps<"input"> & { label: string }) => (
    <div>
      <label className="block mb-1 text-sm text-gray-400">{label}</label>
      <input
        {...rest}
        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#18191b] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      />
    </div>
  );

  const TextArea = ({ label, ...rest }: React.ComponentProps<"textarea"> & { label: string }) => (
    <div>
      <label className="block mb-1 text-sm text-gray-400">{label}</label>
      <textarea
        {...rest}
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#18191b] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 resize-none"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      />
    </div>
  );

  /* —————————————————  RENDER  ————————————————— */
  if (!hydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        Loading&hellip;
      </div>
    );
  }

  if (!profile) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111215] p-6">
      <div className="w-full max-w-3xl bg-black/80 border border-gray-800 backdrop-blur-xl shadow-2xl rounded-2xl p-8 md:p-12">
        <h1 className="text-2xl font-extrabold text-white mb-8">Profile</h1>

        {/* ========== VIEW MODE ========== */}
        {!edit ? (
          <>
            {profile.avatar_link && (
              <Image
                src={profile.avatar_link}
                alt="avatar"
                width={112}
                height={112}
                className="rounded-full object-cover mb-4"
              />
            )}
            <div className="space-y-4 text-gray-300">
              <Field label="Name" value={profile.name} />
              <Field label="Email" value={profile.email} />
              <Field label="X" value={profile.x} />
              <Field label="GitHub" value={profile.github} />
              <Field label="LinkedIn" value={profile.linkedin} />
              <Field label="Bio" value={profile.bio} />
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={() => setEdit(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A02DED] to-blue-600 text-white font-semibold hover:opacity-90 transition"
              >
                Edit Profile
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-400 transition"
              >
                Back
              </button>
            </div>
          </>
        ) : (
          /* ========== EDIT MODE ========== */
          <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            {/* COLUMN 1 */}
            <div className="space-y-4">
              <Input label="Name" name="name" defaultValue={profile.name || ""} />
              <Input disabled label="Email" name="email" defaultValue={profile.email} />
              <Input label="X" name="x" defaultValue={profile.x || ""} />
              <Input label="GitHub" name="github" defaultValue={profile.github || ""} />
              <Input label="LinkedIn" name="linkedin" defaultValue={profile.linkedin || ""} />
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-4">
              {/* Avatar upload */}
              <div>
                <label className="block mb-1 text-sm text-gray-400">
                  Avatar {uploading && "(uploading…)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#A02DED]/10 file:text-[#A02DED]
                    hover:file:bg-[#A02DED]/20 disabled:opacity-50"
                />
                {(uploadedAvatar || profile.avatar_link) && (
                  <Image
                    src={uploadedAvatar || profile.avatar_link!}
                    alt="avatar preview"
                    width={96}
                    height={96}
                    className="rounded-full object-cover mt-3"
                  />
                )}
              </div>

              <TextArea label="Bio" name="bio" defaultValue={profile.bio || ""} />
            </div>

            {/* Status + actions */}
            {msg && (
              <div
                className={`md:col-span-2 text-center font-semibold ${
                  msg.kind === "success" ? "text-green-400" : "text-pink-500"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="md:col-span-2 flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEdit(false);
                  setUploadedAvatar(null);
                  setMsg(null);
                }}
                className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A02DED] to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}