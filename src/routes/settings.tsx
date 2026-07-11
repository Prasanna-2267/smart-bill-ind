import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";
import { usePos } from "@/lib/pos-store";
import { clearAuthToken } from "@/lib/api";
import { AppShell, PageHeader } from "@/components/pos/AppShell";
import { PasswordGate } from "@/components/pos/PasswordGate";

export const Route = createFileRoute("/settings")({
  component: () => (
    <AppShell header={<PageHeader title="Settings" subtitle="Restaurant & billing config" />}>
      <PasswordGate title="Settings Locked" gateType="settings">
        <SettingsEditor />
      </PasswordGate>
    </AppShell>
  ),
});

function SettingsEditor() {
  const { settings, updateSettings } = usePos();
  const [s, setS] = useState(settings);
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const err = await updateSettings(s);
    setSaving(false);
    
    if (err) {
      toast.error(err);
    } else {
      toast.success("Settings saved");
      navigate({ to: "/" });
    }
  }

  return (
    <div className="space-y-5 px-5 py-5 pb-32">
      <Panel title="Restaurant Details">
        <div className="space-y-3">
          <Field label="Restaurant Name">
            <TextInput
              value={s.restaurantName}
              onChange={(v) => setS({ ...s, restaurantName: v })}
            />
          </Field>
          <Field label="Address">
            <TextInput value={s.address} onChange={(v) => setS({ ...s, address: v })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <TextInput value={s.phone} onChange={(v) => setS({ ...s, phone: v })} />
            </Field>
            <Field label="GST Number">
              <TextInput value={s.gstNumber} onChange={(v) => setS({ ...s, gstNumber: v })} />
            </Field>
          </div>
          <Field label="Bill Footer Text">
            <TextInput value={s.footer} onChange={(v) => setS({ ...s, footer: v })} />
          </Field>
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-border">
            <div className="grid size-12 place-items-center rounded-lg bg-brand-soft text-brand text-lg font-semibold">
              {s.restaurantName.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-xs text-zinc-500">Logo placeholder — initials shown on bill.</p>
          </div>
        </div>
      </Panel>

      <Panel title="GST">
        <ToggleRow
          label="Apply GST on bills"
          hint="Adds GST separately in checkout and printed bill"
          checked={s.gstEnabled}
          onChange={(v) => setS({ ...s, gstEnabled: v })}
        />
        {s.gstEnabled && (
          <Field label="GST Percentage (%)" className="mt-3">
            <TextInput
              inputMode="decimal"
              value={s.gstPct.toString()}
              onChange={(v) => setS({ ...s, gstPct: Number(v.replace(/[^\d.]/g, "")) || 0 })}
            />
          </Field>
        )}
      </Panel>

      <Panel title="AC Charges">
        <ToggleRow
          label="Enable AC charges"
          hint="Applied when customer picks AC seating in Dine-In"
          checked={s.acEnabled}
          onChange={(v) => setS({ ...s, acEnabled: v })}
        />
        {s.acEnabled && (
          <Field label="AC Charge (₹)" className="mt-3">
            <TextInput
              inputMode="numeric"
              value={s.acCharge.toString()}
              onChange={(v) => setS({ ...s, acCharge: Number(v.replace(/\D/g, "")) || 0 })}
            />
          </Field>
        )}
      </Panel>

      <button
        onClick={save}
        disabled={saving}
        className="h-14 w-full flex items-center justify-center rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-lg shadow-brand/20 active:scale-[0.99] disabled:opacity-70"
      >
        {saving ? <Loader2 className="size-5 animate-spin" /> : "Save Settings"}
      </button>

      <button
        onClick={() => {
          clearAuthToken();
          toast.info("Signed out successfully");
          navigate({ to: "/login" });
        }}
        className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-50 text-base font-semibold text-red-600 transition active:scale-[0.99] hover:bg-red-100 ring-1 ring-red-100"
      >
        <LogOut className="size-5" />
        Sign Out
      </button>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-border shadow-pos">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <input
      value={value}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-xl bg-zinc-100 px-4 text-sm outline-none focus:ring-2 focus:ring-brand/30"
    />
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-brand" : "bg-zinc-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
