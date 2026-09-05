"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AuthCard,
  AuthFooter,
  Field,
  GoogleButton,
} from "@/components/auth";
import { validatePassword } from "@/lib/password-policy";
import { useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  const { register } = useAuth();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    const form = new FormData(e.currentTarget);

    const username = String(form.get("username") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirm") || "");

    // Username validation
    if (!username) {
      setError("Username is required.");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    // Email validation
    if (!email) {
      setError("Email is required.");
      return;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password policy
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(" "));
      return;
    }

    setBusy(true);

    try {
      await register(username, email, password);

      // Registration successful
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create your ContextIQ account"
      subtitle="Your documents and conversations stay scoped to your account."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Username"
          name="username"
          required
        />

        <Field
          label="Email"
          name="email"
          type="email"
          required
        />

        <Field
          label="Password"
          name="password"
          type="password"
          required
        />

        <Field
          label="Confirm Password"
          name="confirm"
          type="password"
          required
        />

        {error && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Creating…" : "Register"}
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="h-px flex-1 bg-slate-800" />
          OR
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <GoogleButton />
      </form>

      <AuthFooter>
        Already have an account?{" "}
        <Link
          className="text-white hover:underline"
          href="/auth/login"
        >
          Login
        </Link>
      </AuthFooter>
    </AuthCard>
  );
}