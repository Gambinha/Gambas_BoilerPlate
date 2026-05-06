import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ENV_CONFIG } from '../env-config';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../../features/users/users.module';
import { AuthGuard } from './auth-guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: ENV_CONFIG.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
    UsersModule,
  ],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthGuardModule {}
