import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Minus, Plus, ArrowRight } from "lucide-react";
import { usePos, inr } from "@/lib/pos-store";
import { AppShell, PageHeader } from "@/components/pos/AppShell";

export const Route = createFileRoute("/")({
  component: BillingPage,
});

function BillingPage() {
  const { menu, cart, setQty, settings } = usePos();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(menu.map((m) => m.category)))];
  }, [menu]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = menu;
    if (selectedCategory !== "All") {
      result = result.filter((m) => m.category === selectedCategory);
    }
    if (q) {
      result = result.filter(
        (m) => m.code.includes(q) || m.name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [menu, query, selectedCategory]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([code, qty]) => {
          const m = menu.find((i) => i.code === code);
          return m ? { ...m, qty } : null;
        })
        .filter((x): x is NonNullable<typeof x> => !!x),
    [cart, menu],
  );

  const subtotal = cartLines.reduce((s, l) => s + l.price * l.qty, 0);
  const itemCount = cartLines.reduce((s, l) => s + l.qty, 0);

  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = {};
    for (const m of filtered) {
      (g[m.category] ||= []).push(m);
    }
    return g;
  }, [filtered]);

  return (
    <AppShell
      header={
        <PageHeader
          title={settings.restaurantName}
          subtitle="Point of Sale · Billing"
          right={
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand ring-1 ring-brand/15">
              {settings.restaurantName.slice(0, 2).toUpperCase()}
            </div>
          }
        />
      }
    >
      <div className="sticky top-[73px] z-10 border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or 3-digit code (e.g. 103)"
            className="h-11 w-full rounded-xl bg-zinc-100 pl-10 pr-4 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 pb-40 space-y-6">
        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat}>
            <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {cat}
            </h2>
            <div className="space-y-2.5">
              {items.map((m) => {
                const qty = cart[m.code] ?? 0;
                return (
                  <div
                    key={m.code}
                    className={`flex items-center justify-between rounded-2xl bg-white p-3.5 ring-1 transition ${
                      qty > 0 ? "ring-brand/40 shadow-pos" : "ring-border shadow-pos"
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-500">
                          {m.code}
                        </span>
                        <h3 className="truncate text-sm font-medium text-zinc-950">{m.name}</h3>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-zinc-900">{inr(m.price)}</p>
                    </div>
                    <QtyStepper qty={qty} onChange={(n) => setQty(m.code, n)} />
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-sm text-zinc-500">
            No dishes match “{query}”.
          </div>
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-[68px] z-30 mx-auto max-w-[720px] px-4 pb-3">
          <div className="rounded-2xl bg-white p-4 shadow-pos-lg ring-1 ring-border">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Active Bill
                </p>
                <p className="text-sm font-medium text-zinc-950">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Subtotal
                </p>
                <p className="text-lg font-semibold text-zinc-950">{inr(subtotal)}</p>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-brand-foreground shadow-lg shadow-brand/20 active:scale-[0.99]"
            >
              Checkout
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function QtyStepper({ qty, onChange }: { qty: number; onChange: (n: number) => void }) {
  if (qty === 0) {
    return (
      <button
        onClick={() => onChange(1)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white active:scale-95"
        aria-label="Add"
      >
        <Plus className="size-4" strokeWidth={2.5} />
      </button>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-xl bg-brand p-1 text-white">
      <button
        onClick={() => onChange(qty - 1)}
        className="grid size-9 place-items-center rounded-lg hover:bg-white/10 active:scale-95"
        aria-label="Decrease"
      >
        <Minus className="size-4" strokeWidth={2.5} />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        className="grid size-9 place-items-center rounded-lg hover:bg-white/10 active:scale-95"
        aria-label="Increase"
      >
        <Plus className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
