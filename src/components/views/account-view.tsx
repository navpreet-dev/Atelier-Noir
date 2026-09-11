"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, type ActivityEntry } from "@/lib/store";

function activityDetail(a: ActivityEntry): string {
  if (a.type === "order_placed") return a.meta ? `Placed order ${a.meta}` : "Order placed";
  switch (a.type) {
    case "wishlist_added":
      return "Added to wishlist";
    case "wishlist_removed":
      return "Removed from wishlist";
    case "product_viewed":
    case "viewed_product":
      return "Viewed a product";
    case "account_created":
      return "Account created";
    default:
      return a.type;
  }
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 90) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    (sameYear ? "" : `, ${d.getFullYear()}`)
  );
}

function ActivityItem({ activity }: { activity: ActivityEntry }) {
  return (
    <li className="flex items-baseline justify-between gap-6 py-3.5">
      <p className="min-w-0 text-sm leading-relaxed text-stone-700">{activityDetail(activity)}</p>
      <time
        dateTime={activity.createdAt}
        className="shrink-0 text-xs whitespace-nowrap text-stone-400"
      >
        {relativeTime(activity.createdAt)}
      </time>
    </li>
  );
}

function ActivityList() {
  const user = useStore((s) => s.user);
  const navigate = useStore((s) => s.navigate);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      if (!user) {
        setActivities([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch("/api/account/activity")
        .then((res) => (res.ok ? res.json() : { activities: [] }))
        .then((json) => {
          if (!cancelled) setActivities(json.activities ?? []);
        })
        .catch(() => {
          if (!cancelled) setActivities([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="mt-4 space-y-4" aria-label="Loading activity">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between gap-6 py-3.5">
            <div className="h-4 w-2/3 animate-pulse bg-stone-100" />
            <div className="h-3 w-16 animate-pulse bg-stone-100" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="mt-4 border border-dashed border-stone-200 px-6 py-10 text-center">
        <p className="text-sm leading-relaxed text-stone-500">
          No activity yet. Pieces you view, save and add to your bag will be kept here.
        </p>
        <Button
          onClick={() => navigate({ name: "shop", tag: "new", title: "New Arrivals" })}
          variant="outline"
          className="mt-5 h-10 rounded-none border-stone-900 px-6 text-[10px] font-semibold tracking-[0.22em] uppercase hover:bg-stone-900 hover:text-white"
        >
          Shop New Arrivals
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 max-h-[480px] overflow-y-auto pr-1">
      <ul className="divide-y divide-stone-100">
        {activities.map((a) => (
          <ActivityItem key={a.id} activity={a} />
        ))}
      </ul>
      {activities.length >= 60 && (
        <p className="py-3 text-xs text-stone-400">Showing your 60 most recent actions</p>
      )}
    </div>
  );
}

export function AccountView() {
  const user = useStore((s) => s.user);
  const userReady = useStore((s) => s.userReady);

  if (!userReady) {
    return (
      <section className="bg-stone-50">
        <div className="mx-auto flex min-h-[72vh] max-w-md items-center justify-center px-4">
          <div className="h-4 w-24 animate-pulse bg-stone-200" />
        </div>
      </section>
    );
  }

  return user ? <AccountPanel /> : <AuthPanel />;
}

function AuthPanel() {
  const setUser = useStore((s) => s.setUser);
  const navigate = useStore((s) => s.navigate);
  const pendingRoute = useStore((s) => s.pendingRoute);

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const res = await fetch(mode === "signin" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signin" ? { email, password } : { name, email, password }
        ),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setUser(json.user);
      if (pendingRoute) {
        useStore.setState({ pendingRoute: null });
        navigate(pendingRoute);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-stone-50">
      <div className="mx-auto flex min-h-[72vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <div className="border border-stone-200 bg-white p-6 sm:p-10">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
            Atelier Noir
          </p>
          <h1 className="mt-2 font-display text-3xl text-stone-900">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            {mode === "signin"
              ? "Welcome back. Sign in to see your saved activity, wishlist and bag."
              : "One account for everything — your recently viewed pieces, wishlist and bag are kept in one place."}
          </p>

          <div className="mt-6 flex gap-6 border-b border-stone-200">
            {(
              [
                ["signin", "Sign In"],
                ["register", "Create Account"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  setError("");
                }}
                className={`relative pb-2.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors ${
                  mode === value ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {label}
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 origin-left bg-stone-900 transition-transform duration-300 ${
                    mode === value ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            {mode === "register" && (
              <div className="space-y-2">
                <Label
                  htmlFor="auth-name"
                  className="text-[10px] font-semibold tracking-[0.2em] text-stone-500 uppercase"
                >
                  Full name
                </Label>
                <Input
                  id="auth-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Moreau"
                  className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="auth-email"
                className="text-[10px] font-semibold tracking-[0.2em] text-stone-500 uppercase"
              >
                Email
              </Label>
              <Input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="auth-password"
                className="text-[10px] font-semibold tracking-[0.2em] text-stone-500 uppercase"
              >
                Password
              </Label>
              <Input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signin" ? "Your password" : "At least 8 characters"}
                className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
              />
            </div>
            {error && (
              <p
                role="alert"
                className="border-l-2 border-[#9A3B26] bg-[#9A3B26]/5 px-3 py-2 text-sm text-[#9A3B26]"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy}
              className="h-11 w-full rounded-none bg-stone-900 text-[11px] font-semibold tracking-[0.22em] uppercase hover:bg-stone-800 disabled:opacity-60"
            >
              {busy
                ? mode === "signin"
                  ? "Signing in"
                  : "Creating account"
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-stone-400">
          Your email and password are kept private and are never shared.
        </p>
      </div>
    </section>
  );
}

function AccountPanel() {
  const user = useStore((s) => s.user);
  const signOut = useStore((s) => s.signOut);
  const navigate = useStore((s) => s.navigate);

  if (!user) return null;

  const firstName = user.name.split(" ")[0];

  const row = (label: string, value: string) => (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 uppercase">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-sm text-stone-800">{value}</dd>
    </div>
  );

  return (
    <section className="bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-stone-400 uppercase">
              My Account
            </p>
            <h1 className="mt-2 font-display text-3xl text-stone-900 sm:text-4xl">
              Welcome back, {firstName}
            </h1>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate({ name: "home" });
            }}
            className="group text-[11px] font-semibold tracking-[0.2em] text-stone-500 uppercase transition-colors hover:text-stone-900"
          >
            <span className="bg-gradient-to-r from-stone-900 to-stone-900 bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
              Sign Out
            </span>
          </button>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
          <div className="border border-stone-200 bg-white p-6 sm:p-8">
            <h2 className="text-[11px] font-semibold tracking-[0.25em] text-stone-900 uppercase">
              Account Details
            </h2>
            <dl className="mt-4 divide-y divide-stone-100">
              {row("Name", user.name)}
              {row("Email", user.email)}
              {row(
                "Member since",
                new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              )}
            </dl>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate({ name: "wishlist" })}
                variant="outline"
                className="h-10 rounded-none border-stone-300 text-[10px] font-semibold tracking-[0.2em] uppercase hover:border-stone-900 hover:bg-stone-900 hover:text-white"
              >
                Wishlist
              </Button>
              <Button
                onClick={() => navigate({ name: "cart" })}
                variant="outline"
                className="h-10 rounded-none border-stone-300 text-[10px] font-semibold tracking-[0.2em] uppercase hover:border-stone-900 hover:bg-stone-900 hover:text-white"
              >
                Shopping Bag
              </Button>
            </div>
          </div>

          <div className="border border-stone-200 bg-white p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[11px] font-semibold tracking-[0.25em] text-stone-900 uppercase">
                Recent Activity
              </h2>
              <p className="text-xs text-stone-400">Saved to your account</p>
            </div>
            <ActivityList />
          </div>
        </div>
      </div>
    </section>
  );
}
