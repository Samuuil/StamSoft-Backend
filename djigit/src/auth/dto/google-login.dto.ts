import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
    @ApiProperty({ example: 'google-oauth-token' })
    idToken: string;
}