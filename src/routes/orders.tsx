import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Receipt } from "lucide-react";
import { usePos, inr, type Order } from "@/lib/pos-store";
import { AppShell, PageHeader } from "@/components/pos/AppShell";
import { BillDialog } from "@/components/pos/BillDialog";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { orders, trends, searchOrders, fetchNextOrdersPage, isFetchingOrders, hasMoreOrders } = usePos();
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchOrders(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AppShell header={<PageHeader title="Past Orders" subtitle={`${trends?.totalOrders || orders.length} total bills`} />}>
      <div className="sticky top-[73px] z-10 border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by bill no, item or date"
            className="h-11 w-full rounded-xl bg-zinc-100 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      <div className="space-y-3 px-5 py-4 pb-8">
        {orders.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Receipt className="size-6" />
            </div>
            <p className="text-sm text-zinc-500">
              {query ? "No matches." : "No orders yet. Generate your first bill."}
            </p>
          </div>
        )}

        {orders.map((o) => {
          const d = new Date(o.date);
          return (
            <article
              key={o.billNo}
              onClick={() => setSelectedOrder(o)}
              className="rounded-2xl bg-white p-4 ring-1 ring-border shadow-pos cursor-pointer transition active:scale-[0.99] hover:ring-brand/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    #{o.billNo}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-zinc-950">
                    {d.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    ·{" "}
                    {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className="shrink-0 text-lg font-semibold tabular-nums text-zinc-950">
                  {inr(o.total)}
                </p>
              </div>

              <div className="mt-3 space-y-1 border-t border-dashed border-border pt-3 text-xs text-zinc-600">
                {o.items.slice(0, 3).map((l) => (
                  <div key={l.code} className="flex justify-between">
                    <span className="truncate">
                      {l.qty} × {l.name}
                    </span>
                    <span className="tabular-nums">{inr(l.price * l.qty)}</span>
                  </div>
                ))}
                {o.items.length > 3 && (
                  <p className="text-[11px] text-zinc-400">+ {o.items.length - 3} more</p>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Chip>{o.orderType}</Chip>
                {o.acMode && <Chip>{o.acMode}</Chip>}
                <Chip>{o.paymentMode}</Chip>
                {o.gstPct > 0 && <Chip>GST {o.gstPct}%</Chip>}
                {o.acCharge > 0 && <Chip>AC {inr(o.acCharge)}</Chip>}
              </div>
            </article>
          );
        })}

        {hasMoreOrders && orders.length > 0 && (
          <button
            onClick={() => fetchNextOrdersPage()}
            disabled={isFetchingOrders}
            className="w-full rounded-2xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-600 transition active:scale-[0.99] hover:bg-zinc-200 disabled:opacity-50 mt-4"
          >
            {isFetchingOrders ? "Loading..." : "Load More"}
          </button>
        )}
      </div>

      {selectedOrder && (
        <BillDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </AppShell>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
      {children}
    </span>
  );
}
