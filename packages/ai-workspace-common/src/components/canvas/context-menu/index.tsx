import { Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { FC, useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useCreateDocument } from '@refly-packages/ai-workspace-common/hooks/canvas/use-create-document';
import { useCanvasStoreShallow } from '@refly-packages/ai-workspace-common/stores/canvas';
import {
  IconPreview,
  IconExpand,
  IconShrink,
  IconAskAIInput,
  IconGuideLine,
} from '@refly-packages/ai-workspace-common/components/common/icon';
import { IoAnalyticsOutline } from 'react-icons/io5';
import { useEdgeVisible } from '@refly-packages/ai-workspace-common/hooks/canvas/use-edge-visible';
import { useNodeOperations } from '@refly-packages/ai-workspace-common/hooks/canvas/use-node-operations';
import { RiLayoutLine } from 'react-icons/ri';
import { HoverCard } from '@refly-packages/ai-workspace-common/components/hover-card';
import { useHoverCard } from '@refly-packages/ai-workspace-common/hooks/use-hover-card';

interface ContextMenuProps {
  open: boolean;
  position: { x: number; y: number };
  setOpen: (open: boolean) => void;
  isSelection?: boolean;
  onCreateGroup?: () => void;
}

interface MenuItem {
  key: string;
  icon?: React.ElementType;
  type: 'button' | 'divider';
  active?: boolean;
  title?: string;
  description?: string;
  videoUrl?: string;
}

export const ContextMenu: FC<ContextMenuProps> = ({ open, position, setOpen }) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuHeight, setMenuHeight] = useState<number>(0);
  const { isCreating } = useCreateDocument();
  const {
    showEdges,
    showLaunchpad,
    clickToPreview,
    nodeSizeMode,
    setShowLaunchpad,
    setClickToPreview,
    setNodeSizeMode,
    autoLayout,
    setAutoLayout,
  } = useCanvasStoreShallow((state) => ({
    showEdges: state.showEdges,
    showLaunchpad: state.showLaunchpad,
    clickToPreview: state.clickToPreview,
    nodeSizeMode: state.nodeSizeMode,
    setShowEdges: state.setShowEdges,
    setShowLaunchpad: state.setShowLaunchpad,
    setClickToPreview: state.setClickToPreview,
    setNodeSizeMode: state.setNodeSizeMode,
    autoLayout: state.autoLayout,
    setAutoLayout: state.setAutoLayout,
  }));
  const { hoverCardEnabled, toggleHoverCard } = useHoverCard();
  const { toggleEdgeVisible } = useEdgeVisible();
  const { updateAllNodesSizeMode } = useNodeOperations();

  const menuItems: MenuItem[] = [
    {
      key: 'toggleLaunchpad',
      icon: IconAskAIInput,
      type: 'button',
      active: showLaunchpad,
      title: showLaunchpad
        ? t('canvas.contextMenu.hideLaunchpad')
        : t('canvas.contextMenu.showLaunchpad'),
      description: t('canvas.contextMenu.toggleLaunchpadDescription'),
      videoUrl:
        'https://static.refly.ai/onboarding/canvas-toolbar/canvas-toolbar-toggle-ask-ai.webm',
    },
    {
      key: 'toggleEdges',
      icon: IoAnalyticsOutline,
      type: 'button',
      active: showEdges,
      title: showEdges ? t('canvas.contextMenu.hideEdges') : t('canvas.contextMenu.showEdges'),
      description: t('canvas.contextMenu.toggleEdgeDescription'),
      videoUrl: 'https://static.refly.ai/onboarding/canvas-toolbar/canvas-toolbar-toggle-edge.webm',
    },
    {
      key: 'toggleClickPreview',
      icon: IconPreview,
      type: 'button',
      active: clickToPreview,
      title: clickToPreview
        ? t('canvas.contextMenu.disableClickPreview')
        : t('canvas.contextMenu.enableClickPreview'),
      description: t('canvas.contextMenu.toggleClickPreviewDescription'),
      videoUrl: 'https://static.refly.ai/onboarding/contextMenu/contextMenu-toggleClickView.webm',
    },
    {
      key: 'toggleNodeSizeMode',
      icon: nodeSizeMode === 'compact' ? IconExpand : IconShrink,
      type: 'button',
      active: nodeSizeMode === 'compact',
      title:
        nodeSizeMode === 'compact'
          ? t('canvas.contextMenu.adaptiveMode')
          : t('canvas.contextMenu.compactMode'),
      description: t('canvas.contextMenu.toggleNodeSizeModeDescription'),
      videoUrl: 'https://static.refly.ai/onboarding/contextMenu/contextMenu-toggleAdaptive.webm',
    },
    {
      key: 'toggleAutoLayout',
      icon: RiLayoutLine,
      type: 'button',
      active: autoLayout,
      title: autoLayout
        ? t('canvas.contextMenu.disableAutoLayout')
        : t('canvas.contextMenu.enableAutoLayout'),
      description: t('canvas.contextMenu.toggleAutoLayoutDescription'),
      videoUrl: 'https://static.refly.ai/onboarding/contextMenu/contextMenu-toggleAutoLayout.webm',
    },
    {
      key: 'toggleHoverCard',
      icon: IconGuideLine,
      type: 'button',
      active: hoverCardEnabled,
      title: hoverCardEnabled
        ? t('canvas.contextMenu.disableHoverCard')
        : t('canvas.contextMenu.enableHoverCard'),
      description: t('canvas.contextMenu.toggleHoverCardDescription'),
      videoUrl: 'https://static.refly.ai/onboarding/contextMenu/contextMenu-toggleHoverCard.webm',
    },
  ];

  const adjustPosition = (x: number, y: number) => {
    const menuWidth = 200;
    const padding = 10;

    // Get window dimensions
    const windowWidth = window?.innerWidth ?? 0;
    const windowHeight = window?.innerHeight ?? 0;

    // Adjust X position if menu would overflow right side
    const adjustedX = Math.min(x, windowWidth - menuWidth - padding);

    // Use actual menu height for calculations
    const adjustedY = Math.min(y, windowHeight - menuHeight - padding);

    return {
      x: Math.max(padding, adjustedX),
      y: Math.max(padding, adjustedY),
    };
  };

  const getMenuScreenPosition = () => {
    const reactFlowInstance = useReactFlow();
    const screenPosition = reactFlowInstance.flowToScreenPosition(position);
    return adjustPosition(screenPosition.x, screenPosition.y);
  };

  const menuScreenPosition = getMenuScreenPosition();

  const handleMenuClick = async (key: string) => {
    switch (key) {
      case 'toggleLaunchpad':
        setShowLaunchpad(!showLaunchpad);
        break;
      case 'toggleEdges':
        toggleEdgeVisible();
        break;
      case 'toggleClickPreview':
        setClickToPreview(!clickToPreview);
        break;
      case 'toggleNodeSizeMode': {
        const newMode = nodeSizeMode === 'compact' ? 'adaptive' : 'compact';
        setNodeSizeMode(newMode);
        updateAllNodesSizeMode(newMode);
        break;
      }
      case 'toggleAutoLayout':
        setAutoLayout(!autoLayout);
        break;
      case 'toggleHoverCard':
        toggleHoverCard(!hoverCardEnabled);
        break;
    }
    setOpen(false);
  };

  // Update menu height when menu opens or content changes
  useEffect(() => {
    if (open && menuRef.current) {
      setMenuHeight(menuRef.current.offsetHeight);
    }
  }, [open, menuItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-lg p-2 w-[200px] border border-[rgba(0,0,0,0.06)]"
      style={{
        left: `${menuScreenPosition.x}px`,
        top: `${menuScreenPosition.y}px`,
      }}
    >
      {menuItems.map((item) => {
        if (item.type === 'divider') {
          return <Divider key={item.key} className="my-1 h-[1px] bg-gray-100" />;
        }

        const isLoading = item.key === 'createDocument' && isCreating;
        const button = (
          <Button
            key={item.key}
            className="w-full h-8 flex items-center gap-2 px-2 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            type="text"
            loading={isLoading}
            icon={item.icon && <item.icon className="flex items-center w-4 h-4" />}
            onClick={() => handleMenuClick(item.key)}
          >
            <span className="flex-1 text-left truncate">{item.title}</span>
          </Button>
        );

        if (item.description && hoverCardEnabled) {
          return (
            <HoverCard
              key={item.key}
              title={item.title}
              description={item.description}
              videoUrl={item.videoUrl}
              placement="right"
              overlayStyle={{ marginLeft: '12px' }}
              align={{ offset: [12, 0] }}
            >
              {button}
            </HoverCard>
          );
        }

        return button;
      })}
    </div>
  );
};
