import { useState, type ReactNode } from "react";
import { Lock, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export function PasswordGate({
  title,
  gateType,
  children,
}: {
  title: string;
  gateType: "menu" | "settings" | "trends";
  children: ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-brand-soft ring-1 ring-brand/20">
        <Lock className="size-6 text-brand" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">Enter the manager PIN to continue.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (value.length === 0) return;
          
          setLoading(true);
          try {
            await apiFetch("/auth/verify-gate", {
              method: "POST",
              body: JSON.stringify({ type: gateType, password: value })
            });
            setUnlocked(true);
          } catch (err) {
            setError(true);
            setValue("");
          } finally {
            setLoading(false);
          }
        }}
        className="mt-6 w-full space-y-3"
      >
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          pattern="[0-9]{3}"
          maxLength={3}
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setValue(val);
            setError(false);
          }}
          placeholder="•  •  •"
          className={`h-14 w-full rounded-2xl bg-white text-center text-2xl tracking-[0.6em] font-medium outline-none ring-1 transition ${
            error
              ? "ring-destructive/60 focus:ring-2 focus:ring-destructive/70"
              : "ring-border focus:ring-2 focus:ring-brand/40"
          }`}
        />
        {error && <p className="text-xs text-destructive">Incorrect password.</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full flex items-center justify-center rounded-2xl bg-brand text-sm font-medium text-brand-foreground shadow-lg shadow-brand/20 active:scale-[0.99] disabled:opacity-70"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Unlock"}
        </button>
      </form>
    </div>
  );
}
