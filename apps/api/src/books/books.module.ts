import { Module } from '@nestjs/common';
import { BooksController } from './books.controller.js';
import { GoogleBooksService } from './google-books.service.js';
import { CacheService } from './cache.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [BooksController],
  providers: [GoogleBooksService, CacheService, PrismaService],
  exports: [GoogleBooksService, CacheService],
})
export class BooksModule {}