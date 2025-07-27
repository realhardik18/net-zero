"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup" && !form.name) {
      setError("Name is required.");
      setLoading(false);
      return;
    }
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        mode === "login"
          ? "http://localhost:8000/login"
          : "http://localhost:8000/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { email: form.email, password: form.password, name: form.name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.msg || "Auth failed");

      // On success: redirect to dashboard (login) or login (signup)
      if (mode === "login") {
        localStorage.setItem("netzero_creds", JSON.stringify({ email: form.email, password: form.password }));
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111215]">
      <div className="w-full max-w-md bg-black/80 shadow-2xl rounded-2xl px-8 py-10 border border-gray-800 backdrop-blur-md">
        <div className="flex mb-8 justify-center gap-2">
          <button
            onClick={() => setMode("login")}
            className={`px-5 py-2 rounded-t-lg text-lg font-semibold transition ${
              mode === "login"
                ? "text-[#A02DED] border-b-2 border-[#A02DED]"
                : "text-gray-500 hover:text-[#A02DED]"
            }`}
            aria-pressed={mode === "login"}
            type="button"
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-5 py-2 rounded-t-lg text-lg font-semibold transition ${
              mode === "signup"
                ? "text-[#A02DED] border-b-2 border-[#A02DED]"
                : "text-gray-500 hover:text-[#A02DED]"
            }`}
            aria-pressed={mode === "signup"}
            type="button"
          >
            Sign Up
          </button>
        </div>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} autoComplete="off">
          {mode === "signup" && (
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#18191b] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A02DED] focus:border-[#A02DED] transition"
              required
              autoFocus
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#18191b] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A02DED] focus:border-[#A02DED] transition"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#18191b] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A02DED] focus:border-[#A02DED] transition"
            required
            minLength={4}
          />
          {error && (
            <div className="text-pink-500 text-sm text-center font-semibold">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#A02DED] to-blue-600 hover:from-[#A02DED] hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-xl transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
