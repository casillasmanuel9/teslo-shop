import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetUser, GetRawHeaders, RoleProtected, Auth } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(@Body() createAuthDto: LoginUserDto) {
    return this.authService.login(createAuthDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkOutStatus(user);
  }

  @Get()
  @UseGuards(AuthGuard())
  testingPrivateGet(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @GetRawHeaders() rawHeaders: any,
  ) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  //@SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.SUPER_USER, ValidRoles.USER)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateGet2(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.ADMIN)
  testingPrivateGet3(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
    };
  }
}
