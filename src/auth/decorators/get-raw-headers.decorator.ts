import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetRawHeaders = createParamDecorator(
  (data, cxt: ExecutionContext) => {
    const req = cxt.switchToHttp().getRequest();
    return req.rawHeaders;
  },
);
