import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersQueryService } from '../../users/services/users-query.service';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersQueryService: UsersQueryService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * This method is automatically called by Passport after a JWT has been verified.
   * It extracts the payload and can be used to enrich the request object.
   * @param payload - The decoded JWT payload.
   * @returns The user object corresponding to the JWT subject.
   * @throws {UnauthorizedException} if the user is not found or inactive.
   */
  async validate(payload: JwtPayload) {
    // We fetch the user from the DB to ensure they still exist and are active.
    const user = await this.usersQueryService.findOneById(payload.sub);

    if (!user?.isActive) {
      throw new UnauthorizedException(
        'User is invalid, not found, or deactivated.',
      );
    }

    // The returned object will be attached to the request as `request.user`
    return user;
  }
}
