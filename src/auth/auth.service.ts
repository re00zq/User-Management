import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersCommandService } from '../users/services/users-command.service';
import { UsersQueryService } from '../users/services/users-query.service';
import { RegisterUserDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { User } from '@prisma/client';
import { UsersRepository } from '../users/users.repository';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersCommandService: UsersCommandService,
    private readonly usersQueryService: UsersQueryService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Registers a new user.
   */
  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.usersCommandService.create(registerUserDto);
  }

  /**
   * Validates a user's credentials.
   * @returns The user object without password if valid, otherwise null.
   */
  async validateUser(
    identifier: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersQueryService.findOneWithPassword(identifier);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Generates a JWT for a given user.
   */
  async login(user: Omit<User, 'password'>) {
    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /**
   * Handles the forgot password request.
   * Generates a reset token and logs it.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneByEmailOrUsername(email);
    if (!user) {
      // We don't throw an error to prevent email enumeration attacks.
      // We'll just log and return a generic success message.
      this.logger.warn(
        `Password reset attempt for non-existent email: ${email}`,
      );
      return {
        message: this.i18n.t('auth.PASSWORD_RESET_INITIATED'),
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersRepository.update(user.id, {
      resetToken: hashedToken,
      resetTokenExpiry: tokenExpiry,
    });

    // You would email this token to the user if you have time.
    this.logger.log(
      `Password reset token generated for ${user.email}: ${resetToken}`,
    );

    return {
      message: this.i18n.t('auth.PASSWORD_RESET_INITIATED'),
    };
  }

  /**
   * Resets the user's password using a valid token.
   */
  async resetPassword(
    token: string,
    newPass: string,
  ): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersRepository.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnprocessableEntityException(
        this.i18n.t('auth.INVALID_RESET_TOKEN'),
      );
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return { message: this.i18n.t('auth.PASSWORD_RESET_SUCCESS') };
  }
}
