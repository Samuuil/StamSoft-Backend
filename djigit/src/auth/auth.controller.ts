import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'User signup' })
    @ApiBody({ schema: { example: { email: 'user@example.com', password: 'Password123', firstName: 'John', lastName: 'Doe' }}})
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({ status: 409, description: 'Email already in use.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('signup')
    signup(@Body() body: { email: string; password: string; firstName?: string; lastName?: string }) {
        return this.authService.signup(body);
    }

    @ApiOperation({ summary: 'User login' })
    @ApiBody({ schema: { example: { email: 'user@example.com', password: 'Password123' }}})
    @ApiResponse({ status: 200, description: 'User successfully logged in.' })
    @ApiResponse({ status: 401, description: 'No user found with this email or incorrect password.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('login')
    login(@Body() body: { email: string; password: string }) {
        return this.authService.loginWithEmail(body.email, body.password);
    }

    @ApiOperation({ summary: 'Google login' })
    @ApiBody({ schema: { example: { idToken: 'google-oauth-token' }}})
    @ApiResponse({ status: 200, description: 'User successfully logged in with Google.' })
    @ApiResponse({ status: 401, description: 'Invalid Google token or Google token missing email.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('google')
    google(@Body() body: GoogleLoginDto) {
        return this.authService.loginWithGoogle(body.idToken);
    }

    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({ schema: { example: { email: 'user@example.com' }}})
    @ApiResponse({ status: 200, description: 'Password reset email sent.' })
    @ApiResponse({ status: 401, description: 'No user found for email.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('forgot-password')
        async forgotPassword(@Body() { email }: { email: string }): Promise<void> {
            return this.authService.forgotPassword(email);
    }

    @ApiOperation({ summary: 'Reset password' })
    @ApiBody({ schema: { example: { token: 'reset-token', password: 'newPassword' }}})
    @ApiResponse({ status: 200, description: 'Password successfully reset.' })
    @ApiResponse({ status: 401, description: 'No user found for email or invalid/expired token.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('reset-password')
    async resetPassword(
        @Body() { token, password }: { token: string; password: string }
    ): Promise<void> {
        return this.authService.resetPassword(token, password);
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookLogin() {
        // initiates redirect to Facebook
    }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookCallback(@Req() req) {
        // successful login: return user + token
        return req.user;
    }
}
