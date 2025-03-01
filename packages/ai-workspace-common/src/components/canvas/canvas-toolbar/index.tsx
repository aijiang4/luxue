import { Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { memo, useCallback, useMemo, useState } from 'react';
import { SearchList } from '@refly-packages/ai-workspace-common/modules/entity-selector/components';
import { useImportResourceStoreShallow } from '@refly-packages/ai-workspace-common/stores/import-resource';
import { CanvasNodeType, SearchDomain } from '@refly/openapi-schema';
import { ContextItem } from '@refly-packages/ai-workspace-common/types/context';
import { useAddNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-node';
import { ImportResourceModal } from '@refly-packages/ai-workspace-common/components/import-resource';
import { SourceListModal } from '@refly-packages/ai-workspace-common/components/source-list/source-list-modal';
import { useKnowledgeBaseStoreShallow } from '@refly-packages/ai-workspace-common/stores/knowledge-base';
import { getRuntime } from '@refly/utils/env';
import {
  IconAskAI,
  IconAskAIInput,
  IconCreateDocument,
  IconDocument,
  IconImportResource,
  IconMemo,
  IconResource,
  IconCanvas,
} from '@refly-packages/ai-workspace-common/components/common/icon';
import { LuPencil } from 'react-icons/lu';
import { MdVideoCameraBack } from 'react-icons/md';
import { RiPencilFill } from 'react-icons/ri';
import TooltipWrapper from '@refly-packages/ai-workspace-common/components/common/tooltip-button';
import { useCanvasStoreShallow } from '@refly-packages/ai-workspace-common/stores/canvas';
import { IoAnalyticsOutline } from 'react-icons/io5';
import { useCreateDocument } from '@refly-packages/ai-workspace-common/hooks/canvas/use-create-document';
import { useContextPanelStoreShallow } from '@refly-packages/ai-workspace-common/stores/context-panel';
import { useEdgeVisible } from '@refly-packages/ai-workspace-common/hooks/canvas/use-edge-visible';
import { ToolButton, type ToolbarItem } from './tool-button';
import { HoverCard } from '@refly-packages/ai-workspace-common/components/hover-card';
import { genMemoID, genSkillID } from '@refly-packages/utils/id';
import { useHoverCard } from '@refly-packages/ai-workspace-common/hooks/use-hover-card';
import './styles.css';

interface ToolbarProps {
  onToolSelect?: (tool: string) => void;
}

const useToolbarConfig = () => {
  const { t } = useTranslation();
  const { showLaunchpad, showEdges, drawingMode } = useCanvasStoreShallow((state) => ({
    showLaunchpad: state.showLaunchpad,
    showEdges: state.showEdges,
    drawingMode: state.drawingMode,
  }));

  const sourceListDrawerVisible = useKnowledgeBaseStoreShallow(
    (state) => state.sourceListDrawer.visible,
  );
  const runtime = getRuntime();
  const isWeb = runtime === 'web';

  return useMemo(
    () => ({
      tools: [
        {
          icon: IconAskAI,
          value: 'askAI',
          type: 'button',
          isPrimary: true,
          domain: 'skill',
          tooltip: t('canvas.toolbar.askAI'),
          hoverContent: {
            title: t('canvas.toolbar.askAI'),
            description: t('canvas.toolbar.askAIDescription'),
            videoUrl: 'https://static.refly.ai/onboarding/menuPopper/menuPopper-askAI.webm',
          },
        },
        {
          icon: IconCanvas,
          value: 'pencil',
          type: 'button',
          domain: 'pencil',
          tooltip: 'AI黑板',
          hoverContent: {
            title: 'AI黑板',
            description: '使用智能黑板在画布上绘制和教学',
            videoUrl: '',
          },
        },
        {
          icon: RiPencilFill,
          value: 'canvasDrawing',
          type: 'button',
          domain: 'drawing',
          tooltip: '画笔标注',
          active: drawingMode,
          hoverContent: {
            title: '画笔标注',
            description: '使用画笔在整个画布上进行标注和绘画',
            videoUrl: '',
          },
        },
        {
          icon: MdVideoCameraBack,
          value: 'videoStand',
          type: 'button',
          domain: 'videoStand',
          tooltip: '视频展台',
          hoverContent: {
            title: '视频展台',
            description: '使用视频展台进行实时展示',
            videoUrl: '',
          },
        },
        {
          icon: IconMemo,
          value: 'createMemo',
          type: 'button',
          domain: 'memo',
          tooltip: t('canvas.toolbar.createMemo'),
          hoverContent: {
            title: t('canvas.toolbar.createMemo'),
            description: t('canvas.toolbar.createMemoDescription'),
            videoUrl: 'https://static.refly.ai/onboarding/menuPopper/menuPopper-createMemo.webm',
          },
        },
        {
          icon: IconImportResource,
          value: 'importResource',
          type: 'button',
          domain: 'resource',
          tooltip: t('canvas.toolbar.importResource'),
          hoverContent: {
            title: t('canvas.toolbar.importResource'),
            description: t('canvas.toolbar.importResourceDescription'),
            videoUrl:
              'https://static.refly.ai/onboarding/canvas-toolbar/canvas-toolbar-import-resource.webm',
          },
        },
        {
          icon: IconResource,
          value: 'addResource',
          type: 'popover',
          domain: 'resource',
          tooltip: t('canvas.toolbar.addResource'),
        },
        {
          icon: IconCreateDocument,
          value: 'createDocument',
          type: 'button',
          domain: 'document',
          tooltip: t('canvas.toolbar.createDocument'),
          hoverContent: {
            title: t('canvas.toolbar.createDocument'),
            description: t('canvas.toolbar.createDocumentDescription'),
            videoUrl:
              'https://static.refly.ai/onboarding/canvas-toolbar/canvas-toolbar-create-document.webm',
          },
        },
        {
          icon: IconDocument,
          value: 'addDocument',
          type: 'popover',
          domain: 'document',
          tooltip: t('canvas.toolbar.addDocument'),
        },
        {
          type: 'divider',
          value: 'divider1',
        },
        {
          icon: IconAskAIInput,
          value: 'handleLaunchpad',
          type: 'button',
          domain: 'launchpad',
          tooltip: t(`canvas.toolbar.${showLaunchpad ? 'hideLaunchpad' : 'showLaunchpad'}`),
          hoverContent: {
            title: t('canvas.toolbar.toggleLaunchpadTitle'),
            videoUrl:
              'https://static.refly.ai/onboarding/canvas-toolbar/canvas-toolbar-toggle-ask-ai.webm',
          },
        },
        {
          icon: IoAnalyticsOutline,
          value: 'showEdges',
          type: 'button',
          domain: 'edges',
          tooltip: t(`canvas.toolbar.${showEdges ? 'hideEdges' : 'showEdges'}`),
          hoverContent: {
            title: t('canvas.toolbar.toggleEdgeTitle'),
            videoUrl:
              'https://static.refly.ai/onboarding/canvas-toolbar/canvas-toolbar-toggle-edge.webm',
          },
        },
      ] as ToolbarItem[],
      modals: {
        sourceList: sourceListDrawerVisible && isWeb,
      },
    }),
    [t, showEdges, showLaunchpad, sourceListDrawerVisible, isWeb, drawingMode],
  );
};

const SearchListWrapper = memo(
  ({
    tool,
    handleConfirm,
  }: {
    tool: ToolbarItem;
    handleConfirm: (items: ContextItem[]) => void;
  }) => {
    const handleToolSelect = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
    }, []);

    const [open, setOpen] = useState(false);
    const { hoverCardEnabled } = useHoverCard();

    const button = (
      <Button
        type="text"
        onClick={handleToolSelect}
        style={{
          background: 'linear-gradient(to bottom, #f5f5dc, #e9e2c9)',
          border: '1px solid #8B4513',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          margin: '2px auto'
        }}
        className="school-tool-button"
        icon={<tool.icon style={{
          color: '#5D3A1A',
          fontSize: '18px',
          transition: 'all 0.2s ease'
        }} />}
      />
    );

    return (
      <SearchList
        domain={tool.domain as SearchDomain}
        handleConfirm={handleConfirm}
        offset={12}
        placement="right"
        open={open}
        setOpen={setOpen}
      >
        {tool.hoverContent && hoverCardEnabled ? (
          <HoverCard
            title={tool.hoverContent.title}
            description={tool.hoverContent.description}
            videoUrl={tool.hoverContent.videoUrl}
            placement="right"
            overlayStyle={{ marginLeft: '12px' }}
            align={{ offset: [12, 0] }}
          >
            {button}
          </HoverCard>
        ) : (
          <TooltipWrapper tooltip={tool.tooltip}>{button}</TooltipWrapper>
        )}
      </SearchList>
    );
  },
);

