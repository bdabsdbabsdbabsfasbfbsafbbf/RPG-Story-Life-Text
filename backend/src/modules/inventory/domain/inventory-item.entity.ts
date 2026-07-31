import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';
import { EquipmentEntity } from '../../equipment/domain/equipment.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => EquipmentEntity)
  @JoinColumn({ name: 'equipmentId' })
  equipment: EquipmentEntity;

  @Column()
  equipmentId: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ default: false })
  isEquipped: boolean;

  @Column({ nullable: true })
  slot: string;

  @Column({ default: false })
  isFavorite: boolean;

  @Column('simple-json', { nullable: true })
  customData: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
