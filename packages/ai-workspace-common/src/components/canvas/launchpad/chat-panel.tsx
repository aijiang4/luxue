import { Form } from '@arco-design/web-react';
import { notification, Button } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useContextPanelStore,
  useContextPanelStoreShallow,
} from '@refly-packages/ai-workspace-common/stores/context-panel';
import { useInvokeAction } from '@refly-packages/ai-workspace-common/hooks/canvas/use-invoke-action';
import { useContextFilterErrorTip } from './context-manager/hooks/use-context-filter-errror-tip';
import { genActionResultID } from '@refly-packages/utils/id';
import { useLaunchpadStoreShallow } from '@refly-packages/ai-workspace-common/stores/launchpad';
import { useChatStore, useChatStoreShallow } from '@refly-packages/ai-workspace-common/stores/chat';

import { SelectedSkillHeader } from './selected-skill-header';
import {
  useSkillStore,
  useSkillStoreShallow,
} from '@refly-packages/ai-workspace-common/stores/skill';
import { ContextManager } from './context-manager';
import { ConfigManager } from './config-manager';
import { ChatActions, CustomAction } from './chat-actions';
import { ChatInput } from './chat-input';

import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';
import { useSyncSelectedNodesToContext } from '@refly-packages/ai-workspace-common/hooks/canvas/use-sync-selected-nodes-to-context';
import { PiMagicWand } from 'react-icons/pi';
import { useAddNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-node';
import { convertContextItemsToNodeFilters } from '@refly-packages/ai-workspace-common/utils/map-context-items';
import { IoClose } from 'react-icons/io5';
import { useUserStoreShallow } from '@refly-packages/ai-workspace-common/stores/user';
import { useSubscriptionStoreShallow } from '@refly-packages/ai-workspace-common/stores/subscription';
import { useUploadImage } from '@refly-packages/ai-workspace-common/hooks/use-upload-image';
import { omit } from '@refly-packages/utils/index';
import { IoSchool } from 'react-icons/io5';
import './chat-panel.css';
import { useCanvasStore } from '@refly-packages/ai-workspace-common/stores/canvas';

const PremiumBanner = () => {
  const { t } = useTranslation();
  const { showPremiumBanner, setShowPremiumBanner } = useLaunchpadStoreShallow((state) => ({
    showPremiumBanner: state.showPremiumBanner,
    setShowPremiumBanner: state.setShowPremiumBanner,
  }));
  const setSubscribeModalVisible = useSubscriptionStoreShallow(
    (state) => state.setSubscribeModalVisible,
  );

  if (!showPremiumBanner) return null;

  const handleUpgrade = () => {
    setSubscribeModalVisible(true);
  };

  return (
    <div className="flex items-center justify-between px-3 py-0.5 bg-gray-100 border-b">
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="text-xs text-gray-600 flex-1 whitespace-nowrap">
          {t('copilot.premiumBanner.message')}
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            type="text"
            size="small"
            className="text-xs text-green-600 px-2"
            onClick={handleUpgrade}
          >
            {t('copilot.premiumBanner.upgrade')}
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IoClose size={14} className="flex items-center justify-center" />}
            onClick={() => setShowPremiumBanner(false)}
            className="text-gray-400 hover:text-gray-500 flex items-center justify-center w-5 h-5 min-w-0 p-0"
          />
        </div>
      </div>
    </div>
  );
};

