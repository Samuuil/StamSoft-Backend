import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ unique: true })
  licensePlate: string;

  @ManyToOne(() => User, (user) => user.cars, { onDelete: 'CASCADE' })
  owner: User;
}
