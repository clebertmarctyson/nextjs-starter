import { NextRequest, NextResponse } from "next/server";
import prismaBot from "@/lib/prisma-bot";

function layerFromTradeId(tradeId: string | null): number {
  if (!tradeId) return 0;
  const match = tradeId.match(/layer(\d+)$/);
  return match ? parseInt(match[1]) : 0;
}

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> },
) {
  const { botId } = await params;
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") ?? "20"),
    100,
  );

  const sells = await prismaBot.botOrder.findMany({
    where: { botId, type: "sell", status: "filled" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const trades = await Promise.all(
    sells.map(async (sell) => {
      const buy = sell.tradeId
        ? await prismaBot.botOrder.findFirst({
            where: { tradeId: sell.tradeId, type: "buy", status: "filled" },
          })
        : null;

      const entryPrice = buy?.fillPrice ?? buy?.price ?? 0;
      const exitPrice = sell.fillPrice ?? sell.price;
      const qty = sell.fillAmount ?? sell.amount;
      const profit = (exitPrice - entryPrice) * qty;
      const profitPct = entryPrice > 0 ? (exitPrice / entryPrice - 1) * 100 : 0;

      return {
        id: sell.id,
        tradeId: sell.tradeId,
        layer: layerFromTradeId(sell.tradeId),
        symbol: sell.symbol,
        entryPrice,
        exitPrice,
        qty,
        profit,
        profitPct,
        openedAt: buy?.createdAt.toISOString() ?? null,
        closedAt: sell.createdAt.toISOString(),
      };
    }),
  );

  return NextResponse.json(trades);
}
