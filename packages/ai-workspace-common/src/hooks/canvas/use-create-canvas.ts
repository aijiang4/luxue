import { useState } from 'react';
import { message } from 'antd';
import * as Y from 'yjs';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigate } from 'react-router-dom';
import { genCanvasID } from '@refly-packages/utils/id';
import { useSiderStore } from '@refly-packages/ai-workspace-common/stores/sider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useCanvasStoreShallow } from '@refly-packages/ai-workspace-common/stores/canvas';

export const useCreateCanvas = () => {
  const [isCreating, _setIsCreating] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCanvasLocalSynced, setCanvasRemoteSynced, setTitle } = useCanvasStoreShallow(
    (state) => ({
      setCanvasLocalSynced: state.setCanvasLocalSynced,
      setCanvasRemoteSynced: state.setCanvasRemoteSynced,
      setTitle: state.setTitle,
    }),
  );

  const debouncedCreateCanvas = useDebouncedCallback(
    async () => {
      const canvasId = genCanvasID();
      const { canvasList, setCanvasList } = useSiderStore.getState();
      const canvasTitle = '';

      setCanvasList(
        [
          {
            id: canvasId,
            name: canvasTitle,
            updatedAt: new Date().toJSON(),
            type: 'canvas' as const,
          },
          ...canvasList,
        ].slice(0, 10),
      );
      setTitle(canvasId, canvasTitle);

      // Initialize YJS document
      const ydoc = new Y.Doc();

      // Set up local persistence first
      const localProvider = new IndexeddbPersistence(canvasId, ydoc);

      // Wait for local sync
      await new Promise<void>((resolve) => {
        localProvider.once('synced', () => resolve());
      });

      // Initialize shared types
      const title = ydoc.getText('title');

      // Set initial data
      title.insert(0, canvasTitle);

      // Set canvas synced time
      setCanvasLocalSynced(canvasId, Date.now());
      setCanvasRemoteSynced(canvasId, Date.now());

      message.success(t('canvas.action.addSuccess'));
      navigate(`/canvas/${canvasId}`);
    },
    300,
    { leading: true },
  );

  return { debouncedCreateCanvas, isCreating };
};
