import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Plus, Loader2 } from "lucide-react";
import { AppShell } from "@/components/pos/AppShell";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  if (!isAdminAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-zinc-950 text-white shadow-lg">
              <Shield className="size-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">Admin Portal</h1>
            <p className="mt-1 text-sm text-zinc-500">Master access to create hotels</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (adminEmail && adminPassword) {
                setIsAdminAuth(true);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="h-12 w-full rounded-xl bg-zinc-100 px-4 text-sm font-medium outline-none ring-1 ring-border transition focus:bg-white focus:ring-2 focus:ring-zinc-950"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="h-12 w-full rounded-xl bg-zinc-100 px-4 text-sm font-medium outline-none ring-1 ring-border transition focus:bg-white focus:ring-2 focus:ring-zinc-950"
              />
            </div>
            <button
              type="submit"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white shadow-lg transition active:scale-[0.99]"
            >
              Verify Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AppShell header={
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-5 py-4 backdrop-blur">
        <h1 className="text-lg font-semibold text-zinc-950">Master Admin Console</h1>
        <p className="text-xs text-zinc-500">Create & manage hotel accounts</p>
      </header>
    }>
      <div className="mx-auto max-w-lg p-5 pb-32 space-y-6">
        <CreateHotelForm adminEmail={adminEmail} adminPassword={adminPassword} />
      </div>
    </AppShell>
  );
}

function CreateHotelForm({ adminEmail, adminPassword }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [menuPassword, setMenuPassword] = useState("");
  const [settingsPassword, setSettingsPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // NOTE: We don't use the standard apiFetch here if we don't have a hotel JWT,
      // because apiFetch sets Authorization: Bearer. 
      // But /api/admin/hotels doesn't require JWT, just admin creds in body!
      const res = await fetch("http://localhost:5000/api/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          adminPassword,
          email,
          password,
          menuPassword,
          settingsPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create hotel");
      
      toast.success("Hotel created successfully!");
      setEmail("");
      setPassword("");
      setMenuPassword("");
      setSettingsPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-pos ring-1 ring-border">
      <div className="mb-6 flex items-center gap-3 border-b border-dashed border-border pb-4">
        <div className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <Plus className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-950">Add New Hotel</h2>
          <p className="text-[11px] text-zinc-500">Provision a fresh account</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Hotel Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl bg-zinc-100 px-4 text-sm font-medium outline-none ring-1 ring-border transition focus:bg-white focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Main Login Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl bg-zinc-100 px-4 text-sm font-medium outline-none ring-1 ring-border transition focus:bg-white focus:ring-2 focus:ring-brand/40"
          />
        </div>
        
        <div className="pt-2">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Dashboard Gates</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Menu PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{3}"
                maxLength={3}
                required
                value={menuPassword}
                onChange={(e) => setMenuPassword(e.target.value)}
                placeholder="e.g. 123"
                className="h-12 w-full rounded-xl bg-zinc-100 px-4 text-sm font-medium outline-none ring-1 ring-border transition focus:bg-white focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Settings PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{3}"
                maxLength={3}
                required
                value={settingsPassword}
                onChange={(e) => setSettingsPassword(e.target.value)}
                placeholder="e.g. 123"
                className="h-12 w-full rounded-xl bg-zinc-100 px-4 text-sm font-medium outline-none ring-1 ring-border transition focus:bg-white focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition active:scale-[0.99] disabled:opacity-70"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Create Hotel Account"}
        </button>
      </form>
    </section>
  );
}
