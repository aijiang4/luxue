import { useMemo } from 'react';
import { useDocumentContext } from '@refly-packages/ai-workspace-common/context/document';

export const useDocumentSync = () => {
  const { ydoc } = useDocumentContext();

  const syncFunctions = useMemo(() => {
    const syncTitleToYDoc = (title: string) => {
      ydoc?.transact(() => {
        const yTitle = ydoc?.getText('title');
        yTitle?.delete(0, yTitle?.length ?? 0);
        yTitle?.insert(0, title);
      });
    };

    return {
      syncTitleToYDoc,
    };
  }, [ydoc]);

  return syncFunctions;
};
