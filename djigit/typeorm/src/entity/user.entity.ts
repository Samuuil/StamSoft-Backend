import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Car } from './car.entity';
import { Report } from './report.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @OneToMany(() => Car, (car) => car.owner)
  cars: Car[];

  @OneToMany(() => Report, (report) => report.reportedBy)
  reports: Report[];

  @Column({ nullable: true })
  refreshToken?: string | null;
}
