import { Test, TestingModule } from '@nestjs/testing';
import type { Queue } from 'bullmq';
import { MiscService } from './misc.service';
import { MINIO_EXTERNAL, MinioService } from '@/common/minio.service';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma.service';
import { QUEUE_SYNC_STORAGE_USAGE } from '@/utils';
import { getQueueToken } from '@nestjs/bullmq';

describe('MiscService', () => {
  let service: MiscService;

  const configService = createMock<ConfigService>();
  const prismaService = createMock<PrismaService>();
  const minioService = createMock<MinioService>();

  const mockQueue = {
    add: jest.fn(),
  } as unknown as Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MiscService,
        { provide: ConfigService, useValue: configService },
        { provide: PrismaService, useValue: prismaService },
        { provide: MINIO_EXTERNAL, useValue: minioService },
        { provide: getQueueToken(QUEUE_SYNC_STORAGE_USAGE), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<MiscService>(MiscService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
