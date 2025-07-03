import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../typeorm/src/entity/user.entity';
import { Car } from '../../typeorm/src/entity/car.entity'; 
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
    private google: OAuth2Client;

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Car)
        private carRepo: Repository<Car>,
        private jwtService: JwtService,
        private config: ConfigService,
        private emailService: EmailService
    ) {
        this.google = new OAuth2Client();
      }

    async loginWithGoogle(idToken: string) {
        const ticket = await this.google.verifyIdToken({
        idToken,
        audience: [
            this.config.get<string>('GOOGLE_CLIENT_ID_WEB')!,
            this.config.get<string>('GOOGLE_CLIENT_ID_ANDROID')!,
            this.config.get<string>('GOOGLE_CLIENT_ID_IOS')!,
        ],
        });

        if (!ticket) {
            throw new UnauthorizedException('Invalid Google token');
        }

        const { email, given_name, family_name } = ticket.getPayload() || {};

        if (!email) throw new UnauthorizedException('Google token missing e‑mail');

        let user = await this.userRepo.findOne({ where: { email } });

        if (!user) {
            user = this.userRepo.create({
                email,
                firstName: given_name,
                lastName: family_name,
                password: "",
            });
            await this.userRepo.save(user);
        }

        return this.login(user);
   }

   async signup(data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        car?: {
        brand: string;
        model: string;
        licensePlate: string;
      };
    }) {
        const existing = await this.userRepo.findOne({ where: { email: data.email } });
        if (existing) {
        throw new UnauthorizedException('Email already in use');
        }

        if (data.car) {
          const existingCar = await this.carRepo.findOne({ where: { licensePlate: data.car.licensePlate } });
          if (existingCar) {
            throw new BadRequestException('A car with this license plate already exists.');
          }
        }

        const hash = await bcrypt.hash(data.password, 10);
        const user = this.userRepo.create({
        email: data.email,
        password: hash,
        firstName: data.firstName,
        lastName: data.lastName,
        });

        await this.userRepo.save(user);

        if (data.car) {
        const car = this.carRepo.create({
            ...data.car,
            owner: user,
        });
        try {
          await this.carRepo.save(car);
        } catch (error) {
          if (error.code === '23505') {
            throw new BadRequestException('A car with this license plate already exists.');
          }
          throw error;
        }
        }

        return this.login(user);
    }

    async loginWithEmail(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('No user found with this email');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Incorrect password');
        }
        return this.login(user);
    }

    private async login(user: User) {
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
      
        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException(`No user found for email: ${email}`);
        }
        await this.emailService.sendResetPasswordLink(email);
    }

    async resetPassword(token: string, password: string): Promise<void> {
        const email = await this.emailService.decodeConfirmationToken(token);
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException(`No user found for email: ${email}`);
        }
        const hash = await bcrypt.hash(password, 10);
        user.password = hash;
        await this.userRepo.save(user);
    }

    async loginWithFacebook(data: {
        facebookId: string;
        email?: string;
        firstName?: string;
        lastName?: string;
    }) {
        let user = await this.userRepo.findOne({ where: { email: data.email } });
        
        if (!user) {
            user = this.userRepo.create({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: '',
            });
            await this.userRepo.save(user);
        }
        
        return this.login(user);
    }


    async generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email };
      
        const [accessToken, refreshToken] = await Promise.all([
          this.jwtService.signAsync(payload, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: '15m',
          }),
          this.jwtService.signAsync(payload, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
          }),
        ]);
      
        return { accessToken, refreshToken };
    }

    async updateRefreshToken(userId: number, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.userRepo.update(userId, { refreshToken: hash });
    }

    async refreshTokens(userId: number, refreshToken: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('User not found or no refresh token stored');
        }
        
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
      
      
}
