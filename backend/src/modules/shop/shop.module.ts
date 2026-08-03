import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";
import { isVipActive } from "../../core/progression";

const DAY_MS = 24 * 60 * 60 * 1000;

async function getShopConfig(): Promise<{ mockPayments: boolean }> {
  const row = await prisma.systemConfig.findUnique({ where: { key: "shop" } });
  const value = (row?.value as any) ?? {};
  return { mockPayments: value.mockPayments !== false };
}

// Aplica o efeito do produto no usuário (dentro de transação).
async function applyProduct(
  tx: any,
  userId: string,
  product: any
): Promise<{ amount: number; message: string }> {
  if (product.type === "diamond_pack") {
    await tx.user.update({
      where: { id: userId },
      data: { diamonds: { increment: product.diamondAmount } },
    });
    return { amount: product.diamondAmount, message: `+${product.diamondAmount} diamantes` };
  }

  if (product.type === "vip") {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { vipUntil: true } });
    const base = isVipActive(user) ? user.vipUntil.getTime() : Date.now();
    const until = new Date(base + product.vipDays * DAY_MS);
    await tx.user.update({
      where: { id: userId },
      data: { vipUntil: until, vipOwned: true },
    });
    return { amount: product.vipDays, message: `${product.vipDays} dias de VIP` };
  }

  if (product.type === "pass_premium") {
    const now = new Date();
    const season = await tx.season.findFirst({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
    });
    if (!season) throw new AppError(400, "Nenhuma temporada ativa no momento");
    await tx.seasonPass.upsert({
      where: { seasonId_userId: { seasonId: season.id, userId } },
      update: { isPremium: true },
      create: { seasonId: season.id, userId, isPremium: true },
    });
    return { amount: 1, message: "Passe Premium da temporada ativa" };
  }

  if (product.type === "enchantment") {
    if (!product.enchantmentId) throw new AppError(400, "Produto sem encantamento vinculado");
    await tx.userEnchantment.upsert({
      where: { userId_enchantmentId: { userId, enchantmentId: product.enchantmentId } },
      create: { userId, enchantmentId: product.enchantmentId, quantity: 1 },
      update: { quantity: { increment: 1 } },
    });
    return { amount: 1, message: "Encantamento adquirido" };
  }

  throw new AppError(400, "Produto inválido");
}

export function createShopModule(app: Express): void {
  // Catálogo público da loja
  app.get("/api/shop", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await prisma.shopProduct.findMany({
        where: { isActive: true },
        include: { enchantment: true },
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      });
      res.json(products);
    } catch (err) {
      next(err);
    }
  });

  // Compra: custo em diamantes (deduz na hora) ou em dinheiro (mock até integrar gateway).
  app.post("/api/shop/purchase/:productId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await prisma.shopProduct.findUnique({ where: { id: req.params.productId } });
      if (!product || !product.isActive) throw new AppError(404, "Produto não encontrado");

      if (product.currency === "diamond") {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          select: { diamonds: true },
        });
        if (!user || user.diamonds < product.price) {
          throw new AppError(400, `Saldo insuficiente — custa ${product.price} diamantes`);
        }
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: req.user!.userId },
            data: { diamonds: { decrement: product.price } },
          });
          await applyProduct(tx, req.user!.userId, product);
          await tx.shopOrder.create({
            data: {
              userId: req.user!.userId,
              productId: product.id,
              type: product.type,
              amount: product.type === "vip" ? product.vipDays : product.type === "diamond_pack" ? product.diamondAmount : 1,
              price: product.price,
              currency: "diamond",
              status: "paid",
            },
          });
        });
        res.json({ message: "Compra realizada!", detail: product.name });
        return;
      }

      if (product.currency === "gold") {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          select: { gold: true },
        });
        if (!user || Number(user.gold) < product.price) {
          throw new AppError(400, `Ouro insuficiente — custa ${product.price} de ouro`);
        }
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: req.user!.userId },
            data: { gold: { decrement: product.price } },
          });
          await applyProduct(tx, req.user!.userId, product);
          await tx.shopOrder.create({
            data: {
              userId: req.user!.userId,
              productId: product.id,
              type: product.type,
              amount: 1,
              price: product.price,
              currency: "gold",
              status: "paid",
            },
          });
        });
        res.json({ message: "Compra realizada!", detail: product.name });
        return;
      }

      // Produtos em dinheiro real (diamond packs, VIP, premium): checkout simulado.
      const config = await getShopConfig();
      if (!config.mockPayments) {
        throw new AppError(400, "Pagamentos ainda não configurados — tente de novo mais tarde");
      }
      await prisma.$transaction(async (tx) => {
        await applyProduct(tx, req.user!.userId, product);
        await tx.shopOrder.create({
          data: {
            userId: req.user!.userId,
            productId: product.id,
            type: product.type,
            amount: product.type === "vip" ? product.vipDays : product.type === "diamond_pack" ? product.diamondAmount : 1,
            price: product.price,
            currency: "money",
            status: "paid",
          },
        });
      });
      res.json({
        message: "Compra simulada realizada!",
        detail: product.name,
        note: "Checkout simulado — integre o gateway de pagamento quando for monetizar.",
      });
    } catch (err) {
      next(err);
    }
  });

  // Histórico do jogador
  app.get("/api/shop/orders", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await prisma.shopOrder.findMany({
        where: { userId: req.user!.userId },
        include: { product: { include: { enchantment: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      res.json(orders);
    } catch (err) {
      next(err);
    }
  });
}
