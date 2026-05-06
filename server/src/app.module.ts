import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/auth/auth-guard';
import { AuthGuardModule } from './common/auth/auth-guard.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './features/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthGuardModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (authGuard: AuthGuard) => authGuard,
      inject: [AuthGuard],
    },
  ],
})
export class AppModule {}
