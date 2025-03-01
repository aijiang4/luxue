import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ShareService } from '@/share/share.service';
import { User, CreateShareRequest, DeleteShareRequest } from '@refly-packages/openapi-schema';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { LoginedUser } from '@/utils/decorators/user.decorator';
import { buildSuccessResponse } from '@/utils';

@Controller('v1/share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @UseGuards(JwtAuthGuard)
  @Post('new')
  async createShare(@LoginedUser() user: User, @Body() body: CreateShareRequest) {
    const result = await this.shareService.createShare(user, body);
    return buildSuccessResponse(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async deleteShare(@LoginedUser() user: User, @Body() body: DeleteShareRequest) {
    await this.shareService.deleteShare(user, body);
    return buildSuccessResponse(null);
  }

  @Get('content')
  async getShareContent(@Query('shareCode') shareCode: string) {
    const result = await this.shareService.getShareDetail({ shareCode });
    return buildSuccessResponse(result);
  }
}
