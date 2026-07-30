import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { generateToken } from '../infrastructure/JwtService';
import { config } from '../../../config';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existing = await prisma.player.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      throw new AppError('Usuário ou email já cadastrado', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const player = await prisma.player.create({
      data: {
        username,
        email,
        password: hashedPassword,
        mapId: 'map-battleon',
        serverId: 'server-bra1',
        stats: {
          create: {
            hp: 100, maxHp: 100, mana: 50, maxMana: 50,
            stamina: 100, maxStamina: 100,
            attack: 5, defense: 5, magic: 5, magicDefense: 5,
            criticalChance: 5, criticalDamage: 150,
          },
        },
      },
      include: { stats: true },
    });

    const token = await generateToken({
      playerId: player.id,
      username: player.username,
    });

    res.status(201).json({ player, token });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao registrar', 500);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const player = await prisma.player.findUnique({ where: { email } });
    if (!player || !player.password) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const validPassword = await bcrypt.compare(password, player.password);
    if (!validPassword) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = await generateToken({
      playerId: player.id,
      username: player.username,
    });

    res.json({ player, token });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao fazer login', 500);
  }
});

// GET /api/auth/discord
router.get('/discord', (req: Request, res: Response) => {
  const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientId}&redirect_uri=${encodeURIComponent(config.discord.callbackUrl)}&response_type=code&scope=identify%20email`;
  res.redirect(discordUrl);
});

// GET /api/auth/discord/callback
router.get('/discord/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) throw new AppError('Código de autorização não fornecido', 400);

    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.discord.clientId,
        client_secret: config.discord.clientSecret,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: config.discord.callbackUrl,
      }),
    });

    const tokenData = await tokenResponse.json();

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const discordUser = await userResponse.json();

    // Find or create player
    let player = await prisma.player.findUnique({
      where: { discordId: discordUser.id },
    });

    if (!player) {
      player = await prisma.player.create({
        data: {
          username: discordUser.username,
          email: discordUser.email || `${discordUser.id}@discord.com`,
          discordId: discordUser.id,
          avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
          mapId: 'map-battleon',
          serverId: 'server-bra1',
          stats: {
            create: {
              hp: 100, maxHp: 100, mana: 50, maxMana: 50,
              stamina: 100, maxStamina: 100,
              attack: 5, defense: 5, magic: 5, magicDefense: 5,
              criticalChance: 5, criticalDamage: 150,
            },
          },
        },
        include: { stats: true },
      });
    }

    const jwt = await generateToken({
      playerId: player.id,
      username: player.username,
    });

    res.redirect(`http://localhost:5173/auth/callback?token=${jwt}`);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro na autenticação com Discord', 500);
  }
});

export default router;
