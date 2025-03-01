import { Test, TestingModule } from '@nestjs/testing';
import { ShareService } from './share.service';
import { createMock } from '@golevelup/ts-jest';
import { PrismaService } from '@/common/prisma.service';
import { MiscService } from '@/misc/misc.service';
import { MINIO_INTERNAL, MinioService } from '@/common/minio.service';

describe('ShareService', () => {
  let service: ShareService;

  const prismaService = createMock<PrismaService>();
  const miscService = createMock<MiscService>();
  const minioService = createMock<MinioService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareService,
        { provide: PrismaService, useValue: prismaService },
        { provide: MiscService, useValue: miscService },
        { provide: MINIO_INTERNAL, useValue: minioService },
      ],
    }).compile();

    service = module.get<ShareService>(ShareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
