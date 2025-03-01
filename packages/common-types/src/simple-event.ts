import { SimpleEvent } from '@refly-packages/openapi-schema';

export const SimpleEvents: SimpleEvent[] = [
  {
    name: 'onResourceReady',
    displayName: {
      'zh-CN': '资源准备就绪',
      en: 'Resource Ready',
    },
    provideContextKeys: ['resources'],
  },
];
