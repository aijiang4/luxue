import { Button, Tooltip, Upload } from 'antd';
import { FormInstance } from '@arco-design/web-react';
import { memo, useMemo, useRef } from 'react';
import { IconImage } from '@refly-packages/ai-workspace-common/components/common/icon';
import { IconSend } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';
import { useUserStoreShallow } from '@refly-packages/ai-workspace-common/stores/user';
import { getRuntime } from '@refly/utils/env';
import { ModelSelector } from './model-selector';
import { ModelInfo } from '@refly/openapi-schema';
import { cn } from '@refly-packages/utils/index';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';
import { useUploadImage } from '@refly-packages/ai-workspace-common/hooks/use-upload-image';
import { IContextItem } from '@refly-packages/ai-workspace-common/stores/context-panel';
import './chat-actions.css';

export interface CustomAction {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

interface ChatActionsProps {
  query: string;
  model: ModelInfo;
  setModel: (model: ModelInfo) => void;
  className?: string;
  form?: FormInstance;
  handleSendMessage: () => void;
  handleAbort: () => void;
  customActions?: CustomAction[];
  onUploadImage?: (file: File) => Promise<void>;
  contextItems: IContextItem[];
}

export const ChatActions = memo(
  (props: ChatActionsProps) => {
    const {
      query,
      model,
      setModel,
      handleSendMessage,
      customActions,
      className,
      onUploadImage,
      contextItems,
    } = props;
    const { t } = useTranslation();
    const { canvasId } = useCanvasContext();
    const { handleUploadImage } = useUploadImage();

    const handleSendClick = () => {
      handleSendMessage();
    };

    const handleImageUpload = async (file: File) => {
      if (onUploadImage) {
        await onUploadImage(file);
      } else {
        await handleUploadImage(file, canvasId);
      }
      return false;
    };

    // hooks
    const isWeb = getRuntime() === 'web';

    const userStore = useUserStoreShallow((state) => ({
      isLogin: state.isLogin,
    }));

    const canSendEmptyMessage = useMemo(() => query?.trim(), [query]);
    const canSendMessage = useMemo(
      () => !userStore.isLogin || canSendEmptyMessage,
      [userStore.isLogin, canSendEmptyMessage],
    );

    const containerRef = useRef<HTMLDivElement>(null);

    return (
      <div className={cn('flex justify-between items-center p-2', className)} ref={containerRef} style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTop: '1px solid rgba(255, 107, 107, 0.2)',
        padding: '10px 16px',
        backgroundImage: 'linear-gradient(to right, rgba(255, 107, 107, 0.05), rgba(255, 142, 83, 0.08), rgba(255, 107, 107, 0.05))',
        position: 'relative',
        borderRadius: '0 0 16px 16px'
      }}>
        <div className="wave-decoration"></div>
        <div className="flex gap-2.5" style={{ position: 'relative', zIndex: 10000 }}>
          <ModelSelector
            model={model}
            setModel={setModel}
            briefMode={false}
            trigger={['click']}
            contextItems={contextItems}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          {customActions?.map((action, index) => (
            <Tooltip title={action.title} key={index}>
              <Button 
                size="small" 
                icon={action.icon} 
                onClick={action.onClick} 
                className="mr-0 action-button" 
              />
            </Tooltip>
          ))}

          <Upload accept="image/*" showUploadList={false} beforeUpload={handleImageUpload}>
            <Tooltip title={t('common.uploadImage')}>
              <Button
                className="translate-y-[0.5px] action-button"
                size="small"
                icon={<IconImage className="flex items-center" />}
              />
            </Tooltip>
          </Upload>

          {!isWeb ? null : (
            <Button
              size="small"
              type="primary"
              disabled={!canSendMessage}
              className="text-xs flex items-center gap-1 send-button"
              onClick={handleSendClick}
            >
              {canSendMessage && (
                <span className="send-button-effect"></span>
              )}
              <IconSend />
              <span>{t('copilot.chatActions.send')}</span>
            </Button>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.handleSendMessage === nextProps.handleSendMessage &&
      prevProps.handleAbort === nextProps.handleAbort &&
      prevProps.contextItems === nextProps.contextItems
    );
  },
);

ChatActions.displayName = 'ChatActions';
