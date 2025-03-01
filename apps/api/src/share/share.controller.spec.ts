import { Test, TestingModule } from '@nestjs/testing';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('ShareController', () => {
  let controller: ShareController;

  const configService = createMock<ConfigService>();
  const jwtService = createMock<JwtService>();
  const shareService = createMock<ShareService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShareController],
      providers: [
        { provide: ShareService, useValue: shareService },
        { provide: ConfigService, useValue: configService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    controller = module.get<ShareController>(ShareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
