import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'User signup' })
    @ApiBody({ schema: { example: { email: 'user@example.com', password: 'Password123', firstName: 'John', lastName: 'Doe' }}})
    @ApiCreatedResponse({ description: 'User successfully registered.', schema: { example: { accessToken: 'jwt.token.here', user: { id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe' } } } })
    @ApiResponse({ status: 409, description: 'Email already in use.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('signup')
    signup(@Body() body: { email: string; password: string; firstName?: string; lastName?: string }) {
        return this.authService.signup(body);
    }

    @ApiOperation({ summary: 'User login' })
    @ApiBody({ schema: { example: { email: 'user@example.com', password: 'Password123' }}})
    @ApiCreatedResponse({ description: 'User successfully logged in.', schema: { example: { accessToken: 'jwt.token.here', user: { id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe' } } } })
    @ApiResponse({ status: 401, description: 'No user found with this email.' })
    @ApiResponse({ status: 401, description: 'Incorrect password.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('login')
    login(@Body() body: { email: string; password: string }) {
        return this.authService.loginWithEmail(body.email, body.password);
    }

    @ApiOperation({ summary: 'Google login' })
    @ApiBody({ schema: { example: { idToken: 'google-oauth-token' }}})
    @ApiOkResponse({ description: 'User successfully logged in with Google.', schema: { example: { accessToken: 'jwt.token.here', user: { id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe' } } } })
    @ApiResponse({ status: 401, description: 'Invalid Google token or Google token missing email.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('google')
    google(@Body() body: GoogleLoginDto) {
        return this.authService.loginWithGoogle(body.idToken);
    }

    @ApiOperation({ summary: 'Request password reset' })
    @ApiBody({ schema: { example: { email: 'user@example.com' }}})
    @ApiOkResponse({ description: 'Password reset email sent.', schema: { example: { message: 'Password reset email sent.' } } })
    @ApiResponse({ status: 401, description: 'No user found for email.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('forgot-password')
        async forgotPassword(@Body() { email }: { email: string }): Promise<void> {
            return this.authService.forgotPassword(email);
    }

    @ApiOperation({ summary: 'Reset password' })
    @ApiBody({ schema: { example: { token: 'reset-token', password: 'newPassword' }}})
    @ApiOkResponse({ description: 'Password successfully reset.', schema: { example: { message: 'Password successfully reset.' } } })
    @ApiResponse({ status: 401, description: 'No user found for email or invalid/expired token.' })
    @ApiResponse({ status: 400, description: 'Validation error.' })
    @Post('reset-password')
    async resetPassword(
        @Body() { token, password }: { token: string; password: string }
    ): Promise<void> {
        return this.authService.resetPassword(token, password);
    }

    @ApiOperation({ summary: 'Initiate Facebook login (redirects to Facebook)' })
    @ApiResponse({ status: 302, description: 'Redirect to Facebook for authentication.' })
    @ApiResponse({ status: 401, description: 'Unauthorized. Facebook authentication failed.' })
    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookLogin() {
        // initiates redirect to Facebook
    }

    @ApiOperation({ summary: 'Facebook login callback' })
    @ApiOkResponse({ description: 'User successfully logged in with Facebook.', schema: { example: { accessToken: 'jwt.token.here', user: { id: 1, email: 'user@example.com', firstName: 'John', lastName: 'Doe' } } } })
    @ApiResponse({ status: 401, description: 'Unauthorized. Facebook authentication failed.' })
    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookCallback(@Req() req) {
        // successful login: return user + token
        return req.user;
    }

    @Post('refresh')
    async refresh(@Body() body: { userId: number; refreshToken: string }) {
        console.log(body.refreshToken);
        return this.authService.refreshTokens(body.userId, body.refreshToken);
    }

    @ApiOperation({ summary: 'User logout' })
    @ApiBody({ schema: { example: { userId: 1 }}})
    @ApiOkResponse({ description: 'User successfully logged out.', schema: { example: { message: 'User successfully logged out.' } } })
    @Post('logout')
    async logout(@Body() body: { userId: number }) {
        await this.authService.logout(body.userId);
        return { message: 'User successfully logged out.' };
    }
}
