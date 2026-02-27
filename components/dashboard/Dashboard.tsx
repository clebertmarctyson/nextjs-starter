"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OpenPosition {
  id: string;
  layer: number;
  entryPrice: number;
  qty: number;
  cost: number;
  unrealizedPnl: number | null;
  unrealizedPnlPct: number | null;
  openedAt: string;
}

interface BotSummary {
  id: string;
  name: string;
  symbol: string;
  isActive: boolean;
  currentPrice: number | null;
  openPositions: OpenPosition[];
  investedAmount: number;
  closedTradesCount: number;
  totalPnl: number;
}

interface ClosedTrade {
  id: string;
  tradeId: string | null;
  layer: number;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  qty: number;
  profit: number;
  profitPct: number;
  openedAt: string | null;
  closedAt: string;
}

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtPrice(n: number | null) {
  if (n == null) return "—";
  if (n >= 1000)
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

function fmtUsd(n: number | null) {
  if (n == null) return "—";
  return `$${Math.abs(n).toFixed(2)}`;
}

function fmtPct(n: number | null) {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtQty(n: number) {
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function signedUsd(n: number) {
  return `${n >= 0 ? "+" : "-"}${fmtUsd(n)}`;
}

function pnlCn(n: number | null) {
  if (n == null || n === 0) return "";
  return n > 0 ? "text-emerald-500" : "text-red-500";
}

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", className)}>{value}</span>
    </div>
  );
}

// ── BotCard ───────────────────────────────────────────────────────────────────

function BotCard({ bot }: { bot: BotSummary }) {
  const [showHistory, setShowHistory] = useState(false);
  const [trades, setTrades] = useState<ClosedTrade[] | null>(null);
  const [tradesLoading, setTradesLoading] = useState(false);

  useEffect(() => {
    if (!showHistory) return;
    let active = true;

    async function load() {
      setTradesLoading(true);
      try {
        const res = await fetch(`/api/bots/${bot.id}/trades?limit=30`);
        if (active && res.ok) setTrades(await res.json());
      } finally {
        if (active) setTradesLoading(false);
      }
    }

    load();
    const id = setInterval(load, 15_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [showHistory, bot.id]);

  const unrealizedTotal = bot.openPositions.reduce(
    (s, p) => s + (p.unrealizedPnl ?? 0),
    0,
  );
  const totalQty = bot.openPositions.reduce((s, p) => s + p.qty, 0);
  const marketValue =
    bot.currentPrice != null && totalQty > 0
      ? totalQty * bot.currentPrice
      : null;
  const ticker = bot.symbol.split("/")[0];
  const sorted = [...bot.openPositions].sort((a, b) => a.layer - b.layer);

  const stats = [
    { label: `Holdings (${ticker})`, value: totalQty > 0 ? fmtQty(totalQty) : "—" },
    { label: "Mkt Value", value: fmtUsd(marketValue) },
    { label: "Invested", value: fmtUsd(bot.investedAmount) },
    { label: "Unrealized", value: signedUsd(unrealizedTotal), cn: pnlCn(unrealizedTotal) },
    { label: "Realized P/L", value: signedUsd(bot.totalPnl), cn: pnlCn(bot.totalPnl) },
    { label: "Closed Trades", value: String(bot.closedTradesCount) },
  ];

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b space-y-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2.5 rounded-full shrink-0",
              bot.isActive ? "bg-emerald-500" : "bg-red-500",
            )}
          />
          <span className="font-bold text-lg">{bot.symbol}</span>
        </div>
        <span className="font-mono font-semibold text-base">
          {fmtPrice(bot.currentPrice)}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          {stats.map(({ label, value, cn: statCn }) => (
            <div key={label} className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground leading-tight truncate">
                {label}
              </span>
              <span className={cn("text-sm font-medium font-mono mt-0.5", statCn)}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Open positions table */}
        {sorted.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Open Positions ({sorted.length})
            </p>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    {["Layer", "Entry", "Qty", "Cost", "P/L"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-medium text-muted-foreground text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((pos) => (
                    <tr key={pos.id} className="border-t">
                      <td className="px-3 py-2">
                        <Badge
                          variant="outline"
                          className="text-xs h-5 py-0 px-1.5"
                        >
                          L{pos.layer}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {fmtPrice(pos.entryPrice)}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {fmtQty(pos.qty)}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {fmtUsd(pos.cost)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 font-mono",
                          pnlCn(pos.unrealizedPnlPct),
                        )}
                      >
                        {fmtPct(pos.unrealizedPnlPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No open positions
          </p>
        )}

        {/* Trade history toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-sm w-full"
          onClick={() => setShowHistory((v) => !v)}
        >
          {showHistory ? "▲ Hide history" : "▼ Trade history"}
          {tradesLoading && " …"}
        </Button>

        {showHistory && (
          <div>
            {trades && trades.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Recent Closed Trades
                </p>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        {["Layer", "Entry", "Exit", "Qty", "Profit", "Closed"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left font-medium text-muted-foreground text-xs"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t) => (
                        <tr key={t.id} className="border-t">
                          <td className="px-3 py-2">
                            <Badge
                              variant="outline"
                              className="text-xs h-5 py-0 px-1.5"
                            >
                              L{t.layer}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {fmtPrice(t.entryPrice)}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {fmtPrice(t.exitPrice)}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {fmtQty(t.qty)}
                          </td>
                          <td
                            className={cn(
                              "px-3 py-2 font-mono",
                              pnlCn(t.profit),
                            )}
                          >
                            {signedUsd(t.profit)}{" "}
                            <span className="opacity-60">
                              ({fmtPct(t.profitPct)})
                            </span>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {fmtDate(t.closedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : trades !== null ? (
              <p className="text-sm text-muted-foreground italic">
                No closed trades yet
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ user }: { user: User }) {
  const [bots, setBots] = useState<BotSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bots");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBots(await res.json());
      setUpdatedAt(new Date());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, [load]);

  const totalPnl = bots?.reduce((s, b) => s + b.totalPnl, 0) ?? 0;
  const totalUnrealized =
    bots?.reduce(
      (s, b) =>
        s + b.openPositions.reduce((s2, p) => s2 + (p.unrealizedPnl ?? 0), 0),
      0,
    ) ?? 0;
  const totalOpen = bots?.reduce((s, b) => s + b.openPositions.length, 0) ?? 0;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <span className="font-bold text-base">◈ DCA Bot Dashboard</span>

          <div className="flex items-center gap-2 flex-wrap">
            {bots && (
              <>
                <Chip label="Bots" value={String(bots.length)} />
                <Chip label="Open" value={String(totalOpen)} />
                <Chip
                  label="Unrealized"
                  value={signedUsd(totalUnrealized)}
                  className={pnlCn(totalUnrealized)}
                />
                <Chip
                  label="Realized"
                  value={signedUsd(totalPnl)}
                  className={pnlCn(totalPnl)}
                />
              </>
            )}
            <Chip
              label="Updated"
              value={updatedAt ? updatedAt.toLocaleTimeString() : "—"}
              className="opacity-60"
            />
            <ThemeToggle />
            <Avatar className="size-7 cursor-pointer" onClick={() => signOut()}>
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        {loading && (
          <p className="text-muted-foreground text-sm">Connecting…</p>
        )}
        {error && (
          <p className="text-red-500 text-sm">
            Failed to load data: {error}
          </p>
        )}
        {bots?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No bots found. Start the trading bot to see data here.
          </p>
        )}
        {bots && bots.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
