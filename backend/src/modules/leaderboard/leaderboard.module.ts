import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";

const LIMIT = 50;

export function createLeaderboardModule(app: Express): void {
  // Ranking global de jogadores pelo melhor personagem de cada usuário
  app.get("/api/leaderboard", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const characters = await prisma.character.findMany({
        orderBy: [{ level: "desc" }, { experience: "desc" }],
        include: {
          user: { select: { id: true, username: true, displayName: true, gold: true, diamonds: true, vipUntil: true } },
          class: { select: { name: true, slug: true, icon: true } },
        },
      });

      // Melhor personagem de cada usuário (primeiro na ordenação já é o maior nível/XP)
      const bestByUser = new Map<string, (typeof characters)[number]>();
      for (const c of characters) {
        if (!bestByUser.has(c.userId)) bestByUser.set(c.userId, c);
      }

      const entries = [...bestByUser.values()].slice(0, LIMIT).map((c, i) => ({
        position: i + 1,
        username: c.user.username,
        displayName: c.user.displayName || c.user.username,
        characterName: c.name,
        className: c.class?.name ?? null,
        classSlug: c.class?.slug ?? null,
        classIcon: c.class?.icon ?? null,
        level: c.level,
        experience: Number(c.experience),
        pvpKills: c.pvpKills,
        gold: Number(c.user.gold),
        diamonds: c.user.diamonds,
        isVip: !!(c.user.vipUntil && new Date(c.user.vipUntil).getTime() > Date.now()),
      }));

      const myCharacter = bestByUser.get(req.user!.userId);
      const myRank = myCharacter
        ? entries.findIndex((e) => e.characterName === myCharacter.name && e.username === myCharacter.user.username) + 1
        : null;

      res.json({ entries, myRank });
    } catch (err) {
      next(err);
    }
  });
}
