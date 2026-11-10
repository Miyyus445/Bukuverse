import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Neon connection pool settings: increase timeout and limit
    // See: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/connection-pool-timeout
    const databaseUrl = process.env.DATABASE_URL;
    const urlWithPool = databaseUrl?.includes('connection_limit')
      ? databaseUrl
      : `${databaseUrl}&connection_limit=5&pool_timeout=60`;

    super({
      datasources: {
        db: {
          url: urlWithPool,
        },
      },
    });
  }

  async onModuleInit() {
    // Retry connection with exponential backoff for Neon cold starts
    let retries = 3;
    while (retries > 0) {
      try {
        await this.$connect();
        console.log('Database connected successfully');
        return;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('Failed to connect to database after retries:', error);
          throw error;
        }
        console.warn(`Database connection failed, retrying... (${retries} left)`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * (4 - retries)));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}