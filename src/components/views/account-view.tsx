"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore, type ActivityEntry } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const ACTIVITY_LABELS: Record<string, string> = {
  order_placed: "Order placed",
  wishlist_added: "Added to wishlist",
  wishlist_removed: "Removed from wishlist",
  product_viewed: "Viewed a product",
  account_created: "Account created",
};

const INPUT_CLS =
  "h-12 rounded-none border-stone-300 bg-white focus-visible:border-stone-900 focus-visible:ring-stone-900/20";
const LABEL_CLS = "text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500";

function formatActivityDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AccountView() {
  const user = useStore((s) => s.user);
  const userReady = useStore((s) => s.userReady);
  const signOut = useStore((s) => s.signOut);
  const navigate = useStore((s) => s.navigate);

  const [activity, setActivity] = useState<{ owner: string; data: ActivityEntry[] } | null>(null);

  useEffect(() => {
    if (!user) return;
    const ownerId = user.id;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account/activity");
        const json = res.status === 401 ? {} : await res.json().catch(() => ({}));
        if (!cancelled) {
          setActivity({ owner: ownerId, data: json.activities ?? [] });
        }
      } catch {
        if (!cancelled) {
          setActivity({ owner: ownerId, data: [] });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const activityList =
    activity && user && activity.owner === user.id ? activity.data : null;

  if (!userReady) {
    return <div className="min-h-[50vh]" aria-hidden />;
  }

  if (!user) {
    return <AuthPanel />;
  }

  const firstName = user.name.split(" ")[0] ?? "";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  async function handleSignOut() {
    await signOut();
    toast({ title: "Signed out." });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 md:px-6 lg:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
        My Account
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl md:text-4xl">Welcome back, {firstName}</h1>
        <button
          onClick={handleSignOut}
          className="border border-stone-300 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
        >
          Sign Out
        </button>
      </div>

      <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900">
        Account Details
      </h2>
      <dl className="mt-4 divide-y divide-stone-100 border-y border-stone-100">
        <div className="flex justify-between py-4 text-sm">
          <dt className="text-xs uppercase tracking-wider text-stone-400">Name</dt>
          <dd className="text-stone-900">{user.name}</dd>
        </div>
        <div className="flex justify-between py-4 text-sm">
          <dt className="text-xs uppercase tracking-wider text-stone-400">Email</dt>
          <dd className="text-stone-900">{user.email}</dd>
        </div>
        <div className="flex justify-between py-4 text-sm">
          <dt className="text-xs uppercase tracking-wider text-stone-400">Member Since</dt>
          <dd className="text-stone-900">{memberSince}</dd>
        </div>
      </dl>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate({ name: "wishlist" })}
          className="border border-stone-200 p-5 text-left transition hover:border-stone-900"
        >
          <Heart size={18} className="text-stone-400" aria-hidden />
          <span className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.2em]">
            Wishlist
          </span>
        </button>
        <button
          onClick={() => navigate({ name: "cart" })}
          className="border border-stone-200 p-5 text-left transition hover:border-stone-900"
        >
          <ShoppingBag size={18} className="text-stone-400" aria-hidden />
          <span className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.2em]">
            Shopping Bag
          </span>
        </button>
      </div>

      <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900">
        Recent Activity
      </h2>
      <p className="mt-1 text-sm text-stone-500">Saved to your account</p>

      {activityList === null ? (
        <p className="mt-4 text-sm text-stone-400">Loading…</p>
      ) : activityList.length === 0 ? (
        <p className="mt-4 text-sm text-stone-400">No activity yet — explore the collection.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {activityList.map((entry) => {
            const label = ACTIVITY_LABELS[entry.type] ?? entry.type;
            const orderMeta = entry.meta && entry.meta.startsWith("AN-") ? entry.meta : null;
            return (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 border border-stone-200 px-4 py-3 text-sm"
              >
                <span className="text-stone-900">
                  {label}
                  {orderMeta ? ` — ${orderMeta}` : ""}
                </span>
                <span className="shrink-0 text-xs text-stone-400">
                  {formatActivityDate(entry.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Auth gate (sign in / create account) ---------- */

function AuthPanel() {
  const setUser = useStore((s) => s.setUser);
  const navigate = useStore((s) => s.navigate);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim() || !password || (mode === "register" && !name.trim())) {
      setError("Please fill in all fields.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { email: email.trim(), password }
            : { name: name.trim(), email: email.trim(), password }
        ),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.user) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setUser(json.user);
      const first = String(json.user.name ?? "").split(" ")[0] ?? "";
      toast({
        title:
          mode === "login" ? `Welcome back, ${first}.` : `Welcome to Atelier Noir, ${first}.`,
      });
      const pending = useStore.getState().pendingRoute;
      if (pending) {
        useStore.setState({ pendingRoute: null });
        navigate(pending);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-14">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
        Atelier Noir
      </p>
      <h1 className="mt-3 text-center font-display text-3xl md:text-4xl">
        {mode === "login" ? "Sign In" : "Create Account"}
      </h1>
      <p className="mt-3 text-center text-sm text-stone-500">
        {mode === "login"
          ? "Welcome back. Sign in to see your saved activity, wishlist and bag."
          : "One account for everything — your recently viewed pieces, wishlist and bag are kept in one place."}
      </p>

      <div className="mt-8 grid grid-cols-2 border border-stone-200">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
            mode === "login" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
            mode === "register" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        {mode === "register" && (
          <div className="space-y-2">
            <Label className={LABEL_CLS}>Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Moreau"
              autoComplete="name"
              className={INPUT_CLS}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label className={LABEL_CLS}>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={INPUT_CLS}
          />
        </div>
        <div className="space-y-2">
          <Label className={LABEL_CLS}>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className={INPUT_CLS}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full bg-stone-900 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        {error && <p className="mt-4 text-center text-sm text-[#9A3B26]">{error}</p>}
      </form>

      <p className="mt-6 text-center text-xs text-stone-400">
        Your email and password are kept private and are never shared.
      </p>
    </div>
  );
}
