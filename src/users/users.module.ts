import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from '../shared/prisma/prisma.service';
import { UsersCommandService } from './services/users-command.service';
import { UsersQueryService } from './services/users-query.service';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersCommandService,
    UsersQueryService,
    PrismaService,
  ],
  exports: [],
})
export class UsersModule {}
