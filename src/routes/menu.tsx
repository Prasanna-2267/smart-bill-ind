import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { usePos, inr } from "@/lib/pos-store";
import { AppShell, PageHeader } from "@/components/pos/AppShell";
import { PasswordGate } from "@/components/pos/PasswordGate";
import { CATEGORIES, type MenuItem } from "@/lib/menu-data";
import { toast } from "sonner";

export const Route = createFileRoute("/menu")({
  component: () => (
    <AppShell header={<PageHeader title="Menu Manager" subtitle="Add, edit or remove dishes" />}>
      <PasswordGate title="Menu Locked" gateType="menu">
        <MenuEditor />
      </PasswordGate>
    </AppShell>
  ),
});

function MenuEditor() {
  const { menu, addMenu, updateMenu, deleteMenu } = usePos();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menu;
    return menu.filter((m) => m.code.includes(q) || m.name.toLowerCase().includes(q));
  }, [menu, query]);

  return (
    <div>
      <div className="sticky top-[73px] z-10 border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or code"
            className="h-11 w-full rounded-xl bg-zinc-100 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      <div className="space-y-2 px-5 py-4 pb-32">
        {filtered.map((m) => (
          <div
            key={m.code}
            className="flex items-center justify-between rounded-2xl bg-white p-3.5 ring-1 ring-border shadow-pos"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500">
                  {m.code}
                </span>
                <h3 className="truncate text-sm font-medium text-zinc-950">{m.name}</h3>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {m.category} · <span className="font-medium text-zinc-800">{inr(m.price)}</span>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setEditing(m)}
                className="grid size-9 place-items-center rounded-lg bg-zinc-100 text-zinc-700 active:scale-95"
                aria-label="Edit"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete ${m.name}?`)) {
                    try {
                      await deleteMenu(m.code);
                      toast.success("Item deleted");
                    } catch (err: any) {
                      toast.error("Failed to delete item");
                    }
                  }
                }}
                className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-600 active:scale-95"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-zinc-500">No items found.</p>
        )}
      </div>

      <button
        onClick={() => setCreating(true)}
        className="fixed bottom-[92px] right-1/2 z-30 flex h-14 translate-x-[min(50vw,360px)] items-center gap-2 rounded-full bg-brand pl-4 pr-5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/30 active:scale-95"
      >
        <Plus className="size-5" strokeWidth={2.5} />
        Add Item
      </button>

      {(editing || creating) && (
        <ItemForm
          initial={editing ?? undefined}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSubmit={async (item) => {
            const err = editing ? await updateMenu(editing.code, item) : await addMenu(item);
            if (err) {
              toast.error(err);
              return false;
            }
            toast.success(editing ? "Item updated" : "Item added");
            return true;
          }}
        />
      )}
    </div>
  );
}

function ItemForm({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: MenuItem;
  onClose: () => void;
  onSubmit: (item: MenuItem) => Promise<boolean>;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price.toString() ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await onSubmit({ code, name: name.trim(), price: Number(price), category });
          if (ok) onClose();
        }}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">
            {initial ? "Edit Item" : "New Item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-zinc-100"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Item Code (3 digits)">
            <input
              required
              inputMode="numeric"
              pattern="\d{3}"
              maxLength={3}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
              className="h-12 w-full rounded-xl bg-zinc-100 px-4 font-mono text-base outline-none focus:ring-2 focus:ring-brand/30"
            />
          </Field>
          <Field label="Item Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-xl bg-zinc-100 px-4 text-base outline-none focus:ring-2 focus:ring-brand/30"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <input
                required
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
                className="h-12 w-full rounded-xl bg-zinc-100 px-4 text-base outline-none focus:ring-2 focus:ring-brand/30"
              />
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12 w-full rounded-xl bg-zinc-100 px-3 text-base outline-none focus:ring-2 focus:ring-brand/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 h-12 w-full rounded-2xl bg-brand text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 active:scale-[0.99]"
        >
          {initial ? "Save Changes" : "Add Item"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
