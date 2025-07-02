import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() body: { email: string; password: string; firstName?: string; lastName?: string }) {
        return this.authService.signup(body);
    }

    @Post('login')
    login(@Body() body: { email: string; password: string }) {
        return this.authService.loginWithEmail(body.email, body.password);
    }

    @Post('google')
    google(@Body() body: GoogleLoginDto) {
        return this.authService.loginWithGoogle(body.idToken);
    }

    @Post('forgot-password')
        async forgotPassword(@Body() { email }: { email: string }): Promise<void> {
            return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    async resetPassword(
        @Body() { token, password }: { token: string; password: string }
    ): Promise<void> {
        return this.authService.resetPassword(token, password);
    }
}
