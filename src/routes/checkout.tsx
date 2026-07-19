import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Banknote, Smartphone, Snowflake, Store, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { usePos, inr, type OrderType, type PaymentMode, type AcMode, type Order } from "@/lib/pos-store";
import { AppShell } from "@/components/pos/AppShell";
import { BillDialog } from "@/components/pos/BillDialog";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, menu, settings, submitOrder, clearCart } = usePos();

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([code, qty]) => {
          const m = menu.find((i) => i.code === code);
          return m ? { code: m.code, name: m.name, price: m.price, qty } : null;
        })
        .filter((x): x is NonNullable<typeof x> => !!x),
    [cart, menu],
  );

  const [orderType, setOrderType] = useState<OrderType>("Dine-In");
  const [acMode, setAcMode] = useState<AcMode>("Non-AC");
  const [payment, setPayment] = useState<PaymentMode | null>(null);
  const [bill, setBill] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const acCharge =
    settings.acEnabled && orderType === "Dine-In" && acMode === "AC" ? settings.acCharge : 0;
  const gstAmount = settings.gstEnabled ? ((subtotal + acCharge) * (settings.gstPct / 100)) : 0;
  const total = Math.round(subtotal + gstAmount + acCharge);

  const showAc = settings.acEnabled && orderType === "Dine-In";

  if (lines.length === 0 && !bill) {
    return (
      <AppShell>
        <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-zinc-500">Your cart is empty.</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
          >
            Back to billing
          </button>
        </div>
      </AppShell>
    );
  }

  async function generateBill() {
    if (!payment) return;
    setIsSubmitting(true);
    try {
      const itemsPayload = lines.map(l => ({ code: l.code, quantity: l.qty }));
      const order = await submitOrder(
        payment.toUpperCase(), 
        orderType, 
        acMode === "AC", 
        itemsPayload
      );
      setBill(order);
      clearCart();
      
      // Auto trigger print dialog shortly after modal renders
      setTimeout(() => {
        window.print();
      }, 300);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell
      header={
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur">
          <button
            onClick={() => navigate({ to: "/" })}
            className="grid size-9 place-items-center rounded-full bg-zinc-100 text-zinc-700 active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-zinc-950">Checkout</h1>
            <p className="text-xs text-zinc-500">{lines.length} items · {inr(subtotal)}</p>
          </div>
        </header>
      }
    >
      <div className="space-y-6 px-5 py-5 pb-48">
        <Section title="Order Type">
          <div className="grid grid-cols-2 gap-3">
            <ChoiceCard
              active={orderType === "Dine-In"}
              onClick={() => setOrderType("Dine-In")}
              icon={<Store className="size-5" />}
              label="Dine-In"
            />
            <ChoiceCard
              active={orderType === "Take Away"}
              onClick={() => setOrderType("Take Away")}
              icon={<ShoppingBag className="size-5" />}
              label="Take Away"
            />
          </div>
        </Section>

        {showAc && (
          <Section title="Seating">
            <div className="grid grid-cols-2 gap-3">
              <ChoiceCard
                active={acMode === "AC"}
                onClick={() => setAcMode("AC")}
                icon={<Snowflake className="size-5" />}
                label="AC"
                hint={`+${inr(settings.acCharge)}`}
              />
              <ChoiceCard
                active={acMode === "Non-AC"}
                onClick={() => setAcMode("Non-AC")}
                icon={<Store className="size-5" />}
                label="Non-AC"
              />
            </div>
          </Section>
        )}

        <Section title="Bill Summary">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-border shadow-pos">
            <SummaryRow label="Subtotal" value={inr(subtotal)} />
            {settings.gstEnabled && (
              <SummaryRow label={`GST (${settings.gstPct}%)`} value={inr(gstAmount)} />
            )}
            {acCharge > 0 && <SummaryRow label="AC Charges" value={inr(acCharge)} />}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-zinc-950">Grand Total</span>
              <span className="text-xl font-semibold text-zinc-950">{inr(total)}</span>
            </div>
          </div>
        </Section>

        <Section title="Payment Mode">
          <div className="grid grid-cols-2 gap-3">
            <ChoiceCard
              active={payment === "Cash"}
              onClick={() => setPayment("Cash")}
              icon={<Banknote className="size-5" />}
              label="Cash"
            />
            <ChoiceCard
              active={payment === "UPI"}
              onClick={() => setPayment("UPI")}
              icon={<Smartphone className="size-5" />}
              label="UPI"
            />
          </div>
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-[68px] z-30 mx-auto max-w-[720px] px-4 pb-3">
        <button
          disabled={!payment || isSubmitting}
          onClick={generateBill}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-base font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none"
        >
          <Check className="size-5" />
          {isSubmitting ? "Generating Bill..." : (payment ? `Generate Bill · ${inr(total)}` : "Select payment mode")}
        </button>
      </div>

      {bill && (
        <BillDialog
          order={bill}
          onClose={() => {
            setBill(null);
            navigate({ to: "/" });
          }}
        />
      )}
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ChoiceCard({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-24 flex-col items-center justify-center gap-1.5 rounded-2xl bg-white text-sm font-medium transition active:scale-[0.98] ${
        active
          ? "ring-2 ring-brand text-brand shadow-pos-lg"
          : "ring-1 ring-border text-zinc-700 shadow-pos"
      }`}
    >
      {icon}
      <span>{label}</span>
      {hint && <span className="text-[10px] font-normal text-zinc-500">{hint}</span>}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-900 tabular-nums">{value}</span>
    </div>
  );
}
