import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import { editorEmitter } from '@refly-packages/utils/event-emitter/editor';
import { useDocumentStoreShallow } from '@refly-packages/ai-workspace-common/stores/document';
import { useCollabToken } from '@refly-packages/ai-workspace-common/hooks/use-collab-token';
import { wsServerOrigin } from '@refly-packages/ai-workspace-common/utils/env';

interface DocumentContextType {
  docId: string;
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
  localProvider: IndexeddbPersistence;
  isLoading: boolean;
}

const DocumentContext = createContext<DocumentContextType | null>(null);

const providerCache = new Map<
  string,
  { remote: HocuspocusProvider; local: IndexeddbPersistence }
>();

const getTitleFromYDoc = (ydoc: Y.Doc) => {
  const title = ydoc.getText('title');
  return title.toJSON();
};

export const DocumentProvider = ({
  docId,
  children,
}: { docId: string; children: React.ReactNode }) => {
  const { token, refreshToken } = useCollabToken();
  const [isLoading, setIsLoading] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  const { setDocumentLocalSyncedAt, setDocumentRemoteSyncedAt, updateDocument } =
    useDocumentStoreShallow((state) => ({
      setDocumentLocalSyncedAt: state.setDocumentLocalSyncedAt,
      setDocumentRemoteSyncedAt: state.setDocumentRemoteSyncedAt,
      updateDocument: state.updateDocument,
    }));

  const updateDocumentData = useCallback(
    (ydoc: Y.Doc) => {
      const title = getTitleFromYDoc(ydoc);
      updateDocument(docId, { docId, title });
    },
    [docId, updateDocument],
  );

  const {
    remote: provider,
    local: localProvider,
    doc,
  } = useMemo(() => {
    const existingProvider = providerCache.get(docId);
    if (existingProvider?.remote?.status === 'connected') {
      return { ...existingProvider, doc: existingProvider.remote.document };
    }

    const doc = new Y.Doc();

    const remoteProvider = new HocuspocusProvider({
      url: wsServerOrigin,
      name: docId,
      token,
      document: doc,
      connect: true,
      onAuthenticationFailed: () => {
        console.log('Authentication failed, refreshing token');
        refreshToken();
      },
    });

    const handleRemoteSync = () => {
      setDocumentRemoteSyncedAt(docId, Date.now());
      editorEmitter.emit('editorSynced');
      setIsLoading(false);
    };

    remoteProvider.on('synced', handleRemoteSync);

    const localProvider = new IndexeddbPersistence(docId, doc);

    const handleLocalSync = () => {
      updateDocumentData(doc);
      setDocumentLocalSyncedAt(docId, Date.now());
      setIsLoading(false);
    };

    localProvider.on('synced', handleLocalSync);

    const providers = { remote: remoteProvider, local: localProvider };
    providerCache.set(docId, providers);

    return { remote: remoteProvider, local: localProvider, doc };
  }, [docId, token, updateDocumentData]);

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

    // Get reference to the shared types
    const title = ydoc.getText('title');

    // Connect handler
    const handleConnect = () => {
      if (isDestroyed) return;

      if (provider.status === 'connected') {
        updateDocumentData(ydoc);
      }

      const titleObserverCallback = () => {
        if (provider.status === 'connected') {
          updateDocumentData(ydoc);
        }
      };

      // Add observer
      title.observe(titleObserverCallback);

      // Store cleanup function
      return () => {
        title.unobserve(titleObserverCallback);
      };
    };

    const cleanup = handleConnect();
    provider.on('connect', handleConnect);

    return () => {
      isDestroyed = true;
      cleanup?.(); // Clean up observers
      provider.off('connect', handleConnect);
    };
  }, [provider, docId, updateDocumentData]);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      const providers = providerCache.get(docId);
      if (providers) {
        if (providers.remote.status === 'connected') {
          providers.remote.forceSync();
        }
        providers.remote.destroy();
        providers.local.destroy();
        providerCache.delete(docId);
      }
    };
  }, [docId]);

  // Add loading state check
  if (!provider || isLoading) {
    return null;
  }

  return (
    <DocumentContext.Provider value={{ docId, provider, localProvider, ydoc: doc, isLoading }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};
