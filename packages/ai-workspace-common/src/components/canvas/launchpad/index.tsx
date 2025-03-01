import { useEffect, memo, useCallback } from 'react';

import { ChatPanel } from './chat-panel';
import { SkillDisplay } from './skill-display';

// stores
import { useContextPanelStoreShallow } from '@refly-packages/ai-workspace-common/stores/context-panel';
import { useChatStoreShallow } from '@refly-packages/ai-workspace-common/stores/chat';
import { useLaunchpadStoreShallow } from '@refly-packages/ai-workspace-common/stores/launchpad';

// types
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';
import { RecommendQuestionsPanel } from '@refly-packages/ai-workspace-common/components/canvas/launchpad/recommend-questions-panel';

interface LaunchPadProps {
  visible?: boolean;
}

export const LaunchPad = memo(
  ({ visible = true }: LaunchPadProps) => {
    // stores
    const contextPanelStore = useContextPanelStoreShallow((state) => ({
      resetState: state.resetState,
    }));
    const chatStore = useChatStoreShallow((state) => ({
      newQAText: state.newQAText,
      setNewQAText: state.setNewQAText,
      resetState: state.resetState,
    }));

    const { canvasId } = useCanvasContext();

    const { recommendQuestionsOpen, setRecommendQuestionsOpen } = useLaunchpadStoreShallow(
      (state) => ({
        recommendQuestionsOpen: state.recommendQuestionsOpen,
        setRecommendQuestionsOpen: state.setRecommendQuestionsOpen,
      }),
    );

    // Add new method to clear state
    const clearLaunchpadState = useCallback(() => {
      chatStore.resetState();
      contextPanelStore.resetState();
    }, [chatStore.resetState, contextPanelStore.resetState]);

    // Handle canvas ID changes
    useEffect(() => {
      if (canvasId) {
        clearLaunchpadState();
      }
    }, [canvasId, clearLaunchpadState]);

    if (!visible) {
      return null;
    }

    return (
      <div 
        className="ai-copilot-operation-container" 
        data-cy="launchpad"
        style={{
          position: 'relative',
          zIndex: 100,
          animation: 'fadeIn 0.5s ease-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.zIndex = '1000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.zIndex = '100';
        }}
      >
        <div 
          className="ai-copilot-operation-body"
          style={{
            position: 'relative',
            zIndex: 100
          }}
        >
          <SkillDisplay />
          <RecommendQuestionsPanel
            isOpen={recommendQuestionsOpen}
            onClose={() => setRecommendQuestionsOpen(false)}
          />
          <ChatPanel />
        </div>
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.visible === nextProps.visible,
);
