import { Source } from '@refly-packages/openapi-schema';

export type RelatedQuestion = string;

export interface SessionItem {
  question: string;
  sources: Source[];
  answer: string;
  relatedQuestions: RelatedQuestion[]; // 推荐问题列表
}
