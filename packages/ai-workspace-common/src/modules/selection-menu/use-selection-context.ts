import { useCallback, useEffect, useState } from 'react';
import { IContextItem, useContextPanelStoreShallow } from '../../stores/context-panel';
import { getSelectionNodesMarkdown } from '@refly/utils/html2md';

interface UseSelectionContextProps {
  containerClass?: string;
  containerRef?: React.RefObject<HTMLElement>;
  enabled?: boolean;
}

export const useSelectionContext = ({
  containerClass,
  containerRef,
  enabled = true,
}: UseSelectionContextProps) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);
  const { addContextItem } = useContextPanelStoreShallow((state) => ({
    addContextItem: state.addContextItem,
  }));

  const handleSelection = useCallback(() => {
    if (!enabled) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      setIsSelecting(false);
      setSelectedText('');
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const text = getSelectionNodesMarkdown();

      if (!text || selection.isCollapsed) {
        setIsSelecting(false);
        setSelectedText('');
        return;
      }

      // Prefer containerRef to check container
      const container =
        containerRef?.current ||
        (containerClass ? document.querySelector(`.${containerClass}`) : document.body);

      if (!container || !container.contains(range.commonAncestorContainer)) {
        setIsSelecting(false);
        setSelectedText('');
        return;
      }

      setSelectedText(text);
      setIsSelecting(true);
    } catch (error) {
      console.error('Selection error:', error);
      setIsSelecting(false);
      setSelectedText('');
    }
  }, [containerClass, containerRef, enabled]);

  // Add selected text to context
  const addToContext = useCallback(
    (item: IContextItem) => {
      if (!selectedText) return;

      addContextItem(item);

      // Clear selection
      window.getSelection()?.removeAllRanges();
      setSelectedText('');
      setIsSelecting(false);
    },
    [selectedText, addContextItem],
  );

  const removeSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelectedText('');
    setIsSelecting(false);
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!enabled) {
      setIsSelecting(false);
      setSelectedText('');
      return;
    }

    document.addEventListener('selectionchange', handleSelection);

    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, [enabled, handleSelection]);

  return {
    selectedText,
    isSelecting,
    addToContext,
    removeSelection,
  };
};
