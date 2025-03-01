import { memo, FC } from 'react';
import { Button, Badge } from 'antd';
import TooltipWrapper from '@refly-packages/ai-workspace-common/components/common/tooltip-button';
import { HoverCard, HoverContent } from '@refly-packages/ai-workspace-common/components/hover-card';
import { useHoverCard } from '@refly-packages/ai-workspace-common/hooks/use-hover-card';

export type ToolValue =
  | 'askAI'
  | 'createMemo'
  | 'importResource'
  | 'addResource'
  | 'createDocument'
  | 'addDocument'
  | 'handleLaunchpad'
  | 'showEdges'
  | 'pencil'
  | 'videoStand';

// Define toolbar item interface
export interface ToolbarItem {
  type: 'button' | 'popover' | 'divider';
  icon?: React.ElementType;
  value?: ToolValue;
  domain?: string;
  tooltip?: string;
  active?: boolean;
  isPrimary?: boolean;
  hoverContent?: HoverContent;
}

interface ToolButtonProps {
  tool: ToolbarItem;
  contextCnt: number;
  handleToolSelect: (event: React.MouseEvent, tool: string) => void;
  getIconColor: (tool: string) => string;
  getIsLoading: (tool: string) => boolean;
}

export const ToolButton: FC<ToolButtonProps> = memo(
  ({
    tool,
    contextCnt = 0,
    handleToolSelect,
    getIconColor,
    getIsLoading,
  }: {
    tool: ToolbarItem;
    contextCnt?: number;
    handleToolSelect: (event: React.MouseEvent, tool: string) => void;
    getIconColor: (tool: string) => string;
    getIsLoading: (tool: string) => boolean;
  }) => {
    const { hoverCardEnabled } = useHoverCard();

    // 学校风格的按钮样式 - 图书馆书架风格
    const schoolButtonStyle = {
      background: tool.active 
        ? 'linear-gradient(to bottom, #e9a065, #d28c51)' 
        : 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
      border: '1px solid rgba(255,255,255,0.3)',
      boxShadow: tool.active 
        ? 'inset 0 2px 4px rgba(0,0,0,0.4), 0 0 10px rgba(233, 160, 101, 0.3)' 
        : '0 3px 6px rgba(0,0,0,0.3)',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      margin: '6px auto',
      position: 'relative' as const,
      overflow: 'hidden'
    };

    // 图标样式
    const iconStyle = {
      color: getIconColor(tool.value as string) || '#FFF',
      fontSize: '18px',
      transition: 'all 0.2s ease',
      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
    };

    const button =
      contextCnt > 0 && tool.value === 'handleLaunchpad' ? (
        <Badge
          size="small"
          color="#8B4513"
          offset={[-2, 2]}
          count={contextCnt}
          overflowCount={9999}
        >
          <Button
            type="text"
            onClick={(event) => handleToolSelect(event, tool.value as string)}
            style={schoolButtonStyle}
            className={`school-tool-button ${tool.active ? 'active' : ''}`}
            icon={
              <tool.icon
                className={`${tool.isPrimary ? 'text-primary-600' : ''}`}
                style={iconStyle}
              />
            }
            loading={getIsLoading(tool.value as string)}
          />
        </Badge>
      ) : (
        <Button
          type="text"
          onClick={(event) => handleToolSelect(event, tool.value as string)}
          style={schoolButtonStyle}
          className={`school-tool-button ${tool.active ? 'active' : ''}`}
          icon={
            <tool.icon
              className={`${tool.isPrimary ? 'text-primary-600' : ''}`}
              style={iconStyle}
            />
          }
          loading={getIsLoading(tool.value as string)}
        />
      );

    if (tool.hoverContent && hoverCardEnabled) {
      return (
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
      );
    }

    return <TooltipWrapper tooltip={tool.tooltip}>{button}</TooltipWrapper>;
  },
);
