import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';
import { QuestEntity } from './quest.entity';

export enum QuestStatus {
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed',
  FAILED = 'failed',
}

@Entity('quest_progress')
@Unique(['userId', 'questId'])
export class QuestProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => QuestEntity)
  @JoinColumn({ name: 'questId' })
  quest: QuestEntity;

  @Column()
  questId: string;

  @Column({
    type: 'enum',
    enum: QuestStatus,
    default: QuestStatus.AVAILABLE,
  })
  status: QuestStatus;

  @Column('simple-json', { default: [] })
  progress: Array<{
    objectiveIndex: number;
    current: number;
    completed: boolean;
  }>;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  claimedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
