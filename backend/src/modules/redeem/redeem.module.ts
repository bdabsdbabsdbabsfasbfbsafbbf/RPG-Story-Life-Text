import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

export function createRedeemModule(app: Express): void {
  // Redeem a promo code: gold, diamonds, xp and/or items
  app.post("/api/redeem", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawCode = typeof req.body.code === "string" ? req.body.code.trim().toUpperCase() : "";
      if (!rawCode) throw new AppError(400, "Code required");

      const code = await prisma.redeemCode.findUnique({ where: { code: rawCode } });
      if (!code) throw new AppError(404, "Code not found");
      if (!code.isActive) throw new AppError(400, "Code is inactive");
      if (code.expiresAt && code.expiresAt < new Date()) {
        throw new AppError(400, "Code has expired");
      }
      if (code.uses >= code.maxUses) throw new AppError(400, "Code has reached its usage limit");

      const already = await prisma.redeemRedemption.findUnique({
        where: { codeId_userId: { codeId: code.id, userId: req.user!.userId } },
      });
      if (already) throw new AppError(409, "Code already redeemed by this account");

      const grantedItems: { name: string; quantity: number }[] = [];
      const result = await prisma.$transaction(async (tx) => {
        await tx.redeemRedemption.create({
          data: { codeId: code.id, userId: req.user!.userId },
        });
        await tx.redeemCode.update({
          where: { id: code.id },
          data: { uses: { increment: 1 } },
        });

        await tx.user.update({
          where: { id: req.user!.userId },
          data: {
            gold: { increment: Number(code.gold) },
            diamonds: { increment: code.diamonds },
            experience: { increment: Number(code.experience) },
          },
        });

        const rawItems = Array.isArray(code.items) ? (code.items as any[]) : [];
        for (const entry of rawItems) {
          const name = typeof entry?.itemName === "string" ? entry.itemName : "";
          const quantity = Number(entry?.quantity) || 1;
          if (!name) continue;
          const item = await tx.item.findFirst({ where: { name, isActive: true } });
          if (!item) continue;
          const existing = await tx.inventory.findFirst({
            where: { userId: req.user!.userId, itemId: item.id, slotIndex: null },
          });
          if (existing) {
            await tx.inventory.update({
              where: { id: existing.id },
              data: { quantity: { increment: quantity } },
            });
          } else {
            await tx.inventory.create({
              data: { userId: req.user!.userId, itemId: item.id, quantity },
            });
          }
          grantedItems.push({ name: item.name, quantity });
        }

        return {
          gold: Number(code.gold),
          diamonds: code.diamonds,
          experience: Number(code.experience),
        };
      });

      res.json({ ...result, items: grantedItems });
    } catch (err) {
      next(err);
    }
  });
}
