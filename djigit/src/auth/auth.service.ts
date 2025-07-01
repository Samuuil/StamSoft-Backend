import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../typeorm/src/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const hash = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({ ...data, password: hash });
    await this.userRepo.save(user);
    return this.login(user);
  }

  async loginWithEmail(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.login(user);
  }

  private login(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
