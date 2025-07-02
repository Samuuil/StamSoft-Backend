import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'User signup' })
    @ApiBody({ schema: { example: { email: 'user@example.com', password: 'Password123', firstName: 'John', lastName: 'Doe' }}})
    @Post('signup')
    signup(@Body() body: { email: string; password: string; firstName?: string; lastName?: string }) {
        return this.authService.signup(body);
    }

    @ApiOperation({ summary: 'User login' })
    @ApiBody({ schema: { example: { email: 'user@example.com', password: 'Password123' }}})
    @Post('login')
    login(@Body() body: { email: string; password: string }) {
        return this.authService.loginWithEmail(body.email, body.password);
    }

    @ApiOperation({ summary: 'Google login' })
    @ApiBody({ schema: { example: { idToken: 'google-oauth-token' }}})
    @Post('google')
    google(@Body() body: GoogleLoginDto) {
        return this.authService.loginWithGoogle(body.idToken);
    }

    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({ schema: { example: { email: 'user@example.com' }}})
    @Post('forgot-password')
        async forgotPassword(@Body() { email }: { email: string }): Promise<void> {
            return this.authService.forgotPassword(email);
    }

    @ApiOperation({ summary: 'Reset password' })
    @ApiBody({ schema: { example: { token: 'reset-token', password: 'newPassword' }}})
    @Post('reset-password')
    async resetPassword(
        @Body() { token, password }: { token: string; password: string }
    ): Promise<void> {
        return this.authService.resetPassword(token, password);
    }
}
