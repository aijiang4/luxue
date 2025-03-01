import {
  SkillContextContentItem,
  SkillContextDocumentItem,
  SkillContextResourceItem,
  Source,
} from '@refly-packages/openapi-schema';
import { BaseMessage } from '@langchain/core/messages';
import { LOCALE } from '@refly-packages/common-types';
import { BaseSkillState } from '../../base';
import { ContentNodeType } from '../../engine';

export interface SkillContextContentItemMetadata {
  domain: ContentNodeType;
  url?: string;
  title: string;
  entityId?: string;
}

export type SelectedContentDomain =
  | 'resourceSelection'
  | 'documentSelection'
  | 'extensionWeblinkSelection';

export interface Chunk {
  content: string;
  metadata: {
    start: number;
    end: number;
  };
}

export interface MentionedContextItem {
  type?: 'document' | 'resource' | 'selectedContent';
  entityId?: string;
  url?: string;
  title?: string;
  useWholeContent?: boolean;
}

export interface QueryAnalysis {
  intent: 'WRITING' | 'READING_COMPREHENSION' | 'SEARCH_QA' | 'OTHER';
  confidence: number;
  reasoning: string;
  optimizedQuery: string;
  mentionedContext: IContext;
}

export interface IContext {
  contentList: SkillContextContentItem[];
  resources: SkillContextResourceItem[];
  documents: SkillContextDocumentItem[];
  messages?: BaseMessage[];
  webSearchSources?: Source[];
  locale?: string | LOCALE;
}

export interface GraphState extends BaseSkillState {
  /**
   * Accumulated messages.
   */
  messages: BaseMessage[];
}
