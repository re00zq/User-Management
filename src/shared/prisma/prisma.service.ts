import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * A service that encapsulates the PrismaClient.
 * It handles the connection lifecycle of the Prisma client.
 * This service can be injected into any other service that needs to interact with the database.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // This method is called once the module has been initialized.
    // We connect to the database here.
    await this.$connect();
  }

  async onModuleDestroy() {
    // This method is called when the application is shutting down.
    // We disconnect from the database here to ensure a graceful shutdown.
    await this.$disconnect();
  }
}
