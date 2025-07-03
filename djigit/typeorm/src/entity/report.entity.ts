import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  licensePlate: string;

  @Column()
  description: string;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column( {nullable: true})
  imageUrl?: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'SET NULL' })
  reportedBy: User;
}

