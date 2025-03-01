import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  ping() {
    return { message: 'Refly API Endpoint', version: 'v1' };
  }
}
