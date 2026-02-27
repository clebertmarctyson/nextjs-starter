import { NextResponse } from "next/server";
import prismaBot from "@/lib/prisma-bot";

function layerFromTradeId(tradeId: string | null): number {
  if (!tradeId) return 0;
  const match = tradeId.match(/layer(\d+)$/);
  return match ? parseInt(match[1]) : 0;
}

async function fetchAlpacaPrices(
  symbols: string[],
): Promise<Record<string, number>> {
  const apiKey = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  if (!apiKey || !apiSecret || symbols.length === 0) return {};

  try {
    const url = new URL(
      "https://data.alpaca.markets/v1beta3/crypto/us/latest/trades",
    );
    url.searchParams.set("symbols", symbols.join(","));

    const res = await fetch(url.toString(), {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
      cache: "no-store",
    });

    if (!res.ok) return {};
    const data = (await res.json()) as {
      trades: Record<string, { p: number }>;
    };

    return Object.fromEntries(
      Object.entries(data.trades ?? {}).map(([sym, t]) => [sym, t.p]),
    );
  } catch {
    return {};
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  const bots = await prismaBot.bot.findMany({ orderBy: { createdAt: "asc" } });

  const symbols = bots
    .map((b) => b.name.match(/\[(.+)\]/)?.[1])
    .filter(Boolean) as string[];

  const prices = await fetchAlpacaPrices(symbols);

  const result = await Promise.all(
    bots.map(async (bot) => {
      const symbol = bot.name.match(/\[(.+)\]/)?.[1] ?? "???";
      const currentPrice = prices[symbol] ?? null;

      const filledBuys = await prismaBot.botOrder.findMany({
        where: { botId: bot.id, type: "buy", status: "filled" },
        orderBy: { createdAt: "asc" },
      });

      const soldTradeIds = new Set(
        (
          await prismaBot.botOrder.findMany({
            where: { botId: bot.id, type: "sell", status: "filled" },
            select: { tradeId: true },
          })
        )
          .map((o) => o.tradeId)
          .filter(Boolean) as string[],
      );

      const openPositions = filledBuys
        .filter((o) => !o.tradeId || !soldTradeIds.has(o.tradeId))
        .map((o) => {
          const entryPrice = o.fillPrice ?? o.price;
          const qty = o.fillAmount ?? o.amount;
          const cost = entryPrice * qty;
          const unrealizedPnl =
            currentPrice != null ? (currentPrice - entryPrice) * qty : null;
          const unrealizedPnlPct =
            currentPrice != null
              ? (currentPrice / entryPrice - 1) * 100
              : null;
          return {
            id: o.id,
            layer: layerFromTradeId(o.tradeId),
            entryPrice,
            qty,
            cost,
            unrealizedPnl,
            unrealizedPnlPct,
            openedAt: o.createdAt.toISOString(),
          };
        });

      const closedSells = await prismaBot.botOrder.findMany({
        where: { botId: bot.id, type: "sell", status: "filled" },
      });

      const totalPnl = (
        await Promise.all(
          closedSells.map(async (sell) => {
            if (!sell.tradeId) return 0;
            const buy = await prismaBot.botOrder.findFirst({
              where: { tradeId: sell.tradeId, type: "buy", status: "filled" },
            });
            if (!buy) return 0;
            const entry = buy.fillPrice ?? buy.price;
            const exit = sell.fillPrice ?? sell.price;
            const qty = sell.fillAmount ?? sell.amount;
            return (exit - entry) * qty;
          }),
        )
      ).reduce((s, v) => s + v, 0);

      return {
        id: bot.id,
        name: bot.name,
        symbol,
        isActive: bot.isActive,
        currentPrice,
        openPositions,
        investedAmount: openPositions.reduce((s, p) => s + p.cost, 0),
        closedTradesCount: closedSells.length,
        totalPnl,
      };
    }),
  );

  return NextResponse.json(result);
}
