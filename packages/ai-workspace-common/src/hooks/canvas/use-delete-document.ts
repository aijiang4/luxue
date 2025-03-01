import { useState } from 'react';
import * as Y from 'yjs';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
import { useDebouncedCallback } from 'use-debounce';
import { useDocumentStoreShallow } from '@refly-packages/ai-workspace-common/stores/document';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useSubscriptionUsage } from '../use-subscription-usage';
import { useNodePreviewControl } from '@refly-packages/ai-workspace-common/hooks/canvas/use-node-preview-control';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';

export const useDeleteDocument = () => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { deleteDocumentData } = useDocumentStoreShallow((state) => ({
    deleteDocumentData: state.deleteDocumentData,
  }));
  const { canvasId } = useCanvasContext();
  const { closeNodePreviewByEntityId } = useNodePreviewControl({ canvasId });

  const { refetchUsage } = useSubscriptionUsage();

  const deleteDocument = async (docId: string) => {
    if (isRemoving) return;
    let success = false;
    try {
      setIsRemoving(true);
      const { data } = await getClient().deleteDocument({
        body: {
          docId,
        },
      });

      if (data?.success) {
        success = true;
        deleteDocumentData(docId);
        closeNodePreviewByEntityId(docId);

        // Clear IndexedDB persistence for the deleted document
        const indexedDbProvider = new IndexeddbPersistence(docId, new Y.Doc());
        await indexedDbProvider.clearData();
        await indexedDbProvider.destroy();
      }
    } finally {
      setIsRemoving(false);
      refetchUsage();
    }
    return success;
  };

  const debouncedDeleteDocument = useDebouncedCallback(
    (documentId: string) => {
      return deleteDocument(documentId);
    },
    300,
    { leading: true },
  );

  return { deleteDocument: debouncedDeleteDocument, isRemoving };
};
