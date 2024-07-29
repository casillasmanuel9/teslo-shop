import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator((data, cxt: ExecutionContext) => {
  const req = cxt.switchToHttp().getRequest();
  const user = req.user;
  if (!user) {
    throw new InternalServerErrorException('User not found in request');
  }
  return !data ? (user as User) : (user as User)[data];
});
