import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePos, inr } from "@/lib/pos-store";
import { AppShell, PageHeader } from "@/components/pos/AppShell";

export const Route = createFileRoute("/trends")({
  component: TrendsPage,
});

function TrendsPage() {
  const { orders } = usePos();

  const stats = useMemo(() => {
    const now = new Date();
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 3600 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let today = 0, week = 0, month = 0;
    const itemCount: Record<string, { name: string; qty: number; revenue: number }> = {};
    const payment: Record<string, number> = {};
    const orderType: Record<string, number> = {};

    for (const o of orders) {
      const t = new Date(o.date).getTime();
      if (t >= startDay) today += o.total;
      if (t >= weekAgo) week += o.total;
      if (t >= monthStart) month += o.total;
      for (const l of o.items) {
        const k = l.code;
        itemCount[k] ||= { name: l.name, qty: 0, revenue: 0 };
        itemCount[k].qty += l.qty;
        itemCount[k].revenue += l.qty * l.price;
      }
      payment[o.paymentMode] = (payment[o.paymentMode] || 0) + 1;
      orderType[o.orderType] = (orderType[o.orderType] || 0) + 1;
    }

    const items = Object.values(itemCount).sort((a, b) => b.qty - a.qty);
    const best = items[0];
    const worst = items[items.length - 1];
    const top5 = items.slice(0, 5);
    const bottom = items.slice(-5).reverse();
    const totalOrders = orders.length;
    const avg = totalOrders ? Math.round(orders.reduce((s, o) => s + o.total, 0) / totalOrders) : 0;
    const paymentTop = Object.entries(payment).sort((a, b) => b[1] - a[1])[0];

    // last 7 days revenue
    const daily: { day: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = d.getTime();
      const end = start + 24 * 3600 * 1000;
      const rev = orders
        .filter((o) => {
          const t = new Date(o.date).getTime();
          return t >= start && t < end;
        })
        .reduce((s, o) => s + o.total, 0);
      daily.push({ day: d.toLocaleDateString("en-IN", { weekday: "short" }), revenue: rev });
    }

    return {
      today,
      week,
      month,
      totalOrders,
      avg,
      best,
      worst,
      top5,
      bottom,
      paymentTop,
      paymentData: Object.entries(payment).map(([name, value]) => ({ name, value })),
      orderTypeData: Object.entries(orderType).map(([name, value]) => ({ name, value })),
      daily,
    };
  }, [orders]);

  return (
    <AppShell header={<PageHeader title="Historical Trends" subtitle="Sales & performance" />}>
      <div className="space-y-5 px-5 py-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Today" value={inr(stats.today)} />
          <StatCard label="This Week" value={inr(stats.week)} />
          <StatCard label="This Month" value={inr(stats.month)} />
          <StatCard label="Total Orders" value={stats.totalOrders.toString()} />
          <StatCard label="Avg. Order" value={inr(stats.avg)} />
          <StatCard
            label="Top Payment"
            value={stats.paymentTop ? stats.paymentTop[0] : "—"}
          />
        </div>

        <Panel title="Revenue · Last 7 Days">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="oklch(0.9 0 0)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip
                  cursor={{ fill: "oklch(0.955 0.03 155)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0 0)", fontSize: 12 }}
                  formatter={(v) => inr(v as number)}
                />
                <Bar dataKey="revenue" fill="var(--brand)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2">
          <Panel title="Best Seller">
            {stats.best ? (
              <div>
                <p className="text-lg font-semibold text-zinc-950">{stats.best.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {stats.best.qty} sold · {inr(stats.best.revenue)}
                </p>
              </div>
            ) : (
              <Empty />
            )}
          </Panel>
          <Panel title="Least Sold">
            {stats.worst ? (
              <div>
                <p className="text-lg font-semibold text-zinc-950">{stats.worst.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{stats.worst.qty} sold</p>
              </div>
            ) : (
              <Empty />
            )}
          </Panel>
        </div>

        <Panel title="Top 5 Selling Items">
          {stats.top5.length ? (
            <ul className="divide-y divide-border">
              {stats.top5.map((i, idx) => (
                <li key={i.name} className="flex items-center justify-between py-2 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-md bg-brand-soft text-[11px] font-semibold text-brand">
                      {idx + 1}
                    </span>
                    <span className="truncate font-medium text-zinc-900">{i.name}</span>
                  </span>
                  <span className="tabular-nums text-zinc-600">{i.qty}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2">
          <Panel title="Payment Split">
            <MiniPie data={stats.paymentData} />
          </Panel>
          <Panel title="Dine-In vs Take Away">
            <MiniPie data={stats.orderTypeData} />
          </Panel>
        </div>

        <Panel title="Lowest Selling Items">
          {stats.bottom.length ? (
            <ul className="divide-y divide-border">
              {stats.bottom.map((i) => (
                <li key={i.name} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate font-medium text-zinc-800">{i.name}</span>
                  <span className="tabular-nums text-zinc-500">{i.qty}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

const COLORS = ["var(--brand)", "oklch(0.72 0.12 195)", "oklch(0.68 0.16 45)", "oklch(0.65 0.18 305)"];

function MiniPie({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <Empty />;
  return (
    <div className="flex items-center gap-3">
      <div className="h-24 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={22} outerRadius={40} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-xs">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-zinc-700">{d.name}</span>
            <span className="text-zinc-400">· {d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-border shadow-pos">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
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

function Empty() {
  return <p className="text-xs text-zinc-400">No data yet.</p>;
}
