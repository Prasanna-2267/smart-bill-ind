import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to home
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_8px_40px_rgb(0,0,0,0.08)] ring-1 ring-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 mb-8 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
            <LogIn className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500">Enter your credentials to access your POS</p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="h-12 w-full rounded-xl bg-zinc-100/80 px-4 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:bg-white focus:ring-2 focus:ring-brand/30 transition shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 w-full rounded-xl bg-zinc-100/80 px-4 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:bg-white focus:ring-2 focus:ring-brand/30 transition shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition hover:bg-brand/90 active:scale-[0.99]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
