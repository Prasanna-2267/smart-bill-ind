import { X, Printer } from "lucide-react";
import { usePos, inr, type Order } from "@/lib/pos-store";

export function BillDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const { settings } = usePos();
  const d = new Date(order.date);
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center no-print">
        <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
            Paid · {order.paymentMode}
          </span>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-zinc-100 text-zinc-600"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-zinc-950">{settings.restaurantName}</h3>
          <p className="mt-0.5 text-[11px] text-zinc-500">{settings.address}</p>
          <p className="text-[11px] text-zinc-500">
            {settings.phone} · GSTIN {settings.gstNumber}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-y border-dashed border-border py-2.5 text-[11px] text-zinc-600">
          <span>Bill #{order.billNo}</span>
          <span>
            {d.toLocaleDateString("en-IN")} · {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="mt-2 max-h-56 overflow-y-auto">
          {order.items.map((l) => (
            <div key={l.code} className="flex items-baseline justify-between gap-2 py-1.5 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{l.name}</p>
                <p className="text-[11px] text-zinc-500">
                  {l.code} · {inr(l.price)} × {l.qty}
                </p>
              </div>
              <span className="font-medium tabular-nums">{inr(l.price * l.qty)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-dashed border-border pt-3 text-sm">
          <Row label="Subtotal" value={inr(order.subtotal)} />
          {order.gstPct > 0 && <Row label={`GST (${order.gstPct}%)`} value={inr(order.gstAmount)} />}
          {order.acCharge > 0 && <Row label="AC Charges" value={inr(order.acCharge)} />}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-zinc-950">
            <span>Grand Total</span>
            <span className="tabular-nums">{inr(order.total)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            {order.orderType}
            {order.acMode ? ` · ${order.acMode}` : ""}
          </span>
          <span>Paid via {order.paymentMode}</span>
        </div>

        <p className="mt-4 text-center text-[11px] italic text-zinc-500">{settings.footer}</p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-100 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 active:scale-[0.99]"
          >
            <Printer className="size-4" />
            Print Bill
          </button>
          <button
            onClick={onClose}
            className="h-12 flex-1 rounded-2xl bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-900 active:scale-[0.99]"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <div className="print-only" style={{ width: '80mm', margin: '0', color: 'black', fontFamily: 'monospace', fontSize: '12px' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>{settings.restaurantName}</h3>
        <p style={{ margin: '2px 0' }}>{settings.address}</p>
        <p style={{ margin: '2px 0' }}>Ph: {settings.phone}</p>
        {settings.gstEnabled && settings.gstNumber && <p style={{ margin: '2px 0' }}>GSTIN: {settings.gstNumber}</p>}
      </div>
      <div style={{ borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '5px 0', margin: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
        <span>Bill #{order.billNo}</span>
        <span>{d.toLocaleDateString("en-IN")} {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      
      <table style={{ width: '100%', marginBottom: '10px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed black' }}>
            <th style={{ textAlign: 'left', paddingBottom: '5px', fontWeight: 'normal' }}>Item</th>
            <th style={{ textAlign: 'right', paddingBottom: '5px', fontWeight: 'normal' }}>Qty</th>
            <th style={{ textAlign: 'right', paddingBottom: '5px', fontWeight: 'normal' }}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map(l => (
            <tr key={l.code}>
              <td style={{ padding: '2px 0' }}>{l.name}</td>
              <td style={{ textAlign: 'right' }}>{l.qty}</td>
              <td style={{ textAlign: 'right' }}>{inr(l.price * l.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ borderTop: '1px dashed black', paddingTop: '5px', marginTop: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span><span>{inr(order.subtotal)}</span>
        </div>
        {order.gstPct > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>GST ({order.gstPct}%)</span><span>{inr(order.gstAmount)}</span>
          </div>
        )}
        {order.acCharge > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>AC Charges</span><span>{inr(order.acCharge)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '5px', borderTop: '1px solid black', paddingTop: '5px' }}>
          <span>Total</span><span>{inr(order.total)}</span>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <p style={{ margin: '2px 0' }}>{order.orderType}{order.acMode ? ` (${order.acMode})` : ''}</p>
        <p style={{ margin: '2px 0' }}>Paid: {order.paymentMode}</p>
        <p style={{ margin: '10px 0 0 0', fontStyle: 'italic' }}>{settings.footer}</p>
      </div>
    </div>
  </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium tabular-nums text-zinc-900">{value}</span>
    </div>
  );
}
