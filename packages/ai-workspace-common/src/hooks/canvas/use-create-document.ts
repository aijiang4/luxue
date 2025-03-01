import { useCallback, useState } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAddNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-node';
import { CanvasNodeType } from '@refly-packages/ai-workspace-common/requests/types.gen';
import { useDebouncedCallback } from 'use-debounce';
import { parseMarkdownCitationsAndCanvasTags } from '@refly-packages/utils/parse';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';
import { genDocumentID } from '@refly-packages/utils/id';
import { parseMarkdown } from '@refly-packages/utils/editor';
import { useDocumentStoreShallow } from '@refly-packages/ai-workspace-common/stores/document';
import { prosemirrorToYXmlFragment } from 'y-prosemirror';
import { useCanvasStore } from '@refly-packages/ai-workspace-common/stores/canvas';
import { useSubscriptionUsage } from '@refly-packages/ai-workspace-common/hooks/use-subscription-usage';
import { useSubscriptionStoreShallow } from '@refly-packages/ai-workspace-common/stores/subscription';

const createLocalDocument = async (
  docId: string,
  title: string,
  content: string,
  refetchUsage: () => void,
) => {
  const ydoc = new Y.Doc();
  const localProvider = new IndexeddbPersistence(docId, ydoc);

  // Wait for local sync
  await new Promise<void>((resolve) => {
    localProvider.once('synced', () => resolve());
  });

  const yTitle = ydoc.getText('title');
  yTitle.insert(0, title);

  const node = parseMarkdown(content);
  prosemirrorToYXmlFragment(node, ydoc.getXmlFragment('default'));

  refetchUsage();
};

export const useCreateDocument = () => {
  const [isCreating, _setIsCreating] = useState(false);
  const { canvasId } = useCanvasContext();
  const { t } = useTranslation();
  const { addNode } = useAddNode();
  const { storageUsage, refetchUsage } = useSubscriptionUsage();

  const { setStorageExceededModalVisible } = useSubscriptionStoreShallow((state) => ({
    setStorageExceededModalVisible: state.setStorageExceededModalVisible,
  }));
  const { setDocumentLocalSyncedAt, setDocumentRemoteSyncedAt } = useDocumentStoreShallow(
    (state) => ({
      setDocumentLocalSyncedAt: state.setDocumentLocalSyncedAt,
      setDocumentRemoteSyncedAt: state.setDocumentRemoteSyncedAt,
    }),
  );

  const checkStorageUsage = useCallback(() => {
    if (storageUsage?.fileCountUsed >= storageUsage?.fileCountQuota) {
      setStorageExceededModalVisible(true);
      return false;
    }
    return true;
  }, [storageUsage, setStorageExceededModalVisible]);

  const createDocument = useCallback(
    async (
      title: string,
      content: string,
      {
        sourceNodeId,
        addToCanvas,
        sourceType,
      }: { sourceNodeId?: string; addToCanvas?: boolean; sourceType?: string },
    ) => {
      if (!checkStorageUsage()) {
        return null;
      }

      const { data } = useCanvasStore.getState();
      const nodes = data[canvasId]?.nodes ?? [];
      const docId = genDocumentID();
      const parsedContent = parseMarkdownCitationsAndCanvasTags(content, []);

      await createLocalDocument(docId, title, parsedContent, refetchUsage);

      setDocumentLocalSyncedAt(docId, Date.now());
      setDocumentRemoteSyncedAt(docId, Date.now());

      message.success(t('common.putSuccess'));

      if (addToCanvas) {
        // Find the source node
        const sourceNode = nodes.find((n) => n.data?.entityId === sourceNodeId);

        if (!sourceNode) {
          console.warn('Source node not found');
          return null;
        }

        const newNode = {
          type: 'document' as CanvasNodeType,
          data: {
            entityId: docId,
            title,
            contentPreview: parsedContent.slice(0, 500),
          },
        };

        addNode(newNode, [
          {
            type: sourceType as CanvasNodeType,
            entityId: sourceNodeId,
          },
        ]);
      }

      return docId;
    },
    [addNode, canvasId, checkStorageUsage],
  );

  const debouncedCreateDocument = useDebouncedCallback(
    (
      title: string,
      content: string,
      {
        sourceNodeId,
        addToCanvas,
        sourceType,
      }: { sourceNodeId?: string; addToCanvas?: boolean; sourceType?: string },
    ) => {
      return createDocument(title, content, { sourceNodeId, addToCanvas, sourceType });
    },
    300,
    { leading: true },
  );

  const createSingleDocumentInCanvas = useCallback(
    async (position?: { x: number; y: number }) => {
      if (!checkStorageUsage()) {
        return null;
      }

      const docId = genDocumentID();
      const title = '';

      await createLocalDocument(docId, title, '', refetchUsage);

      setDocumentLocalSyncedAt(docId, Date.now());
      setDocumentRemoteSyncedAt(docId, Date.now());

      message.success(t('common.putSuccess'));

      if (canvasId && canvasId !== 'empty') {
        const newNode = {
          type: 'document' as CanvasNodeType,
          data: {
            title,
            entityId: docId,
            contentPreview: '',
          },
          position: position,
        };

        addNode(newNode);
      }
    },
    [
      checkStorageUsage,
      canvasId,
      addNode,
      t,
      refetchUsage,
      setDocumentLocalSyncedAt,
      setDocumentRemoteSyncedAt,
    ],
  );

  const duplicateDocument = useCallback(
    async (title: string, content: string, sourceDocId: string, metadata?: any) => {
      if (!checkStorageUsage()) {
        return null;
      }

      const docId = genDocumentID();
      const newTitle = `${title} ${t('canvas.nodeActions.copy')}`;

      await createLocalDocument(docId, newTitle, content, refetchUsage);

      setDocumentLocalSyncedAt(docId, Date.now());
      setDocumentRemoteSyncedAt(docId, Date.now());

      message.success(t('common.putSuccess'));

      if (canvasId && canvasId !== 'empty') {
        const newNode = {
          type: 'document' as CanvasNodeType,
          data: {
            title: newTitle,
            entityId: docId,
            contentPreview: content.slice(0, 500),
            metadata: {
              ...metadata,
              status: 'finish',
            },
          },
        };

        addNode(newNode, [{ type: 'document', entityId: sourceDocId }], false, true);
      }

      return docId;
    },
    [
      checkStorageUsage,
      canvasId,
      addNode,
      t,
      refetchUsage,
      setDocumentLocalSyncedAt,
      setDocumentRemoteSyncedAt,
    ],
  );

  return {
    createDocument,
    debouncedCreateDocument,
    isCreating,
    createSingleDocumentInCanvas,
    duplicateDocument,
  };
};
