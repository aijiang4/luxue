import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetActionResultResponse } from '@refly-packages/openapi-schema';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { LoginedUser } from '@/utils/decorators/user.decorator';
import { User as UserModel } from '@prisma/client';
import { buildSuccessResponse } from '@/utils/response';
import { ActionService } from '@/action/action.service';
import { actionResultPO2DTO } from '@/action/action.dto';

@Controller('v1/action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/result')
  async getActionResult(
    @LoginedUser() user: UserModel,
    @Query('resultId') resultId: string,
  ): Promise<GetActionResultResponse> {
    const result = await this.actionService.getActionResult(user, { resultId });
    return buildSuccessResponse(actionResultPO2DTO(result));
  }
}
