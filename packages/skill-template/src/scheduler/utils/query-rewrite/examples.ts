export const buildVagueQueryRewriteExamples = () => {
  return `
  Examples of vague queries that need rewriting:

  1. No Context or History:
     Original query: "tell me more about it"
     Rewritten query: "tell me more about it" (insufficient context to rewrite)
     mentionedContext: []
     Reasoning: No context or history available to clarify the reference.

  2. With Chat History Only:
     <ChatHistory>
     <ChatHistoryItem type={human}>What are the key features of React 18?</ChatHistoryItem>
     <ChatHistoryItem type={ai}>React 18 introduces automatic batching, concurrent features...</ChatHistoryItem>
     <ChatHistoryItem type={human}>tell me more details</ChatHistoryItem>
     </ChatHistory>

     Original query: "tell me more details"
     Rewritten query: "tell me more details about React 18's features including automatic batching and concurrent features"
     mentionedContext: []
     Reasoning: Used chat history to clarify the subject of inquiry.

  3. With Context Only:
     <Context>
     <ContextItem type='document' entityId='doc-1' title='API Documentation'>New authentication system requires MFA setup.</ContextItem>
     </Context>

     Original query: "how does this work?"
     Rewritten query: "how does the new MFA authentication system work?"
     mentionedContext: [{"type": "document", "entityId": "doc-1", "title": "API Documentation", "useWholeContent": true}]
     Reasoning: Used available context to specify the subject.`;
};

export const buildNormalQueryRewriteExamples = () => {
  return `
  Examples of more specific queries:

  1. Unrelated to Context/History:
     <Context>
     <ContextItem type='document' entityId='doc-1' title='Project Plan'>Q4 deliverables...</ContextItem>
     </Context>
     <ChatHistory>
     <ChatHistoryItem type={human}>How's the project timeline?</ChatHistoryItem>
     </ChatHistory>

     Original query: "What's the weather in New York?"
     Rewritten query: "What's the weather in New York?"
     mentionedContext: []
     Reasoning: Query is clear and unrelated to available context/history. No rewrite needed.

  2. With Both Context and History:
     <Context>
     <ContextItem type='resource' entityId='res-1' title='Performance Metrics'>System latency reduced by 50%.</ContextItem>
     </Context>
     <ChatHistory>
     <ChatHistoryItem type={human}>What optimizations were made?</ChatHistoryItem>
     <ChatHistoryItem type={ai}>We implemented caching and indexing.</ChatHistoryItem>
     <ChatHistoryItem type={human}>what was the impact?</ChatHistoryItem>
     </ChatHistory>

     Original query: "can you explain these improvements?"
     Rewritten query: "can you explain the system latency improvements achieved through caching and indexing?"
     mentionedContext: [{"type": "resource", "entityId": "res-1", "title": "Performance Metrics", "useWholeContent": true}]
     Reasoning: Combined context and chat history to clarify the improvements being discussed.

  3. Clear Query with Relevant Context:
     <Context>
     <ContextItem type='selectedContent' entityId='content-1' title='Security Policy'>New password requirements implemented.</ContextItem>
     </Context>

     Original query: "What are the password requirements?"
     Rewritten query: "What are the password requirements?"
     mentionedContext: [{"type": "selectedContent", "entityId": "content-1", "title": "Security Policy", "useWholeContent": true}]
     Reasoning: Query is already clear, only added context reference.`;
};
