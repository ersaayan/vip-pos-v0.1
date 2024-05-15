import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PhonesModule } from './phones/phones.module';
import { StockCartsModule } from './stock-carts/stock-carts.module';
import { MulterModule } from '@nestjs/platform-express';
@Module({
  imports: [
    MulterModule.register({
      dest: './public/img', // Dosyaların kaydedileceği klasör
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    PhonesModule,
    StockCartsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
