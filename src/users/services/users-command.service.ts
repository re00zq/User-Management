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

@Injectable()
export class UsersCommandService {
  constructor(private readonly repository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { username, email, password } = createUserDto;

    const existingUser =
      (await this.repository.findOneByEmailOrUsername(email)) ||
      (await this.repository.findOneByEmailOrUsername(username));
    if (existingUser) {
      throw new ConflictException('Username or email already in use.');
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
      throw new NotFoundException(`User with ID "${id}" not found.`);
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
      throw new NotFoundException(`User with ID "${id}" not found.`);
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
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    await this.repository.delete(id);
  }
}