export const ChatPanel = () => {
  const { t } = useTranslation();
  const { formErrors, setFormErrors } = useContextPanelStore((state) => ({
    formErrors: state.formErrors,
    setFormErrors: state.setFormErrors,
  }));

  // stores
  const userProfile = useUserStoreShallow((state) => state.userProfile);
  const { selectedSkill, setSelectedSkill } = useSkillStoreShallow((state) => ({
    selectedSkill: state.selectedSkill,
    setSelectedSkill: state.setSelectedSkill,
  }));
  const { contextItems, setContextItems, filterErrorInfo } = useContextPanelStoreShallow(
    (state) => ({
      contextItems: state.contextItems,
      setContextItems: state.setContextItems,
      filterErrorInfo: state.filterErrorInfo,
    }),
  );
  const skillStore = useSkillStoreShallow((state) => ({
    selectedSkill: state.selectedSkill,
    setSelectedSkill: state.setSelectedSkill,
  }));
  const chatStore = useChatStoreShallow((state) => ({
    newQAText: state.newQAText,
    setNewQAText: state.setNewQAText,
    selectedModel: state.selectedModel,
    setSelectedModel: state.setSelectedModel,
    resetState: state.resetState,
  }));
  const contextPanelStore = useContextPanelStoreShallow((state) => ({
    resetState: state.resetState,
  }));
  const { setShowLaunchpad } = useCanvasStore((state) => ({
    setShowLaunchpad: state.setShowLaunchpad,
  }));

  const [form] = Form.useForm();

  // hooks
  const { canvasId } = useCanvasContext();
  const { handleFilterErrorTip } = useContextFilterErrorTip();
  const { addNode } = useAddNode();
  const { invokeAction, abortAction } = useInvokeAction();
  const { handleUploadImage } = useUploadImage();

  // automatically sync selected nodes to context
  useSyncSelectedNodesToContext();

  useEffect(() => {
    if (!selectedSkill?.configSchema?.items?.length) {
      form.setFieldValue('tplConfig', undefined);
    } else {
      // Create default config from schema if no config exists
      const defaultConfig = {};
      for (const item of selectedSkill?.configSchema?.items || []) {
        if (item.defaultValue !== undefined) {
          defaultConfig[item.key] = {
            value: item.defaultValue,
            label: item.labelDict?.en ?? item.key,
            displayValue: String(item.defaultValue),
          };
        }
      }

      // Use existing config or fallback to default config
      const initialConfig = selectedSkill?.tplConfig ?? defaultConfig;
      form.setFieldValue('tplConfig', initialConfig);
    }
  }, [selectedSkill, form.setFieldValue]);

  const handleSendMessage = (userInput?: string) => {
    const error = handleFilterErrorTip();
    if (error) {
      return;
    }

    const { formErrors } = useContextPanelStore.getState();
    if (formErrors && Object.keys(formErrors).length > 0) {
      notification.error({
        message: t('copilot.configManager.errorTipTitle'),
        description: t('copilot.configManager.errorTip'),
      });
      return;
    }

    const tplConfig = form?.getFieldValue('tplConfig');

    const { selectedSkill } = useSkillStore.getState();
    const { newQAText, selectedModel } = useChatStore.getState();
    const query = userInput || newQAText.trim();

    const { contextItems } = useContextPanelStore.getState();

    const resultId = genActionResultID();

    chatStore.setNewQAText('');

    // Reset selected skill after sending message
    skillStore.setSelectedSkill(null);
    setContextItems([]);

    invokeAction(
      {
        query,
        resultId,
        selectedSkill,
        modelInfo: selectedModel,
        contextItems,
        tplConfig,
      },
      {
        entityType: 'canvas',
        entityId: canvasId,
      },
    );

    addNode(
      {
        type: 'skillResponse',
        data: {
          title: query,
          entityId: resultId,
          metadata: {
            status: 'executing',
            contextItems: contextItems.map((item) => omit(item, ['isPreview'])),
          },
        },
      },
      convertContextItemsToNodeFilters(contextItems),
    );
  };

  const handleAbort = () => {
    abortAction();
  };

  const { setRecommendQuestionsOpen, recommendQuestionsOpen } = useLaunchpadStoreShallow(
    (state) => ({
      setRecommendQuestionsOpen: state.setRecommendQuestionsOpen,
      recommendQuestionsOpen: state.recommendQuestionsOpen,
    }),
  );

  const handleRecommendQuestionsToggle = useCallback(() => {
    setRecommendQuestionsOpen(!recommendQuestionsOpen);
  }, [recommendQuestionsOpen, setRecommendQuestionsOpen]);

  const customActions: CustomAction[] = useMemo(
    () => [
      {
        icon: <PiMagicWand className="flex items-center" />,
        title: t('copilot.chatActions.recommendQuestions'),
        onClick: () => {
          handleRecommendQuestionsToggle();
        },
      },
    ],
    [handleRecommendQuestionsToggle, t],
  );

  const handleImageUpload = async (file: File) => {
    const nodeData = await handleUploadImage(file, canvasId);
    if (nodeData) {
      setContextItems([
        ...contextItems,
        {
          type: 'image',
          ...nodeData,
        },
      ]);
    }
  };

  return (
    <div>
      <div className="ai-copilot-chat-container">
        <div className="chat-input-container">
          <div className="chat-header">
            <div className="chalk-dust"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 2 }}>
              <IoSchool className="school-icon" size={24} />
              <span className="hidden sm:inline header-title" style={{ color: '#000000', textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>AI学习助手</span>
              <span className="sm:hidden header-title" style={{ color: '#000000', textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>学习助手</span>
            </div>
            <button 
              className="close-button"
              onClick={() => {
                chatStore.resetState();
                contextPanelStore.resetState();
                setShowLaunchpad(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
          
          <SelectedSkillHeader
            skill={selectedSkill}
            setSelectedSkill={setSelectedSkill}
            onClose={() => setSelectedSkill(null)}
          />
          {!userProfile?.subscription && <PremiumBanner />}
          <ContextManager
            className="p-2 px-3"
            contextItems={contextItems}
            setContextItems={setContextItems}
            filterErrorInfo={filterErrorInfo}
          />
          <div className="px-3 input-container">
            <div className="notebook-decoration"></div>
            <ChatInput
              query={chatStore.newQAText}
              setQuery={chatStore.setNewQAText}
              selectedSkillName={selectedSkill?.name}
              autoCompletionPlacement={'topLeft'}
              handleSendMessage={handleSendMessage}
              onUploadImage={handleImageUpload}
              inputClassName="border border-gray-200 rounded p-2 focus:border-blue-400 transition-all duration-300"
            />
          </div>

          {selectedSkill?.configSchema?.items?.length > 0 && (
            <ConfigManager
              key={selectedSkill?.name}
              form={form}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              schema={selectedSkill?.configSchema}
              tplConfig={selectedSkill?.tplConfig}
              fieldPrefix="tplConfig"
              configScope="runtime"
              resetConfig={() => {
                const defaultConfig = selectedSkill?.tplConfig ?? {};
                form.setFieldValue('tplConfig', defaultConfig);
              }}
            />
          )}

          <ChatActions
            className="p-2 px-3"
            query={chatStore.newQAText}
            model={chatStore.selectedModel}
            setModel={chatStore.setSelectedModel}
            form={form}
            handleSendMessage={handleSendMessage}
            handleAbort={handleAbort}
            customActions={customActions}
            onUploadImage={handleImageUpload}
            contextItems={contextItems}
          />
        </div>
      </div>
    </div>
  );
};
