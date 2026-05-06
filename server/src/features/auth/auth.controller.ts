import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthInfos } from '../../common/auth/decorators/auth-infos';
import { IsPublic } from '../../common/auth/decorators/is-public';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ProfileDto } from './dto/profile.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    console.log('loginDto', loginDto);
    return this.authService.login(loginDto);
  }

  @IsPublic()
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    console.log('signupDto', signupDto);
    return this.authService.signup(signupDto);
  }

  @Get('profile/me')
  getProfile(@AuthInfos() profile: ProfileDto) {
    console.log('getProfile', profile);
    return profile;
  }
}
