export const MAX_NEED_RECALL_TOKEN = 4000; // > 2000 need use recall for similar chunks other than use whole content
export const SHORT_CONTENT_THRESHOLD = 500; // < 500 tokens is a short content, can contains 39321.6 / 500 = 78.64 short content
export const MIN_RELEVANCE_SCORE = 0.7; // Minimum relevance score, used to filter out unrelated Chunks

export const MAX_RAG_RELEVANT_CONTENT_RATIO = 0.7;
export const MAX_SHORT_CONTENT_RATIO = 0.3;

// configurable params
export const MAX_CONTEXT_RATIO = 0.7;
export const MAX_SELECTED_CONTENT_RATIO = 2 / 4;
export const MAX_DOCUMENTS_RATIO = 1 / 4;
export const MAX_RESOURCES_RATIO = 1 / 4;

export const MAX_RAG_RELEVANT_DOCUMENTS_RATIO = 0.7;
export const MAX_SHORT_DOCUMENTS_RATIO = 0.3;

export const MAX_RAG_RELEVANT_RESOURCES_RATIO = 0.7;
export const MAX_SHORT_RESOURCES_RATIO = 0.3;

export const MAX_QUERY_TOKENS_RATIO = 0.7;

export const DEFAULT_MODEL_CONTEXT_LIMIT = 128 * 1024;
