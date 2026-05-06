import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthDto } from '../../features/auth/dto/auth.dto';
import { ProfileDto } from '../../features/auth/dto/profile.dto';
import { UsersService } from '../../features/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('canActivate');
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(isPublic);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    console.log(token);

    if (!token) {
      throw new HttpException(
        'Unauthorized, token not found',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const payload: AuthDto = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      console.log(payload);

      const user = await this.userService.findOne(payload.id);

      console.log(user);

      if (!user) {
        throw new HttpException(
          'Unauthorized, user not found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const profile: ProfileDto = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      request['profile'] = profile;
    } catch (e) {
      throw new HttpException(
        'Unauthorized, erro when verifiyng JWT',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
