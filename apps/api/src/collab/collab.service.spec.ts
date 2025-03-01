import { Test, TestingModule } from '@nestjs/testing';
import { CollabService } from './collab.service';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma.service';
import { RAGService } from '@/rag/rag.service';
import { ElasticsearchService } from '@/common/elasticsearch.service';
import { RedisService } from '@/common/redis.service';
import { MiscService } from '@/misc/misc.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { MINIO_INTERNAL } from '@/common/minio.service';
import { MinioService } from '@/common/minio.service';
import { QUEUE_SYNC_CANVAS_ENTITY } from '@/utils/const';
import type { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';

describe('CollabService', () => {
  let service: CollabService;

  const configService = createMock<ConfigService>();
  const prismaService = createMock<PrismaService>();
  const ragService = createMock<RAGService>();
  const elasticsearchService = createMock<ElasticsearchService>();
  const redisService = createMock<RedisService>();
  const miscService = createMock<MiscService>();
  const subscriptionService = createMock<SubscriptionService>();
  const minioService = createMock<MinioService>();

  const mockQueue = {
    add: jest.fn(),
  } as unknown as Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollabService,
        { provide: ConfigService, useValue: configService },
        { provide: PrismaService, useValue: prismaService },
        { provide: RAGService, useValue: ragService },
        { provide: ElasticsearchService, useValue: elasticsearchService },
        { provide: RedisService, useValue: redisService },
        { provide: MiscService, useValue: miscService },
        { provide: MINIO_INTERNAL, useValue: minioService },
        { provide: SubscriptionService, useValue: subscriptionService },
        { provide: getQueueToken(QUEUE_SYNC_CANVAS_ENTITY), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<CollabService>(CollabService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
