import { Inject, Injectable, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { PrismaService } from '@/common/prisma.service';
import { MiscService } from '@/misc/misc.service';
import { Prisma } from '@prisma/client';
import {
  CreateShareRequest,
  CreateShareResult,
  DeleteShareRequest,
  GetShareContentData,
  SharedContent,
  User,
} from '@refly-packages/openapi-schema';
import { documentPO2DTO } from '@/knowledge/knowledge.dto';
import { MINIO_INTERNAL, MinioService } from '@/common/minio.service';
import { streamToString } from '@/utils';
import { ParamsError, ShareNotFoundError } from '@refly-packages/errors';
import { canvasPO2DTO } from '@/canvas/canvas.dto';

const SHARE_CODE_PREFIX = {
  DOCUMENT: 'doc',
  CANVAS: 'can',
};

function genDocumentShareCode(): string {
  return SHARE_CODE_PREFIX.DOCUMENT + createId();
}

function genCanvasShareCode(): string {
  return SHARE_CODE_PREFIX.CANVAS + createId();
}

@Injectable()
export class ShareService {
  private logger = new Logger(ShareService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly miscService: MiscService,
    @Inject(MINIO_INTERNAL) private minio: MinioService,
  ) {}

  async createShare(user: User, body: CreateShareRequest): Promise<CreateShareResult> {
    const { entityType, entityId } = body;

    if (entityType !== 'canvas' && entityType !== 'document') {
      throw new ParamsError('Unsupported entity type for sharing');
    }

    await this.miscService.checkEntity(user, entityId, entityType);

    const shareCode = entityType === 'document' ? genDocumentShareCode() : genCanvasShareCode();

    if (entityType === 'document') {
      await this.prisma.document.update({
        where: { docId: entityId },
        data: { shareCode },
      });
    } else if (entityType === 'canvas') {
      await this.prisma.canvas.update({
        where: { canvasId: entityId },
        data: { shareCode },
      });
    }

    return { shareCode };
  }

  async deleteShare(user: User, body: DeleteShareRequest) {
    const { shareCode } = body;
    let updateResult: Prisma.BatchPayload;

    if (shareCode.startsWith(SHARE_CODE_PREFIX.DOCUMENT)) {
      updateResult = await this.prisma.document.updateMany({
        where: { uid: user.uid, shareCode, deletedAt: null },
        data: { shareCode: null },
      });
    } else if (shareCode.startsWith(SHARE_CODE_PREFIX.CANVAS)) {
      updateResult = await this.prisma.canvas.updateMany({
        where: { uid: user.uid, shareCode, deletedAt: null },
        data: { shareCode: null },
      });
    }

    if (updateResult.count === 0) {
      throw new ShareNotFoundError();
    }
  }

  private async getSharedContentForDocument(
    shareCode: string,
    docId?: string,
  ): Promise<SharedContent> {
    const result: SharedContent = {};

    const documents = await this.prisma.document.findMany({
      where: { shareCode, docId, deletedAt: null },
      take: 1,
    });

    if (documents.length === 0) {
      this.logger.warn(`document not found for share code: ${shareCode}`);
      throw new ShareNotFoundError();
    }

    const document = documents[0];

    const user = await this.prisma.user.findUnique({
      select: { name: true, nickname: true, avatar: true },
      where: { uid: document.uid },
    });
    result.users = [user];

    result.document = documentPO2DTO({
      ...document,
      content: await streamToString(await this.minio.client.getObject(document.storageKey)),
    });

    return result;
  }

  private async getSharedContentForCanvas(shareCode: string): Promise<SharedContent> {
    const result: SharedContent = {};

    const canvases = await this.prisma.canvas.findMany({
      where: { shareCode },
      take: 1,
    });

    if (canvases.length === 0) {
      throw new ShareNotFoundError();
    }

    const canvas = canvases[0];

    result.canvas = canvasPO2DTO(canvas);

    return result;
  }

  async getShareDetail(params: GetShareContentData['query']): Promise<SharedContent> {
    const { shareCode } = params;

    if (shareCode.startsWith(SHARE_CODE_PREFIX.DOCUMENT)) {
      return this.getSharedContentForDocument(shareCode);
    }
    if (shareCode.startsWith(SHARE_CODE_PREFIX.CANVAS)) {
      return this.getSharedContentForCanvas(shareCode);
    }

    throw new ShareNotFoundError();
  }
}
