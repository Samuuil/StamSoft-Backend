import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { AuthService } from './auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      scope: 'email',
      profileFields: ['id', 'emails', 'name'], // request email, name
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const { emails, name, id } = profile;
    const email = emails?.[0]?.value;

    return this.authService.loginWithFacebook({
      facebookId: id,
      email,
      firstName: name?.givenName,
      lastName: name?.familyName,
    });
  }
}
