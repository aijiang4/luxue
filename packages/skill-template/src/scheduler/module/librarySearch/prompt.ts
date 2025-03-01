import { buildCitationRules, buildCitationReminder } from '../common/citationRules';
import {
  buildChatHistoryRules,
  buildQueryProcessAndChatHistoryInstructions,
  chatHistoryReminder,
} from '../common/chat-history';
import { buildLibrarySearchExamples, buildLibrarySearchChatHistoryExamples } from './exmaples';
import { buildQueryPriorityInstruction, buildSpecificQueryInstruction } from '../common/query';
import { buildContextFormat } from './context';
import { buildLocaleFollowInstruction } from '../common/locale-follow';

export const buildLibrarySearchSystemPrompt = () => {
  return `You are an AI assistant developed by Refly, specializing in knowledge base search and information retrieval. Your task is to provide accurate answers based on the organization's internal knowledge base.

${buildCitationRules()}

## Guidelines
1. ALWAYS prioritize information from the knowledge base when answering queries
2. Stay focused on the exact query - don't add unnecessary information
3. Answer questions directly and concisely with proper source citations
4. If knowledge base content doesn't fully address the query, acknowledge this
6. Maintain a friendly and professional tone

${buildQueryPriorityInstruction()}

${buildQueryProcessAndChatHistoryInstructions()}

${buildChatHistoryRules()}

${buildLibrarySearchExamples()}

${buildLibrarySearchChatHistoryExamples()}

## Performance Optimization
1. Focus on key information first
2. Use simple, clear language
3. Keep responses concise but informative
4. Group related information with shared citations
5. Prioritize recent and authoritative sources

## FINAL CHECKLIST
- ✓ Prioritize user's original query intent
- ✓ Only cite when context is relevant
- ✓ Citations immediately follow statements
- ✓ Answer is clear and concise
- ✓ Considered full chat history for context
- ✓ Properly handled follow-up questions

${buildContextFormat()}

${buildSpecificQueryInstruction()}
`;
};

export const buildLibrarySearchUserPrompt = ({
  originalQuery,
  rewrittenQuery,
  locale,
}: {
  originalQuery: string;
  rewrittenQuery: string;
  locale: string;
}) => {
  if (originalQuery === rewrittenQuery) {
    return `## Knowledge Base Query
${originalQuery}

${buildCitationReminder()}

${chatHistoryReminder()}

${buildLocaleFollowInstruction(locale)}
`;
  }

  return `## Original Knowledge Base Query
${originalQuery}

## Optimized Knowledge Base Query
${rewrittenQuery}

${buildCitationReminder()}

${buildQueryProcessAndChatHistoryInstructions()}

${buildLocaleFollowInstruction(locale)}
`;
};

export const buildLibrarySearchContextUserPrompt = (
  context: string,
  needPrepareContext: boolean,
) => {
  if (!needPrepareContext) {
    return '';
  }

  return `
## Knowledge Base Content
${context}

${buildQueryProcessAndChatHistoryInstructions()}
`;
};
