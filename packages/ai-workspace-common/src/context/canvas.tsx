import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { CanvasNode } from '@refly-packages/ai-workspace-common/components/canvas/nodes/shared/types';
import { Edge } from '@xyflow/react';
import { useCanvasStoreShallow } from '@refly-packages/ai-workspace-common/stores/canvas';
import { useCollabToken } from '@refly-packages/ai-workspace-common/hooks/use-collab-token';
import { wsServerOrigin } from '@refly-packages/ai-workspace-common/utils/env';

interface CanvasContextType {
  canvasId: string;
  provider: HocuspocusProvider;
  localProvider: IndexeddbPersistence;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

const providerCache = new Map<
  string,
  { remote: HocuspocusProvider; local: IndexeddbPersistence }
>();

const getTitleFromYDoc = (ydoc: Y.Doc) => {
  const title = ydoc.getText('title');
  return title.toJSON();
};

const getNodesFromYDoc = (ydoc: Y.Doc) => {
  const nodesArray = ydoc.getArray<CanvasNode>('nodes');
  const nodes = nodesArray.toJSON();
  const uniqueNodesMap = new Map();
  for (const node of nodes) {
    uniqueNodesMap.set(node.id, node);
  }
  return Array.from(uniqueNodesMap.values());
};

const getEdgesFromYDoc = (ydoc: Y.Doc) => {
  const edgesArray = ydoc.getArray<Edge>('edges');
  const edges = edgesArray.toJSON();
  const uniqueEdgesMap = new Map();
  for (const edge of edges) {
    uniqueEdgesMap.set(edge.id, edge);
  }
  return Array.from(uniqueEdgesMap.values());
};

export const CanvasProvider = ({
  canvasId,
  children,
}: { canvasId: string; children: React.ReactNode }) => {
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  const { token, refreshToken } = useCollabToken();

  const { setCanvasLocalSynced, setCanvasRemoteSynced } = useCanvasStoreShallow((state) => ({
    setCanvasLocalSynced: state.setCanvasLocalSynced,
    setCanvasRemoteSynced: state.setCanvasRemoteSynced,
  }));

  const { setTitle, setNodes, setEdges } = useCanvasStoreShallow((state) => ({
    setTitle: state.setTitle,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  }));

  const setCanvasDataFromYDoc = useCallback(
    (ydoc: Y.Doc) => {
      setTitle(canvasId, getTitleFromYDoc(ydoc));
      setNodes(canvasId, getNodesFromYDoc(ydoc));
      setEdges(canvasId, getEdgesFromYDoc(ydoc));
    },
    [canvasId, setTitle, setNodes, setEdges],
  );

  const { remote: provider, local: localProvider } = useMemo(() => {
    const existingProvider = providerCache.get(canvasId);
    if (existingProvider?.remote?.status === 'connected') {
      return existingProvider;
    }

    const doc = new Y.Doc();

    const remoteProvider = new HocuspocusProvider({
      url: wsServerOrigin,
      name: canvasId,
      token,
      document: doc,
      connect: true,
      onAuthenticationFailed: (data) => {
        console.log('onAuthenticationFailed', data);
        refreshToken();
      },
    });

    const handleSync = () => {
      setCanvasRemoteSynced(canvasId, Date.now());
    };

    remoteProvider.on('synced', handleSync);

    const localProvider = new IndexeddbPersistence(canvasId, doc);

    const handleLocalSync = () => {
      setCanvasDataFromYDoc(doc);
      setCanvasLocalSynced(canvasId, Date.now());
    };

    localProvider.on('synced', handleLocalSync);

    const providers = { remote: remoteProvider, local: localProvider };
    providerCache.set(canvasId, providers);

    return providers;
  }, [canvasId, token, setCanvasRemoteSynced, setCanvasLocalSynced, setCanvasDataFromYDoc]);

  // Handle connection retries
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleConnection = () => {
      if (provider.status !== 'connected' && connectionAttempts < MAX_RETRIES) {
        timeoutId = setTimeout(() => {
          console.log(`Retrying connection attempt ${connectionAttempts + 1}/${MAX_RETRIES}`);
          provider.connect();
          setConnectionAttempts((prev) => prev + 1);
        }, RETRY_DELAY);
      }
    };

    const handleStatus = ({ status }: { status: string }) => {
      if (status === 'connected') {
        setConnectionAttempts(0);
      } else {
        handleConnection();
      }
    };

    provider.on('status', handleStatus);

    return () => {
      clearTimeout(timeoutId);
      provider.off('status', handleStatus);
    };
  }, [provider, connectionAttempts]);

  // Subscribe to yjs document changes
  useEffect(() => {
    const ydoc = provider.document;
    if (!ydoc) return;

    let isDestroyed = false;

    // Get references to the shared types
    const title = ydoc.getText('title');
    const nodesArray = ydoc.getArray<CanvasNode>('nodes');
    const edgesArray = ydoc.getArray<Edge>('edges');

    // Connect handler
    const handleConnect = () => {
      if (isDestroyed) return;

      if (provider.status === 'connected') {
        setCanvasDataFromYDoc(ydoc);
      }

      const titleObserverCallback = () => {
        if (provider.status === 'connected') {
          setTitle(canvasId, getTitleFromYDoc(ydoc));
        }
      };

      const nodesObserverCallback = () => {
        if (provider.status === 'connected') {
          setNodes(canvasId, getNodesFromYDoc(ydoc));
        }
      };

      const edgesObserverCallback = () => {
        if (provider.status === 'connected') {
          setEdges(canvasId, getEdgesFromYDoc(ydoc));
        }
      };

      // Add observers
      title.observe(titleObserverCallback);
      nodesArray.observe(nodesObserverCallback);
      edgesArray.observe(edgesObserverCallback);

      // Store cleanup functions
      return () => {
        title.unobserve(titleObserverCallback);
        nodesArray.unobserve(nodesObserverCallback);
        edgesArray.unobserve(edgesObserverCallback);
      };
    };

    const cleanup = handleConnect();
    provider.on('connect', handleConnect);

    return () => {
      isDestroyed = true;
      cleanup?.(); // Clean up observers
      provider.off('connect', handleConnect);
    };
  }, [provider, canvasId, setNodes, setEdges, setTitle, setCanvasDataFromYDoc]);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      const providers = providerCache.get(canvasId);
      if (providers) {
        if (providers.remote.status === 'connected') {
          providers.remote.forceSync();
        }
        providers.remote.destroy();
        providers.local.destroy();
        providerCache.delete(canvasId);
      }
    };
  }, [canvasId]);

  const value = useMemo(
    () => ({
      canvasId,
      provider,
      localProvider,
    }),
    [canvasId, provider, localProvider],
  );

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
};
