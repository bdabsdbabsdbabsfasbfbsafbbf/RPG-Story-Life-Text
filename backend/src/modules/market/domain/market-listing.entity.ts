import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';
import { EquipmentEntity } from '../../equipment/domain/equipment.entity';

export enum ListingType {
  SELL = 'sell',
  AUCTION = 'auction',
  WANTED = 'wanted',
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('market_listings')
export class MarketListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  sellerId: string;

  @Column({ nullable: true })
  buyerId: string;

  @ManyToOne(() => EquipmentEntity)
  @JoinColumn({ name: 'equipmentId' })
  equipment: EquipmentEntity;

  @Column()
  equipmentId: string;

  @Column({
    type: 'enum',
    enum: ListingType,
    default: ListingType.SELL,
  })
  listingType: ListingType;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status: ListingStatus;

  @Column({ default: 0 })
  price: number;

  @Column({ nullable: true })
  buyoutPrice: number;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
