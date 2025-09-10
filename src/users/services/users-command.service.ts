import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { UsersRepository } from '../users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersCommandService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly i18n: I18nService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { username, email, password } = createUserDto;

    const existingEmail = await this.repository.findOneByEmailOrUsername(email);
    if (existingEmail) {
      throw new ConflictException(this.i18n.t('user.CONFLICT_EMAIL'));
    }
    const existingUsername =
      await this.repository.findOneByEmailOrUsername(username);
    if (existingUsername) {
      throw new ConflictException(this.i18n.t('user.CONFLICT_USERNAME'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.repository.create({
      username,
      email,
      password: hashedPassword,
    });

    const { password: _, ...result } = user;
    return result;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const userExists = await this.repository.findOneById(id);
    if (!userExists) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { args: { id } }),
      );
    }

    const { username, email } = updateUserDto;
    if (username || email) {
      const conflict = await this.repository.findByConflict(
        username ?? '',
        email ?? '',
        id,
      );
      if (conflict) {
        throw new ConflictException('Username or email already in use.');
      }
    }

    const updatedUser = await this.repository.update(id, updateUserDto);
    const { password, ...result } = updatedUser;
    return result;
  }

  async updateStatus(
    id: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<Omit<User, 'password'>> {
    const userExists = await this.repository.findOneById(id);
    if (!userExists) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { args: { id } }),
      );
    }

    const updatedUser = await this.repository.update(id, {
      isActive: updateUserStatusDto.isActive,
    });
    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string): Promise<void> {
    const userExists = await this.repository.findOneById(id);
    if (!userExists) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { args: { id } }),
      );
    }
    await this.repository.delete(id);
  }
}
