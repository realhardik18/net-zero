"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  Supabase client for storage                                       */
/* ------------------------------------------------------------------ */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Profile = {
  email: string;
  name?: string;
  x?: string;
  github?: string;
  linkedin?: string;
  avatar_link?: string;
  bio?: string;
};

const ACCENT = "#A02DED";
const API = "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const router = useRouter();

  /* cred storage from login */
  const [creds, setCreds] = useState<{ id: string; password: string }>({ id: "", password: "" });
    useEffect(() => {
    const raw = localStorage.getItem("netzero_creds");
    setCreds(raw ? JSON.parse(raw) : { id: "", password: "" });
    }, []);


  /* redirect unauth */
  useEffect(() => {
    if (!creds.id) router.replace("/auth");
  }, [creds.id, router]);

const [profile, setProfile] = useState<Profile>();
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  /* fetch profile */
  useEffect(() => {
    if (!creds.id) return;
    (async () => {
      const res = await fetch(
        `${API}/profile/${creds.id}?password=${encodeURIComponent(creds.password)}`
      );
      if (res.ok) {
        const data = await res.json();
        setProfile((p) => ({ ...p, ...data }));
      }
    })();
  }, [creds]);

  /* handlers */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  /** avatar file upload */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error } = await supabase.storage.from("storage").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setMsg({ type: "error", text: "Upload failed" });
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("storage").getPublicUrl(fileName);

    setProfile((prev) => ({ ...prev, avatar_link: publicUrl }));
    setMsg({ type: "success", text: "Avatar uploaded ✔" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, password: creds.password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.msg || "Update failed");
      }
      setMsg({ type: "success", text: "Profile updated ✔" });
      setEdit(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error" });
    } finally {
      setLoading(false);
    }
  };

  /* helpers */
  const Item = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-200 break-all">{value || "—"}</p>
    </div>
  );

  const Input = ({
    label,
    ...rest
  }: React.ComponentProps<"input"> & { label: string }) => (
    <div>
      <label className="block mb-1 text-sm text-gray-400">{label}</label>
      <input
        {...rest}
        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#18191b] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      />
    </div>
  );

  const Textarea = ({
    label,
    ...rest
  }: React.ComponentProps<"textarea"> & { label: string }) => (
    <div>
      <label className="block mb-1 text-sm text-gray-400">{label}</label>
      <textarea
        {...rest}
        rows={5}
        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#18191b] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 resize-none"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      />
    </div>
  );

  /* JSX */
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111215] p-6">
      <div className="w-full max-w-3xl bg-black/80 backdrop-blur-xl border border-gray-800 shadow-2xl rounded-2xl p-8 md:p-12">
        <h1 className="text-2xl font-extrabold text-white mb-8">Profile</h1>

        {!edit ? (
          /* View */
          <div className="space-y-4 text-gray-300">
            {profile.avatar_link && (
              <Image
                src={profile.avatar_link}
                alt="avatar"
                width={112}
                height={112}
                className="rounded-full object-cover mb-4"
              />
            )}
            <Item label="Name" value={profile.name} />
            <Item label="Email" value={profile.email} />
            <Item label="X" value={profile.x} />
            <Item label="GitHub" value={profile.github} />
            <Item label="LinkedIn" value={profile.linkedin} />
            <Item label="Bio" value={profile.bio} />
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
          </div>
        ) : (
          /* Edit */
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Input label="Name" name="name" value={profile.name} onChange={handleChange} />
              <Input disabled label="Email" name="email" value={profile.email} onChange={handleChange} />
              <Input label="X" name="x" value={profile.x} onChange={handleChange} />
              <Input label="GitHub" name="github" value={profile.github} onChange={handleChange} />
            </div>
            <div className="space-y-4">
              <Input label="LinkedIn" name="linkedin" value={profile.linkedin} onChange={handleChange} />
              {/* Avatar Upload */}
              <div>
                <label className="block mb-1 text-sm text-gray-400">Avatar (image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="block w-full text-sm text-gray-400
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-[#A02DED]/10 file:text-[#A02DED]
                             hover:file:bg-[#A02DED]/20"
                />
                {profile.avatar_link && (
                  <Image
                    src={profile.avatar_link}
                    alt="avatar preview"
                    width={96}
                    height={96}
                    className="rounded-full object-cover mt-3"
                  />
                )}
              </div>
              <Textarea label="Bio" name="bio" value={profile.bio} onChange={handleChange} />
            </div>

            {msg && (
              <div className={`md:col-span-2 text-center font-semibold ${msg.type === "success" ? "text-green-400" : "text-pink-500"}`}>
                {msg.text}
              </div>
            )}

            <div className="md:col-span-2 flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEdit(false);
                  setMsg(null);
                }}
                className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A02DED] to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
