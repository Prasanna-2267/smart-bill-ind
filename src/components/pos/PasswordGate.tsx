import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";

export function PasswordGate({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-brand-soft ring-1 ring-brand/20">
        <Lock className="size-6 text-brand" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">Enter the manager PIN to continue.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value === "000") {
            setUnlocked(true);
          } else {
            setError(true);
            setValue("");
          }
        }}
        className="mt-6 w-full space-y-3"
      >
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="•  •  •"
          className={`h-14 w-full rounded-2xl bg-white text-center text-2xl tracking-[0.6em] font-medium outline-none ring-1 transition ${
            error
              ? "ring-destructive/60 focus:ring-2 focus:ring-destructive/70"
              : "ring-border focus:ring-2 focus:ring-brand/40"
          }`}
        />
        {error && <p className="text-xs text-destructive">Incorrect PIN. Try 000.</p>}
        <button
          type="submit"
          className="h-12 w-full rounded-2xl bg-brand text-sm font-medium text-brand-foreground shadow-lg shadow-brand/20 active:scale-[0.99]"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
