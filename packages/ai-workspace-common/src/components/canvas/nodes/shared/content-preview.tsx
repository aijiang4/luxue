import { memo, useMemo } from 'react';
import { Markdown } from '@refly-packages/ai-workspace-common/components/markdown';
import { Source } from '@refly/openapi-schema';

interface ContentPreviewProps {
  content: string;
  sources?: Source[];
  sizeMode: 'compact' | 'adaptive';
  isOperating: boolean;
  maxCompactLength?: number;
  className?: string;
  isLoading?: boolean;
}

export const ContentPreview = memo(
  ({
    content,
    sources,
    sizeMode,
    isOperating,
    maxCompactLength = 10,
    className = '',
    isLoading = false,
  }: ContentPreviewProps) => {
    const previewContent = useMemo(() => {
      if (sizeMode === 'compact') {
        return `${content?.slice(0, maxCompactLength)}...` || '';
      }
      return content || '';
    }, [content, sizeMode, maxCompactLength]);

    // Memoize className to prevent re-renders when only isOperating changes
    const markdownClassName = useMemo(
      () =>
        `text-xs overflow-hidden ${isOperating ? 'pointer-events-auto cursor-text select-text' : 'pointer-events-none select-none'} ${isLoading ? 'opacity-70' : ''} ${className}`,
      [isOperating, className, isLoading],
    );

    return (
      <Markdown className={markdownClassName} content={previewContent} sources={sources || []} />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.sizeMode === nextProps.sizeMode &&
      prevProps.isOperating === nextProps.isOperating &&
      prevProps.maxCompactLength === nextProps.maxCompactLength &&
      prevProps.className === nextProps.className &&
      prevProps.isLoading === nextProps.isLoading &&
      JSON.stringify(prevProps.sources) === JSON.stringify(nextProps.sources)
    );
  },
);