export const CanvasToolbar = memo<ToolbarProps>(({ onToolSelect }) => {
  const { t } = useTranslation();
  const { addNode } = useAddNode();

  // 4. 使用 selector 函数分离状态
  const { 
    showLaunchpad, 
    setShowLaunchpad, 
    showEdges, 
    drawingMode, 
    setDrawingMode 
  } = useCanvasStoreShallow((state) => ({
    showLaunchpad: state.showLaunchpad,
    setShowLaunchpad: state.setShowLaunchpad,
    showEdges: state.showEdges,
    drawingMode: state.drawingMode,
    setDrawingMode: state.setDrawingMode,
  }));

  const { setImportResourceModalVisible } = useImportResourceStoreShallow((state) => ({
    setImportResourceModalVisible: state.setImportResourceModalVisible,
  }));

  const contextItems = useContextPanelStoreShallow((state) => state.contextItems);
  const { createSingleDocumentInCanvas, isCreating } = useCreateDocument();
  const { toggleEdgeVisible } = useEdgeVisible();

  const { tools, modals } = useToolbarConfig();

  const getIconColor = useCallback(
    (tool: string) => {
      if (tool === 'showEdges' && !showEdges) return '#9CA3AF';
      if (tool === 'handleLaunchpad' && !showLaunchpad) return '#9CA3AF';
      if (tool === 'canvasDrawing' && !drawingMode) return '#9CA3AF';
      return '';
    },
    [showEdges, showLaunchpad, drawingMode],
  );

  const getIsLoading = useCallback(
    (tool: string) => {
      return tool === 'createDocument' && isCreating;
    },
    [isCreating],
  );

  const createSkillNode = useCallback(() => {
    addNode({
      type: 'skill',
      data: { title: 'Skill', entityId: genSkillID() },
    });
  }, [addNode]);

  const createMemo = useCallback(() => {
    const memoId = genMemoID();
    addNode({
      type: 'memo',
      data: { title: t('canvas.nodeTypes.memo'), entityId: memoId },
    });
  }, [addNode, t]);

  const handleToolSelect = useCallback(
    (_event: React.MouseEvent, tool: string) => {
      // 如果当前在绘画模式，并且选择了其他工具，则退出绘画模式
      if (drawingMode && tool !== 'canvasDrawing') {
        setDrawingMode(false);
      }
      
      switch (tool) {
        case 'importResource':
          setImportResourceModalVisible(true);
          break;
        case 'createDocument':
          createSingleDocumentInCanvas();
          break;
        case 'handleLaunchpad':
          setShowLaunchpad(!showLaunchpad);
          break;
        case 'showEdges':
          toggleEdgeVisible();
          break;
        case 'askAI':
          createSkillNode();
          break;
        case 'createMemo':
          createMemo();
          break;
        case 'pencil':
          addNode({
            type: 'pencil' as CanvasNodeType,
            data: { 
              title: 'AI黑板',
              entityId: `pencil-${Date.now()}`
            },
          });
          break;
        case 'videoStand':
          addNode({
            type: 'videoStand' as CanvasNodeType,
            data: {
              title: '视频展台',
              entityId: `videoStand-${Date.now()}`
            },
          });
          break;
        case 'canvasDrawing':
          setDrawingMode(!drawingMode);
          break;
      }
      onToolSelect?.(tool);
    },
    [
      setImportResourceModalVisible,
      createSingleDocumentInCanvas,
      setShowLaunchpad,
      showLaunchpad,
      toggleEdgeVisible,
      createSkillNode,
      createMemo,
      addNode,
      onToolSelect,
      drawingMode,
      setDrawingMode,
    ],
  );

  const handleConfirm = useCallback(
    (selectedItems: ContextItem[]) => {
      for (const item of selectedItems) {
        const contentPreview = item?.snippets?.map((snippet) => snippet?.text || '').join('\n');
        addNode(
          {
            type: item.domain as CanvasNodeType,
            data: {
              title: item.title,
              entityId: item.id,
              contentPreview: item?.contentPreview || contentPreview,
              metadata:
                item.domain === 'resource' ? { resourceType: item?.metadata?.resourceType } : {},
            },
          },
          undefined,
          false,
          true,
        );
      }
    },
    [addNode],
  );

  return (
    <div
      className="absolute left-[12px] top-1/2 -translate-y-1/2 bg-white border border-solid border-gray-100 shadow-sm rounded-lg p-2 flex flex-col gap-2 z-10 school-toolbar-container"
      data-cy="canvas-toolbar"
      style={{
        background: 'linear-gradient(to right, #5D3A1A, #8B4513)',
        border: '2px solid #432818',
        boxShadow: '5px 0 15px rgba(0,0,0,0.4)',
        borderRadius: '8px',
        padding: '15px 6px',
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '50px',
        overflow: 'visible',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 书架顶部装饰 */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        left: '0',
        right: '0',
        height: '10px',
        background: '#432818',
        borderRadius: '5px 5px 0 0',
        boxShadow: '0 -2px 5px rgba(0,0,0,0.3)',
        zIndex: 1
      }}></div>
      
      {/* 书架底部装饰 */}
      <div style={{
        position: 'absolute',
        bottom: '-10px',
        left: '0',
        right: '0',
        height: '10px',
        background: '#432818',
        borderRadius: '0 0 5px 5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        zIndex: 1
      }}></div>
      
      {/* 书架隔板 - 顶部 */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '0',
        right: '0',
        height: '4px',
        background: '#432818',
        boxShadow: '0 2px 3px rgba(0,0,0,0.2)',
        zIndex: 1
      }}></div>
      
      {/* 书架隔板 - 中部 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        height: '4px',
        background: '#432818',
        boxShadow: '0 2px 3px rgba(0,0,0,0.2)',
        zIndex: 1
      }}></div>
      
      {/* 书架隔板 - 底部 */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '0',
        right: '0',
        height: '4px',
        background: '#432818',
        boxShadow: '0 2px 3px rgba(0,0,0,0.2)',
        zIndex: 1
      }}></div>
      
      {/* 书架侧面纹理 */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '5px',
        height: '100%',
        background: '#432818',
        boxShadow: '-2px 0 3px rgba(0,0,0,0.1) inset',
        zIndex: 1,
        borderRadius: '0 8px 8px 0'
      }}></div>
      
      {/* 工具架装饰 */}
      <div style={{
        width: '100%',
        height: '6px',
        background: '#432818',
        borderRadius: '3px',
        marginBottom: '4px',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
        position: 'relative',
        zIndex: 2
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        {tools.map((tool) => {
          if (tool.type === 'divider') {
            return <Divider key={tool.value} className="m-0" style={{ borderColor: '#432818', opacity: 0.7, margin: '8px 0' }} />;
          }

          if (tool.type === 'button') {
            return (
              <ToolButton
                key={tool.value}
                tool={{
                  ...tool,
                  active: tool.value === 'showEdges' && showEdges || tool.value === 'handleLaunchpad' && !showLaunchpad
                }}
                contextCnt={contextItems?.length}
                handleToolSelect={handleToolSelect}
                getIconColor={getIconColor}
                getIsLoading={getIsLoading}
              />
            );
          }

          return <SearchListWrapper key={tool.value} tool={tool} handleConfirm={handleConfirm} />;
        })}
      </div>
      
      {/* 工具架装饰 */}
      <div style={{
        width: '100%',
        height: '6px',
        background: '#432818',
        borderRadius: '3px',
        marginTop: '4px',
        boxShadow: 'inset 0 -1px 2px rgba(255,255,255,0.3)',
        position: 'relative',
        zIndex: 2
      }}></div>

      <ImportResourceModal />
      {modals.sourceList && <SourceListModal classNames="source-list-modal" />}
    </div>
  );
});
