import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ProfileDto } from '../../../features/auth/dto/profile.dto';

export const AuthInfos = createParamDecorator(
  (_, ctx: ExecutionContext): ProfileDto => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { profile: ProfileDto }>();
    return request['profile'];
  },
);
