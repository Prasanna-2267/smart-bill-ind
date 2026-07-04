import type { ReactNode } from "react";

export function AppShell({
  header,
  children,
  footer,
}: {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[720px] flex-col bg-surface">
      {header}
      <main className="flex-1 pb-[calc(68px+env(safe-area-inset-bottom))]">{children}</main>
      {footer}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-5 pt-5 pb-4 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-950">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
