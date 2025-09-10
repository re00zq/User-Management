import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'identifier' }); // We use 'identifier' for either email or username
  }

  /**
   * This method is automatically called by Passport during the login process.
   * @param identifier - The username or email provided by the user.
   * @param pass - The password provided by the user.
   * @returns The validated user object.
   * @throws {UnauthorizedException} if validation fails.
   */
  async validate(
    identifier: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.authService.validateUser(identifier, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return user;
  }
}
