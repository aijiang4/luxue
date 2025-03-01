import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CommonModule } from '@/common/common.module';
import { SubscriptionModule } from '@/subscription/subscription.module';

@Module({
  imports: [CommonModule, SubscriptionModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
