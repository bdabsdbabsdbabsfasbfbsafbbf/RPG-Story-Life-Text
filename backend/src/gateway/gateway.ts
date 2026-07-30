import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../core/config";
import { CombatService } from "../modules/combat/combat.service";
import { CooldownManager } from "../modules/combat/cooldown.manager";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  role?: string;
  currentCharacterId?: string;
  currentMapId?: string;
  partyId?: string;
}

export function createGateway(
  io: SocketIOServer,
  combatService: CombatService,
  cooldownManager: CooldownManager
): void {
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = jwt.verify(token as string, config.jwt.secret) as any;
      socket.userId = payload.userId;
      socket.username = payload.username;
      socket.role = payload.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`[WS] User connected: ${socket.username} (${socket.id})`);

    socket.join(`user:${socket.userId}`);

    socket.on("character:select", async (characterId: string) => {
      socket.currentCharacterId = characterId;
      socket.join(`character:${characterId}`);
      socket.emit("character:selected", { characterId });
    });

    socket.on("map:join", async (mapId: string) => {
      if (socket.currentMapId) {
        socket.leave(`map:${socket.currentMapId}`);
      }
      socket.currentMapId = mapId;
      socket.join(`map:${mapId}`);
      socket.to(`map:${mapId}`).emit("player:joined", {
        userId: socket.userId,
        username: socket.username,
      });
      socket.emit("map:joined", { mapId });
    });

    socket.on("map:leave", () => {
      if (socket.currentMapId) {
        socket.to(`map:${socket.currentMapId}`).emit("player:left", {
          userId: socket.userId,
          username: socket.username,
        });
        socket.leave(`map:${socket.currentMapId}`);
        socket.currentMapId = undefined;
      }
    });

    socket.on("chat:message", async (data: { channel: string; message: string; targetId?: string }) => {
      if (!data.message?.trim()) return;

      const channel = data.channel;
      const message = data.message.trim();

      let room = `chat:${channel}`;
      if (channel === "whisper" && data.targetId) {
        room = `user:${data.targetId}`;
      } else if (channel === "party" && socket.partyId) {
        room = `party:${socket.partyId}`;
      } else if (channel === "guild") {
        room = `guild:${socket.userId}`;
      } else if (channel === "local" && socket.currentMapId) {
        room = `map:${socket.currentMapId}`;
      }

      const chatPayload = {
        userId: socket.userId,
        username: socket.username,
        channel,
        message,
        timestamp: Date.now(),
      };

      if (channel === "global") {
        io.to("global").emit("chat:message", chatPayload);
      } else {
        io.to(room).emit("chat:message", chatPayload);
      }
    });

    socket.on("combat:start", async (data: { monsterId: string }) => {
      if (!socket.currentCharacterId) return;
      try {
        const result = await combatService.startCombat(socket.currentCharacterId, data.monsterId);
        socket.emit("combat:started", result);
      } catch (err: any) {
        socket.emit("combat:error", { message: err.message });
      }
    });

    socket.on("combat:useSkill", async (data: { combatId: string; skillId: string }) => {
      if (!socket.currentCharacterId) return;
      try {
        const result = await combatService.useSkill(socket.currentCharacterId, data.combatId, data.skillId);
        socket.emit("combat:skillUsed", result);
        socket.to(`combat:${data.combatId}`).emit("combat:update", result);
      } catch (err: any) {
        socket.emit("combat:error", { message: err.message });
      }
    });

    socket.on("party:invite", async (data: { targetUserId: string }) => {
      io.to(`user:${data.targetUserId}`).emit("party:invite", {
        fromUserId: socket.userId,
        fromUsername: socket.username,
      });
    });

    socket.on("party:join", async (data: { partyId: string }) => {
      socket.partyId = data.partyId;
      socket.join(`party:${data.partyId}`);
      socket.to(`party:${data.partyId}`).emit("party:memberJoined", {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on("subscribe:character", () => {
      if (socket.currentCharacterId) {
        socket.join(`character:${socket.currentCharacterId}`);
      }
    });

    socket.on("subscribe:cooldowns", () => {
      if (socket.currentCharacterId) {
        socket.join(`cooldowns:${socket.currentCharacterId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[WS] User disconnected: ${socket.username} (${socket.id})`);
      if (socket.currentMapId) {
        socket.to(`map:${socket.currentMapId}`).emit("player:left", {
          userId: socket.userId,
          username: socket.username,
        });
      }
    });
  });

  io.on("connect_error", (err) => {
    console.error(`[WS] Connection error:`, err.message);
  });
}
