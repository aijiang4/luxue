import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma.service';
import { RAGService } from '@/rag/rag.service';
import { ElasticsearchService } from '@/common/elasticsearch.service';

describe('SearchService', () => {
  let service: SearchService;

  const configService = createMock<ConfigService>();
  const prismaService = createMock<PrismaService>();
  const elasticsearchService = createMock<ElasticsearchService>();
  const ragService = createMock<RAGService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: ConfigService, useValue: configService },
        { provide: PrismaService, useValue: prismaService },
        { provide: ElasticsearchService, useValue: elasticsearchService },
        { provide: RAGService, useValue: ragService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
