import { PrismaService } from '@/common/prisma.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { Injectable } from '@nestjs/common';
import { ActionResultNotFoundError } from '@refly-packages/errors';
import { GetActionResultData, User } from '@refly-packages/openapi-schema';

@Injectable()
export class ActionService {
  constructor(
    private readonly prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {}

  async getActionResult(user: User, param: GetActionResultData['query']) {
    const { resultId, version } = param;

    const result = await this.prisma.actionResult.findFirst({
      where: {
        resultId,
        version,
        uid: user.uid,
      },
      orderBy: { version: 'desc' },
    });
    if (!result) {
      throw new ActionResultNotFoundError();
    }

    // If the result is executing and the last updated time is more than 3 minutes ago,
    // mark it as failed.
    if (result.status === 'executing' && result.updatedAt < new Date(Date.now() - 1000 * 60 * 3)) {
      const updatedResult = await this.prisma.actionResult.update({
        where: {
          pk: result.pk,
          status: 'executing',
        },
        data: {
          status: 'failed',
          errors: `["Execution timeout"]`,
        },
      });
      return updatedResult;
    }

    const modelList = await this.subscriptionService.getModelList();
    const modelInfo = modelList.find((model) => model.name === result.modelName);

    const steps = await this.prisma.actionStep.findMany({
      where: {
        resultId: result.resultId,
        version: result.version,
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
    });

    return { ...result, steps, modelInfo };
  }
}
