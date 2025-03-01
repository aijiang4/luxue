import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, message } from 'antd';
import { ActionResult, ActionStep, Source } from '@refly/openapi-schema';
import { FilePlus } from 'lucide-react';
import { IconCheckCircle, IconCopy, IconImport } from '@arco-design/web-react/icon';
import { copyToClipboard } from '@refly-packages/ai-workspace-common/utils';
import { parseMarkdownCitationsAndCanvasTags, safeParseJSON } from '@refly/utils/parse';
import { useDocumentStoreShallow } from '@refly-packages/ai-workspace-common/stores/document';
import { useCreateDocument } from '@refly-packages/ai-workspace-common/hooks/canvas/use-create-document';
import { editorEmitter, EditorOperation } from '@refly-packages/utils/event-emitter/editor';
import { Dropdown, Menu } from '@arco-design/web-react';
import { HiOutlineCircleStack } from 'react-icons/hi2';

interface ActionContainerProps {
  step: ActionStep;
  result: ActionResult;
}

const ActionContainerComponent = ({ result, step }: ActionContainerProps) => {
  const { t } = useTranslation();
  const { debouncedCreateDocument } = useCreateDocument();
  const { hasEditorSelection, activeDocumentId } = useDocumentStoreShallow((state) => ({
    hasEditorSelection: state.hasEditorSelection,
    activeDocumentId: state.activeDocumentId,
  }));

  const { title } = result ?? {};
  const isPending = result?.status === 'executing';

  const sources = useMemo(
    () =>
      typeof step?.structuredData?.sources === 'string'
        ? safeParseJSON(step?.structuredData?.sources)
        : (step?.structuredData?.sources as Source[]),
    [step?.structuredData],
  );

  const editorActionList = useMemo(
    () => [
      {
        icon: <IconImport style={{ fontSize: 14 }} />,
        key: 'insertBelow',
        enabled: step.content && activeDocumentId,
      },
      {
        icon: <IconCheckCircle style={{ fontSize: 14 }} />,
        key: 'replaceSelection',
        enabled: step.content && activeDocumentId && hasEditorSelection,
      },
      {
        icon: <FilePlus style={{ fontSize: 14, width: 14, height: 14 }} />,
        key: 'createDocument',
        enabled: step.content,
      },
    ],
    [step.content, activeDocumentId, hasEditorSelection],
  );

  const [tokenUsage, setTokenUsage] = useState(0);

  useEffect(() => {
    let total = 0;
    for (const item of step?.tokenUsage || []) {
      total += (item?.inputTokens || 0) + (item?.outputTokens || 0);
    }
    setTokenUsage(total);
  }, [step?.tokenUsage]);

  const handleEditorOperation = useCallback(
    async (type: EditorOperation | 'createDocument', content: string) => {
      const parsedContent = parseMarkdownCitationsAndCanvasTags(content, sources);

      if (type === 'insertBelow' || type === 'replaceSelection') {
        editorEmitter.emit(type, parsedContent);
      } else if (type === 'createDocument') {
        await debouncedCreateDocument(title ?? '', content, {
          sourceNodeId: result.resultId,
          addToCanvas: true,
        });
      }
    },
    [sources, title, result.resultId, debouncedCreateDocument],
  );

  const handleCopyToClipboard = useCallback(
    (content: string) => {
      const parsedText = parseMarkdownCitationsAndCanvasTags(content, sources);
      copyToClipboard(parsedText || '');
      message.success(t('copilot.message.copySuccess'));
    },
    [sources, t],
  );

  const tokenUsageDropdownList = useMemo(
    () => (
      <Menu>
        {step?.tokenUsage?.map((item: any) => (
          <Menu.Item key={item?.modelName}>
            <div className="flex items-center">
              <span>
                {item?.modelName}:{' '}
                {t('copilot.tokenUsage', {
                  inputCount: item?.inputTokens,
                  outputCount: item?.outputTokens,
                })}
              </span>
            </div>
          </Menu.Item>
        ))}
      </Menu>
    ),
    [step?.tokenUsage, t],
  );

  return (
    <div className="flex items-center justify-between">
      <div className="-ml-1">
        {step?.tokenUsage?.length > 0 && (
          <Dropdown droplist={tokenUsageDropdownList}>
            <Button
              type="text"
              size="small"
              icon={<HiOutlineCircleStack style={{ fontSize: 14 }} />}
              className="text-gray-500 text-xs"
            >
              {tokenUsage} tokens
            </Button>
          </Dropdown>
        )}
      </div>
      {!isPending && (
        <div className="flex flex-row justify-between items-center text-sm">
          <div className="-ml-1 text-sm flex flex-row items-center">
            {step.content && (
              <Button
                type="text"
                size="small"
                icon={<IconCopy style={{ fontSize: 14 }} />}
                className="text-[#64645F] text-xs flex justify-center items-center h-6 px-1 rounded-lg hover:bg-[#f1f1f0] hover:text-[#00968f] transition-all duration-400 relative overflow-hidden group"
                onClick={() => handleCopyToClipboard(step.content)}
              >
                <span className="opacity-0 max-w-0 transform -translate-x-0.5 transition-all duration-400 whitespace-nowrap group-hover:opacity-100 group-hover:max-w-[200px] group-hover:translate-x-0 group-hover:ml-1">
                  {t('copilot.message.copy')}
                </span>
              </Button>
            )}
            {editorActionList.map((item) => (
              <Button
                key={item.key}
                size="small"
                type="text"
                className="text-[#64645F] text-xs flex justify-center items-center h-6 px-1 rounded-lg hover:bg-[#f1f1f0] hover:text-[#00968f] transition-all duration-400 relative overflow-hidden group"
                icon={item.icon}
                disabled={!item.enabled}
                onClick={() => {
                  const parsedText = parseMarkdownCitationsAndCanvasTags(step.content, sources);
                  handleEditorOperation(item.key as EditorOperation, parsedText || '');
                }}
              >
                <span className="opacity-0 max-w-0 transform -translate-x-0.5 transition-all duration-400 whitespace-nowrap group-hover:opacity-100 group-hover:max-w-[200px] group-hover:translate-x-0 group-hover:ml-1">
                  {t(`copilot.message.${item.key}`)}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ActionContainer = memo(ActionContainerComponent, (prevProps, nextProps) => {
  return prevProps.step === nextProps.step && prevProps.result === nextProps.result;
});
