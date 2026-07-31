import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

@Entity('maps')
export class MapEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  backgroundUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 1 })
  requiredLevel: number;

  @Column({ default: 0 })
  requiredRank: number;

  @Column('simple-json', { nullable: true })
  teleports: Array<{
    mapId: string;
    name: string;
    cost: number;
    requiredLevel: number;
  }>;

  @Column('simple-json', { nullable: true })
  npcs: string[];

  @Column('simple-json', { nullable: true })
  monsters: Array<{
    id: string;
    name: string;
    level: number;
    respawnTime: number;
    spawnLimit: number;
    drops: Array<{ itemId: string; chance: number; quantity: number }>;
  }>;

  @Column('simple-json', { nullable: true })
  bosses: Array<{
    id: string;
    name: string;
    level: number;
    respawnTime: number;
    drops: Array<{ itemId: string; chance: number; quantity: number }>;
  }>;

  @Column('simple-json', { nullable: true })
  shops: Array<{
    npcId: string;
    items: Array<{ itemId: string; price: number; currency: string }>;
  }>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
