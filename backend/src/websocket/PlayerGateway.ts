import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../shared/logger';

interface PlayerStatus {
  characterId: string;
  characterName: string;
  level: number;
  class: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  mapId: string;
  x: number;
  y: number;
  isOnline: boolean;
  isInCombat: boolean;
  partyId?: string;
  guildId?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastUpdated: Date;
}

export class PlayerGateway {
  private connectedPlayers: Map<string, PlayerStatus> = new Map();
  private playerSockets: Map<string, Set<string>> = new Map();

  initialize(io: SocketIOServer): void {
    const playerNamespace = io.of('/player');

    playerNamespace.on('connection', (socket: Socket) => {
      logger.info(`Player client connected: ${socket.id}`);

      socket.on('player:online', (data: { characterId: string; characterName: string; level: number; class: string }) => {
        this.handlePlayerOnline(socket, data);
      });

      socket.on('player:offline', (data: { characterId: string }) => {
        this.handlePlayerOffline(socket, data);
      });

      socket.on('player:move', (data: { characterId: string; x: number; y: number; mapId: string }) => {
        this.handlePlayerMove(socket, data);
      });

      socket.on('player:status', (data: { characterId: string; status: string }) => {
        this.handlePlayerStatus(socket, data);
      });

      socket.on('player:update', (data: { characterId: string; stats: Partial<PlayerStatus> }) => {
        this.handlePlayerUpdate(socket, data);
      });

      socket.on('player:emote', (data: { characterId: string; emote: string }) => {
        this.handlePlayerEmote(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handlePlayerOnline(socket: Socket, data: { characterId: string; characterName: string; level: number; class: string }): void {
    const status: PlayerStatus = {
      characterId: data.characterId,
      characterName: data.characterName,
      level: data.level,
      class: data.class,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      mapId: 'town_01',
      x: 0,
      y: 0,
      isOnline: true,
      isInCombat: false,
      status: 'online',
      lastUpdated: new Date(),
    };

    this.connectedPlayers.set(data.characterId, status);

    if (!this.playerSockets.has(data.characterId)) {
      this.playerSockets.set(data.characterId, new Set());
    }
    this.playerSockets.get(data.characterId)!.add(socket.id);

    socket.join(`player:${data.characterId}`);

    const playerNamespace = socket.nsp;
    playerNamespace.emit('player:went_online', {
      characterId: data.characterId,
      characterName: data.characterName,
      level: data.level,
      class: data.class,
      timestamp: new Date(),
    });

    socket.emit('player:status_update', status);
    logger.info(`Player online: ${data.characterName} (${data.characterId})`);
  }

  private handlePlayerOffline(socket: Socket, data: { characterId: string }): void {
    const player = this.connectedPlayers.get(data.characterId);
    if (player) {
      player.isOnline = false;
      player.status = 'offline';
      player.lastUpdated = new Date();
    }

    const playerNamespace = socket.nsp;
    playerNamespace.emit('player:went_offline', {
      characterId: data.characterId,
      timestamp: new Date(),
    });

    this.connectedPlayers.delete(data.characterId);
    socket.leave(`player:${data.characterId}`);
    logger.info(`Player offline: ${data.characterId}`);
  }

  private handlePlayerMove(socket: Socket, data: { characterId: string; x: number; y: number; mapId: string }): void {
    const player = this.connectedPlayers.get(data.characterId);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      player.mapId = data.mapId;
      player.lastUpdated = new Date();

      const playerNamespace = socket.nsp;
      playerNamespace.to(`map:${data.mapId}`).emit('player:moved', {
        characterId: data.characterId,
        characterName: player.characterName,
        x: data.x,
        y: data.y,
        mapId: data.mapId,
        timestamp: new Date(),
      });
    }
  }

  private handlePlayerStatus(socket: Socket, data: { characterId: string; status: string }): void {
    const player = this.connectedPlayers.get(data.characterId);
    if (player && ['online', 'away', 'busy'].includes(data.status)) {
      player.status = data.status as PlayerStatus['status'];
      player.lastUpdated = new Date();

      const playerNamespace = socket.nsp;
      playerNamespace.emit('player:status_changed', {
        characterId: data.characterId,
        characterName: player.characterName,
        status: data.status,
        timestamp: new Date(),
      });
    }
  }

  private handlePlayerUpdate(socket: Socket, data: { characterId: string; stats: Partial<PlayerStatus> }): void {
    const player = this.connectedPlayers.get(data.characterId);
    if (player) {
      Object.assign(player, data.stats);
      player.lastUpdated = new Date();
      socket.emit('player:status_update', player);
    }
  }

  private handlePlayerEmote(socket: Socket, data: { characterId: string; emote: string }): void {
    const player = this.connectedPlayers.get(data.characterId);
    if (player) {
      const playerNamespace = socket.nsp;
      playerNamespace.to(`map:${player.mapId}`).emit('player:emote', {
        characterId: data.characterId,
        characterName: player.characterName,
        emote: data.emote,
        timestamp: new Date(),
      });
    }
  }

  private handleDisconnect(socket: Socket): void {
    this.playerSockets.forEach((sockets, characterId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          const player = this.connectedPlayers.get(characterId);
          if (player) {
            player.isOnline = false;
            player.status = 'offline';
          }
          this.playerSockets.delete(characterId);
          
          const playerNamespace = socket.nsp;
          playerNamespace.emit('player:went_offline', {
            characterId,
            timestamp: new Date(),
          });
        }
      }
    });
  }

  getOnlinePlayers(): PlayerStatus[] {
    return Array.from(this.connectedPlayers.values()).filter(p => p.isOnline);
  }

  getPlayer(characterId: string): PlayerStatus | undefined {
    return this.connectedPlayers.get(characterId);
  }

  getPlayersOnMap(mapId: string): PlayerStatus[] {
    return Array.from(this.connectedPlayers.values()).filter(
      p => p.isOnline && p.mapId === mapId
    );
  }

  getOnlineCount(): number {
    return this.getOnlinePlayers().length;
  }
}

export const playerGateway = new PlayerGateway();
