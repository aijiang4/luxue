import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { CommonModule } from '@/common/common.module';
import { MiscModule } from '@/misc/misc.module';

@Module({
  imports: [CommonModule, MiscModule],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
