import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { QueryUserDto } from '../dto/query-user.dto';
import { UsersRepository } from '../users.repository';

@Injectable()
export class UsersQueryService {
  constructor(private readonly repository: UsersRepository) {}

  async findOneById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.repository.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    const { password, ...result } = user;
    return result;
  }

  async findOneWithPassword(identifier: string): Promise<User | null> {
    return this.repository.findOneByEmailOrUsername(identifier);
  }

  async findAll(queryDto: QueryUserDto) {
    const { page = 1, limit = 10, search, isActive, sortBy } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [sortField, sortOrder] = (sortBy ?? 'createdAt_desc').split('_') as [
      string,
      Prisma.SortOrder,
    ];
    const orderBy = { [sortField]: sortOrder };

    const [users, total] = await Promise.all([
      this.repository.findMany({ where, skip, take: limit, orderBy }),
      this.repository.count(where),
    ]);

    const usersWithoutPasswords = users.map((user) => {
      const { password, ...result } = user;
      return result;
    });

    return {
      data: usersWithoutPasswords,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
