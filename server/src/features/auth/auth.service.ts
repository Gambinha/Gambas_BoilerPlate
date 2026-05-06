import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptoUtil } from '../../common/auxiliares/util/crypto.util';
import { UsersService } from '../users/users.service';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new HttpException(
        'User or Password incorrect!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordValid = await CryptoUtil.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'User or Password incorrect!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const payload: AuthDto = {
      id: user.id,
      email: user.email,
      username: user.name,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(signupDto.email);

    if (existingUser) {
      throw new HttpException(
        'User already exists',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashedPassword = await CryptoUtil.hash(signupDto.password);
    await this.usersService.create({
      name: signupDto.name,
      email: signupDto.email,
      password: hashedPassword,
    });

    return { message: 'User created successfully' };
  }
}
