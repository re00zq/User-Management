import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { QueryUserDto } from '../dto/query-user.dto';
import { UsersRepository } from '../users.repository';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersQueryService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly i18n: I18nService,
  ) {}

  async findOneById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.repository.findOneById(id);
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.NOT_FOUND', { args: { id } }),
      );
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
