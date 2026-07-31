import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../shared/logger';

interface CombatAction {
  characterId: string;
  targetId: string;
  skillId: string;
  action: 'attack' | 'skill' | 'defend' | 'item' | 'flee';
  itemId?: string;
}

interface CombatUpdate {
  combatId: string;
  attackerId: string;
  defenderId: string;
  action: string;
  damage: number;
  healing: number;
  isCrit: boolean;
  isDodge: boolean;
  isBlock: boolean;
  attackerHp: number;
  attackerMaxHp: number;
  defenderHp: number;
  defenderMaxHp: number;
  activeBuffs: any[];
  activeDebuffs: any[];
  message: string;
  timestamp: Date;
}

export class CombatGateway {
  private activeCombats: Map<string, Set<string>> = new Map();
  private combatTimers: Map<string, NodeJS.Timeout> = new Map();

  initialize(io: SocketIOServer): void {
    const combatNamespace = io.of('/combat');

    combatNamespace.on('connection', (socket: Socket) => {
      logger.info(`Combat client connected: ${socket.id}`);

      socket.on('combat:start', (data: { characterId: string; targetId: string }) => {
        this.handleCombatStart(socket, data);
      });

      socket.on('combat:action', (data: CombatAction) => {
        this.handleCombatAction(socket, data);
      });

      socket.on('combat:leave', (data: { characterId: string }) => {
        this.handleCombatLeave(socket, data);
      });

      socket.on('combat:join', (data: { combatId: string }) => {
        this.handleCombatJoin(socket, data);
      });

      socket.on('disconnect', () => {
        logger.info(`Combat client disconnected: ${socket.id}`);
      });
    });
  }

  private handleCombatStart(socket: Socket, data: { characterId: string; targetId: string }): void {
    const combatId = `combat:${data.characterId}:${data.targetId}`;
    
    if (!this.activeCombats.has(combatId)) {
      this.activeCombats.set(combatId, new Set());
    }
    
    this.activeCombats.get(combatId)!.add(socket.id);
    socket.join(combatId);

    const combatUpdate: CombatUpdate = {
      combatId,
      attackerId: data.characterId,
      defenderId: data.targetId,
      action: 'ENGAGE',
      damage: 0,
      healing: 0,
      isCrit: false,
      isDodge: false,
      isBlock: false,
      attackerHp: 100,
      attackerMaxHp: 100,
      defenderHp: 100,
      defenderMaxHp: 100,
      activeBuffs: [],
      activeDebuffs: [],
      message: 'Combat has begun!',
      timestamp: new Date(),
    };

    combatNamespace.to(combatId).emit('combat:started', combatUpdate);
    logger.info(`Combat started: ${combatId}`);
  }

  private handleCombatAction(socket: Socket, data: CombatAction): void {
    const combatId = `combat:${data.characterId}:${data.targetId}`;

    const combatUpdate: CombatUpdate = {
      combatId,
      attackerId: data.characterId,
      defenderId: data.targetId,
      action: data.action.toUpperCase(),
      damage: Math.floor(Math.random() * 50) + 10,
      healing: 0,
      isCrit: Math.random() < 0.15,
      isDodge: Math.random() < 0.05,
      isBlock: Math.random() < 0.1,
      attackerHp: 85,
      attackerMaxHp: 100,
      defenderHp: 70,
      defenderMaxHp: 100,
      activeBuffs: [],
      activeDebuffs: [],
      message: `${data.characterId} uses ${data.skillId}!`,
      timestamp: new Date(),
    };

    combatNamespace.to(combatId).emit('combat:update', combatUpdate);
  }

  private handleCombatLeave(socket: Socket, data: { characterId: string }): void {
    this.activeCombats.forEach((members, combatId) => {
      if (combatId.includes(data.characterId)) {
        members.delete(socket.id);
        combatNamespace.to(combatId).emit('combat:ended', {
          combatId,
          reason: 'Character fled',
          timestamp: new Date(),
        });
        if (members.size === 0) {
          this.activeCombats.delete(combatId);
        }
      }
    });
    socket.leaveAll();
  }

  private handleCombatJoin(socket: Socket, data: { combatId: string }): void {
    if (this.activeCombats.has(data.combatId)) {
      this.activeCombats.get(data.combatId)!.add(socket.id);
      socket.join(data.combatId);
      combatNamespace.to(data.combatId).emit('combat:player_joined', {
        combatId: data.combatId,
        playerId: socket.id,
        timestamp: new Date(),
      });
    }
  }

  getActiveCombatCount(): number {
    return this.activeCombats.size;
  }
}

export const combatGateway = new CombatGateway();
