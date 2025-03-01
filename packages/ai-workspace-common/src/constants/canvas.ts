export const CANVAS_TAG = 'reflyCanvas';
export const CANVAS_THINKING_TAG = 'reflyThinking';

// https://regex101.com/r/TwzTkf/2
export const CANVAS_TAG_REGEX = /<reflyCanvas\b[^>]*>(?<content>[\S\s]*?)(?:<\/reflyCanvas>|$)/;

// https://regex101.com/r/r9gqGg/1
export const CANVAS_TAG_CLOSED_REGEX = /<reflyCanvas\b[^>]*>([\S\s]*?)<\/reflyCanvas>/;

// https://regex101.com/r/AvPA2g/1
export const CANVAS_THINKING_TAG_REGEX = /<reflyThinking\b[^>]*>([\S\s]*?)(?:<\/reflyThinking>|$)/;
