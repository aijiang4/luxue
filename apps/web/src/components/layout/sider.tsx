import React, { useState, useMemo, useEffect } from 'react';
import { Menu } from '@arco-design/web-react';
import { Avatar, Button, Layout, Skeleton, Divider } from 'antd';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from '@refly-packages/ai-workspace-common/utils/router';

import { IconCanvas, IconPlus } from '@refly-packages/ai-workspace-common/components/common/icon';
import cn from 'classnames';

import Logo from '@/assets/logo.png';
import { useUserStoreShallow } from '@refly-packages/ai-workspace-common/stores/user';
// components
import { SearchQuickOpenBtn } from '@refly-packages/ai-workspace-common/components/search-quick-open-btn';
import { useTranslation } from 'react-i18next';
import { SiderMenuSettingList } from '@refly-packages/ai-workspace-common/components/sider-menu-setting-list';
import { SettingModal } from '@refly-packages/ai-workspace-common/components/settings';
import { TourModal } from '@refly-packages/ai-workspace-common/components/tour-modal';
import { SettingsGuideModal } from '@refly-packages/ai-workspace-common/components/settings-guide';
import { StorageExceededModal } from '@refly-packages/ai-workspace-common/components/subscription/storage-exceeded-modal';
// hooks
import { useHandleSiderData } from '@refly-packages/ai-workspace-common/hooks/use-handle-sider-data';
import {
  SiderData,
  useSiderStoreShallow,
  type SettingsModalActiveTab,
} from '@refly-packages/ai-workspace-common/stores/sider';
import { useCreateCanvas } from '@refly-packages/ai-workspace-common/hooks/canvas/use-create-canvas';
// icons
import { IconLibrary } from '@refly-packages/ai-workspace-common/components/common/icon';
import { CanvasActionDropdown } from '@refly-packages/ai-workspace-common/components/workspace/canvas-list-modal/canvasActionDropdown';
import { AiOutlineMenuFold, AiOutlineUser } from 'react-icons/ai';
import { SubscriptionHint } from '@refly-packages/ai-workspace-common/components/subscription/hint';
import { HoverCard, HoverContent } from '@refly-packages/ai-workspace-common/components/hover-card';
import { useHoverCard } from '@refly-packages/ai-workspace-common/hooks/use-hover-card';
import { FaGithub } from 'react-icons/fa6';
import { useKnowledgeBaseStoreShallow } from '@refly-packages/ai-workspace-common/stores/knowledge-base';
import { IconSettings } from '@arco-design/web-react/icon';

// 添加全局样式覆盖
const siderMenuStyles = `
  .arco-menu {
    background-color: transparent !important;
  }
  .arco-menu-inline-header {
    background-color: transparent !important;
  }
  .arco-menu-inline .arco-menu-inline {
    background-color: transparent !important;
  }
  .arco-menu-inline-content {
    background-color: transparent !important;
  }
  .arco-menu-item {
    background-color: transparent !important;
  }
  .arco-menu-item:hover {
    background-color: rgba(200, 125, 86, 0.1) !important;
  }
  .arco-menu-item.arco-menu-selected {
    background-color: rgba(200, 125, 86, 0.2) !important;
  }
  .arco-menu-light .arco-menu-inline-header:hover {
    background-color: transparent !important;
  }
  .arco-menu-light .arco-menu-inline-header.arco-menu-selected {
    background-color: transparent !important;
  }
  .arco-menu-inline-content {
    position: relative;
  }
  .arco-menu-inline-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10px;
    right: 10px;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.08' d='M30,0 C40,10 40,20 30,30 C20,40 20,50 30,60 M0,30 C10,20 20,20 30,30 C40,40 50,40 60,30'/%3E%3C/svg%3E");
    background-size: 60px 60px;
    opacity: 0.5;
    pointer-events: none;
    z-index: -1;
  }
  .arco-menu-inline-content::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #A05A2C, #C87D56, #A05A2C);
    opacity: 0.7;
    border-radius: 0 2px 2px 0;
  }
  .arco-divider {
    border-color: rgba(107, 68, 35, 0.2) !important;
  }
  .arco-menu-light .arco-menu-inline-header.arco-menu-selected .arco-menu-icon-suffix {
    color: #8C3130 !important;
  }
  .arco-menu-light .arco-menu-inline-header .arco-menu-icon-suffix {
    color: #784931 !important;
  }
  .arco-menu-light .arco-menu-inline-header:hover .arco-menu-icon-suffix {
    color: #8C3130 !important;
  }
  .arco-skeleton-text, .arco-skeleton-image, .arco-skeleton-circle {
    background-color: rgba(232, 212, 194, 0.3) !important;
  }
  .arco-skeleton-text-row {
    background-color: rgba(232, 212, 194, 0.3) !important;
  }
  .arco-skeleton-animation-gradient::after {
    background: linear-gradient(90deg, rgba(232, 212, 194, 0.3) 25%, rgba(240, 230, 221, 0.5) 37%, rgba(232, 212, 194, 0.3) 63%) !important;
  }
  .arco-menu-light .arco-menu-item:hover {
    color: #8C3130 !important;
  }
  .arco-menu-light .arco-menu-item.arco-menu-selected {
    color: #8C3130 !important;
  }
  .arco-menu-light .arco-menu-item {
    color: #784931 !important;
  }
  /* 订阅提示样式 */
  .ant-alert.ant-alert-info {
    background: linear-gradient(to right, #E8D4C2, #F0E6DD) !important;
    border: 1px solid rgba(107, 68, 35, 0.5) !important;
    border-radius: 6px !important;
    box-shadow: 2px 2px 4px rgba(0,0,0,0.15) !important;
    border-left: 5px solid #A02C2C !important;
    overflow: hidden !important;
    position: relative !important;
    padding-bottom: 8px !important;
  }
  .ant-alert.ant-alert-info::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.1' d='M0,0 L10,0 L10,10 L0,10 Z M10,0 L20,0 L20,10 L10,10 Z M0,10 L10,10 L10,20 L0,20 Z'/%3E%3C/svg%3E");
    background-size: 40px 40px;
    opacity: 0.3;
    pointer-events: none;
    z-index: 0;
  }
  .ant-alert.ant-alert-info .ant-typography {
    color: #784931 !important;
    font-family: "KaiTi", "STKaiti", serif !important;
    position: relative;
    z-index: 1;
  }
  .ant-alert.ant-alert-info .ant-btn {
    background: linear-gradient(to bottom, #A02C2C, #8C3130) !important;
    border: 1px solid #A02C2C !important;
    color: #FFF !important;
    font-family: "KaiTi", "STKaiti", serif !important;
    position: relative;
    z-index: 1;
    margin-top: -25px !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    border-radius: 4px !important;
    transform: translateY(-5px) !important;
  }
  .ant-alert.ant-alert-info .ant-btn:hover {
    background: linear-gradient(to bottom, #B03C3C, #9C4140) !important;
    border: 1px solid #B03C3C !important;
    transform: translateY(-5px) scale(1.02) !important;
    transition: all 0.2s ease !important;
  }
  .ant-alert.ant-alert-info .ant-alert-icon {
    color: #A02C2C !important;
  }
  /* 订阅按钮样式 */
  .w-full.px-2 .ant-btn {
    background: linear-gradient(to bottom, #A02C2C, #8C3130) !important;
    border: 1px solid #A02C2C !important;
    color: #FFF !important;
    font-family: "KaiTi", "STKaiti", serif !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    border-radius: 4px !important;
    position: relative;
    overflow: hidden;
    margin-top: -5px;
    transform: translateY(-5px);
  }
  .w-full.px-2 .ant-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23FFF' stroke-width='1' stroke-opacity='0.1' d='M0,0 L10,0 L10,10 L0,10 Z M10,0 L20,0 L20,10 L10,10 Z M0,10 L10,10 L10,20 L0,20 Z'/%3E%3C/svg%3E");
    background-size: 40px 40px;
    opacity: 0.2;
    pointer-events: none;
  }
  .w-full.px-2 .ant-btn:hover {
    background: linear-gradient(to bottom, #B03C3C, #9C4140) !important;
    border: 1px solid #B03C3C !important;
    transform: translateY(-5px) scale(1.02);
    transition: all 0.2s ease;
  }
  .w-full.px-2 .ant-btn .text-sm {
    font-size: 14px !important;
    font-weight: bold !important;
    letter-spacing: 1px !important;
    text-shadow: 0 1px 1px rgba(0,0,0,0.3) !important;
  }
  /* 全局CSS样式 */
  .menu-item-container {
    width: 170px !important;
    box-sizing: border-box !important;
  }
`;

const Sider = Layout.Sider;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

const SiderLogo = (props: {
  source: 'sider' | 'popover';
  navigate: (path: string) => void;
  setCollapse: (collapse: boolean) => void;
}) => {
  const { navigate, setCollapse, source } = props;
  const [starCount, setStarCount] = useState('913');

  useEffect(() => {
    // Fetch GitHub star count
    fetch('https://api.github.com/repos/refly-ai/refly')
      .then((res) => res.json())
      .then((data) => {
        const stars = data.stargazers_count;
        setStarCount(stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars.toString());
      })
      .catch(() => {
        // Keep default value if fetch fails
      });
  }, []);

  return (
    <div 
      className="flex items-center justify-between p-3"
      style={{
        boxShadow: '0 6px 10px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 3,
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23432818' stroke-width='1' stroke-opacity='0.2'%3E%3Cpath d='M0,0 C40,33 66,52 90,66 C150,93 130,76 190,120 C250,164 300,185 400,220'/%3E%3Cpath d='M0,50 C40,83 66,102 90,116 C150,143 130,126 190,170 C250,214 300,235 400,270'/%3E%3C/g%3E%3C/svg%3E"),
          linear-gradient(90deg, rgba(67, 40, 24, 0.9) 0%, rgba(93, 58, 26, 0.95) 50%, rgba(67, 40, 24, 0.9) 100%)
        `,
        backgroundSize: '100% 100%, 100% 100%',
        backgroundPosition: '0 0, 0 0',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '2px solid #432818'
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex cursor-pointer flex-row items-center gap-1.5"
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(to bottom, rgba(233, 160, 101, 0.3), rgba(210, 140, 81, 0.3))',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(233, 160, 101, 0.5)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.2)'
          }}
        >
          <img src={Logo} alt="万峰白板" className="h-8 w-8" style={{ filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.4))' }} />
          <span 
            className="text-xl font-bold" 
            translate="no"
            style={{ 
              color: '#FFF',
              fontFamily: 'Georgia, serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
              letterSpacing: '1px'
            }}
          >
            万峰白板
          </span>
        </div>
      </div>

      {source === 'sider' && (
        <div>
          <Button
            type="text"
            icon={<AiOutlineMenuFold size={16} className="text-white" />}
            onClick={() => setCollapse(true)}
            style={{
              background: 'linear-gradient(to bottom, rgba(233, 160, 101, 0.3), rgba(210, 140, 81, 0.3))',
              border: '1px solid rgba(233, 160, 101, 0.5)',
              borderRadius: '6px',
              boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.2)'
            }}
          />
        </div>
      )}
    </div>
  );
};

const MenuItemTooltipContent = (props: { title: string }) => {
  return <div>{props.title}</div>;
};

const SettingItem = () => {
  const { t } = useTranslation();
  const { userProfile } = useUserStoreShallow((state) => ({
    userProfile: state.userProfile,
  }));
  const { setShowSettingModal } = useSiderStoreShallow((state) => ({
    setShowSettingModal: state.setShowSettingModal,
  }));
  const planType = userProfile?.subscription?.planType || 'free';

  return (
    <div className="group w-full">
      <SiderMenuSettingList>
        <div
          className="flex flex-1 items-center justify-between"
          style={{
            padding: '10px 12px',
            margin: '8px 0',
            borderRadius: '4px 8px 8px 4px',
            background: 'linear-gradient(to right, #E8D4C2, #F0E6DD)',
            border: '1px solid rgba(107, 68, 35, 0.5)',
            boxShadow: '3px 3px 6px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
            height: '50px',
            // 中国风书脊效果
            borderLeft: '8px solid #2B4B6F'
          }}
        >
          {/* 中国风纹理 - 回纹背景 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.15' d='M0,0 L10,0 L10,10 L0,10 Z M10,0 L20,0 L20,10 L10,10 Z M0,10 L10,10 L10,20 L0,20 Z'/%3E%3C/svg%3E")
            `,
            backgroundSize: '40px 40px',
            opacity: 0.5,
            pointerEvents: 'none'
          }}></div>
          
          <div className="flex items-center">
            <Avatar 
              size={32} 
              src={userProfile?.avatar} 
              icon={<AiOutlineUser />} 
              style={{ 
                border: '2px solid rgba(107, 68, 35, 0.3)',
                boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
              }}
            />
            <span 
              className="ml-2 max-w-[80px] truncate font-semibold"
              style={{ 
                color: '#2B4B6F',
                fontFamily: '"Heiti SC", "SimHei", sans-serif'
              }}
            >
              {userProfile?.nickname}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div 
              className="flex h-6 items-center justify-center rounded-full px-3 text-xs font-medium"
              style={{
                background: 'rgba(43, 75, 111, 0.1)',
                border: '1px solid rgba(43, 75, 111, 0.3)',
                color: '#2B4B6F',
                fontFamily: '"Heiti SC", "SimHei", sans-serif'
              }}
            >
              {t(`settings.subscription.subscriptionStatus.${planType}`)}
            </div>
            
            <Button
              type="text"
              icon={<IconSettings style={{ color: '#2B4B6F' }} />}
              onClick={(e) => {
                e.stopPropagation();
                setShowSettingModal(true);
              }}
              style={{
                background: 'rgba(43, 75, 111, 0.1)',
                border: '1px solid rgba(43, 75, 111, 0.3)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>
      </SiderMenuSettingList>
    </div>
  );
};

const MenuItemContent = (props: {
  icon?: React.ReactNode;
  title?: string;
  type: string;
  collapse?: boolean;
  position?: 'left' | 'right';
  hoverContent?: HoverContent;
}) => {
  const { position = 'left', type, hoverContent } = props;
  const { hoverCardEnabled } = useHoverCard();

  const { setShowLibraryModal, setShowCanvasListModal } = useSiderStoreShallow((state) => ({
    setShowLibraryModal: state.setShowLibraryModal,
    setShowCanvasListModal: state.setShowCanvasListModal,
  }));

  const handleNavClick = () => {
    if (type === 'Canvas') {
      setShowCanvasListModal(true);
    } else if (type === 'Library') {
      setShowLibraryModal(true);
    }
  };

  const content = (
    <div
      className="relative flex items-center menu-item-container"
      style={{
        zIndex: 2,
        padding: '10px 12px',
        margin: '8px 0',
        borderRadius: '4px 8px 8px 4px',
        background: type === 'Canvas' 
          ? 'linear-gradient(to right, #E8C4A2, #F4E3CF)' 
          : 'linear-gradient(to right, #D9C7B8, #F0E6DD)',
        border: '1px solid rgba(107, 68, 35, 0.5)',
        boxShadow: '3px 3px 6px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        height: '40px',
        // 中国风书脊效果
        borderLeft: '8px solid',
        borderLeftColor: type === 'Canvas' ? '#A02C2C' : '#2B4B6F'
      }}
      onClick={() => handleNavClick()}
    >
      {/* 中国风纹理 - 云纹背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.2' d='M10,50 Q25,25 40,50 T70,50 T100,50'/%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.2' d='M0,60 Q15,35 30,60 T60,60 T90,60'/%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.2' d='M0,40 Q15,15 30,40 T60,40 T90,40'/%3E%3C/svg%3E")
        `,
        backgroundSize: '100px 100px',
        opacity: 0.5,
        pointerEvents: 'none'
      }}></div>
      
      <div className="flex flex-1 flex-nowrap items-center">
        {position === 'left' && (
          <div style={{ 
            marginRight: '10px', 
            color: type === 'Canvas' ? '#8C3130' : '#2B4B6F',
            fontSize: '18px',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))'
          }}>
            {props.icon}
          </div>
        )}
        <span 
          className="sider-menu-title"
          style={{ 
            color: type === 'Canvas' ? '#8C3130' : '#2B4B6F',
            fontWeight: 'bold',
            fontFamily: '"Heiti SC", "SimHei", sans-serif'
          }}
        >
          {props.title}
        </span>
        {position === 'right' && props.icon}
      </div>
    </div>
  );

  if (hoverContent && hoverCardEnabled) {
    return (
      <HoverCard
        title={hoverContent?.title}
        description={hoverContent?.description}
        videoUrl={hoverContent?.videoUrl}
        placement={hoverContent?.placement || 'right'}
      >
        {content}
      </HoverCard>
    );
  }

  return content;
};

const NewCanvasItem = () => {
  const { t } = useTranslation();
  const { debouncedCreateCanvas, isCreating: createCanvasLoading } = useCreateCanvas();

  return (
    <MenuItem
      key="newCanvas"
      className="ml-2.5 flex h-8 items-center menu-item-container"
      onClick={debouncedCreateCanvas}
      style={{
        margin: '8px 12px',
        background: 'linear-gradient(to right, #F4E3CF, #E8C4A2)',
        borderRadius: '4px 8px 8px 4px',
        border: '1px solid rgba(107, 68, 35, 0.3)',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        padding: '8px 10px',
        height: '40px',
        position: 'relative',
        zIndex: 2,
        // 中国风书脊效果
        borderLeft: '8px solid #A02C2C',
        overflow: 'hidden'
      }}
    >
      {/* 中国风纹理 - 如意纹背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.2' d='M30,0 C40,10 40,20 30,30 C20,40 20,50 30,60 M0,30 C10,20 20,20 30,30 C40,40 50,40 60,30'/%3E%3C/svg%3E")
        `,
        backgroundSize: '60px 60px',
        opacity: 0.5,
        pointerEvents: 'none'
      }}></div>
      
      <Button
        loading={createCanvasLoading}
        type="text"
        icon={<IconPlus className="text-red-800" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }} />}
        style={{
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0
        }}
      />

      <span 
        style={{
          color: '#8C3130',
          fontWeight: 'bold',
          fontFamily: '"Heiti SC", "SimHei", sans-serif'
        }}
      >
        {t('loggedHomePage.siderMenu.newCanvas')}
      </span>
    </MenuItem>
  );
};

const CanvasListItem = ({ canvas }: { canvas: SiderData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showCanvasIdActionDropdown, setShowCanvasIdActionDropdown] = useState<string | null>(null);

  const location = useLocation();
  const selectedKey = useMemo(() => getSelectedKey(location.pathname), [location.pathname]);

  return (
    <MenuItem
      key={canvas.id}
      className={cn('group relative ml-4 h-8 rounded text-sm leading-8 hover:bg-gray-50 menu-item-container', {
        '!bg-gray-100 font-medium !text-green-600': selectedKey === canvas.id,
      })}
      style={{
        margin: '4px 12px',
        background: selectedKey === canvas.id 
          ? 'linear-gradient(to right, #F4E3CF, #E8C4A2)' 
          : 'linear-gradient(to right, #E8D4C2, #F4E9DF)',
        borderRadius: '4px 8px 8px 4px',
        border: '1px solid rgba(107, 68, 35, 0.3)',
        boxShadow: selectedKey === canvas.id 
          ? '2px 2px 4px rgba(0,0,0,0.2)' 
          : '1px 1px 2px rgba(0,0,0,0.1)',
        padding: '8px 10px',
        height: '36px',
        transition: 'all 0.2s ease',
        position: 'relative',
        zIndex: 2,
        // 中国风书脊效果
        borderLeft: '6px solid',
        borderLeftColor: selectedKey === canvas.id ? '#A02C2C' : '#C87D56',
        overflow: 'visible'
      }}
      onClick={(e) => {
        // 检查点击是否来自操作按钮区域
        const target = e.target as HTMLElement;
        const actionArea = target.closest('.canvas-action-area');
        if (actionArea) {
          e.stopPropagation();
          return;
        }
        navigate(`/canvas/${canvas.id}`);
      }}
    >
      {/* 中国风纹理 - 回纹背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.15' d='M0,0 L10,0 L10,10 L0,10 Z M10,0 L20,0 L20,10 L10,10 Z M0,10 L10,10 L10,20 L0,20 Z'/%3E%3C/svg%3E")
        `,
        backgroundSize: '40px 40px',
        opacity: 0.5,
        pointerEvents: 'none'
      }}></div>
      
      <div className="flex h-8 items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <IconCanvas 
            className={cn({ 'text-green-600': selectedKey === canvas.id })} 
            style={{ 
              color: selectedKey === canvas.id ? '#8C3130' : '#A05A2C',
              fontSize: '16px',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
            }}
          />
          <div 
            className="truncate"
            style={{ 
              maxWidth: '90px',
              color: selectedKey === canvas.id ? '#8C3130' : '#784931',
              fontFamily: '"Heiti SC", "SimHei", sans-serif'
            }}
          >
            {canvas?.name || t('common.untitled')}
          </div>
        </div>

        <div
          className={cn(
            'flex items-center transition-opacity duration-200 canvas-action-area',
            showCanvasIdActionDropdown === canvas.id
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100',
          )}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            zIndex: 20000,
            position: 'relative',
            right: '-5px'
          }}
        >
          <CanvasActionDropdown
            btnSize="small"
            canvasId={canvas.id}
            canvasName={canvas.name}
            updateShowStatus={(canvasId) => {
              setShowCanvasIdActionDropdown(canvasId);
            }}
          />
        </div>
      </div>
    </MenuItem>
  );
};

const getSelectedKey = (pathname: string) => {
  if (pathname.startsWith('/canvas')) {
    const arr = pathname?.split('?')[0]?.split('/');
    return arr[arr.length - 1] ?? '';
  }
  return '';
};

export const SiderLayout = (props: { source: 'sider' | 'popover' }) => {
  const { source = 'sider' } = props;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateLibraryModalActiveKey } = useKnowledgeBaseStoreShallow((state) => ({
    updateLibraryModalActiveKey: state.updateLibraryModalActiveKey,
  }));

  const { setSettingsModalActiveTab } = useSiderStoreShallow((state) => ({
    setSettingsModalActiveTab: state.setSettingsModalActiveTab,
  }));

  const { userProfile } = useUserStoreShallow((state) => ({
    userProfile: state.userProfile,
  }));
  const planType = userProfile?.subscription?.planType || 'free';

  const {
    collapse,
    canvasList,
    setCollapse,
    showSettingModal,
    setShowSettingModal,
    setShowLibraryModal,
  } = useSiderStoreShallow((state) => ({
    showSettingModal: state.showSettingModal,
    collapse: state.collapse,
    canvasList: state.canvasList,
    setCollapse: state.setCollapse,
    setShowSettingModal: state.setShowSettingModal,
    setShowLibraryModal: state.setShowLibraryModal,
  }));

  const { isLoadingCanvas } = useHandleSiderData(true);

  const { t } = useTranslation();

  const location = useLocation();

  const selectedKey = useMemo(() => getSelectedKey(location.pathname), [location.pathname]);

  const defaultOpenKeys = useMemo(() => ['Canvas', 'Library'], []);

  interface SiderCenterProps {
    key: string;
    name: string;
    icon: React.ReactNode;
    showDivider?: boolean;
    onClick?: () => void;
    hoverContent?: HoverContent;
  }

  const siderSections: SiderCenterProps[] = [
    {
      key: 'Canvas',
      name: 'canvas',
      icon: <IconCanvas key="canvas" className="arco-icon" style={{ fontSize: 20 }} />,
      hoverContent: {
        title: t('loggedHomePage.siderMenu.canvasTitle'),
        description: t('loggedHomePage.siderMenu.canvasDescription'),
        videoUrl: 'https://static.refly.ai/onboarding/siderMenu/siderMenu-canvas.webm',
        placement: 'rightBottom',
      },
    },
    {
      key: 'Library',
      name: 'library',
      icon: <IconLibrary key="library" className="arco-icon" style={{ fontSize: 20 }} />,
      hoverContent: {
        title: t('loggedHomePage.siderMenu.libraryTitle'),
        description: t('loggedHomePage.siderMenu.libraryDescription'),
        videoUrl: 'https://static.refly.ai/onboarding/siderMenu/siderMenu-knowledgebase.webm',
      },
    },
  ];

  // Handle library modal opening from URL parameter
  useEffect(() => {
    const shouldOpenLibrary = searchParams.get('openLibrary');
    const shouldOpenSettings = searchParams.get('openSettings');
    const settingsTab = searchParams.get('settingsTab');

    if (shouldOpenLibrary === 'true' && userProfile?.uid) {
      setShowLibraryModal(true);
      // Remove the parameter from URL
      searchParams.delete('openLibrary');
      const newSearch = searchParams.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      window.history.replaceState({}, '', newUrl);

      updateLibraryModalActiveKey('resource');
    }

    if (shouldOpenSettings === 'true' && userProfile?.uid) {
      setShowSettingModal(true);
      // Remove the parameter from URL
      searchParams.delete('openSettings');
      searchParams.delete('settingsTab');
      const newSearch = searchParams.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      window.history.replaceState({}, '', newUrl);

      if (settingsTab) {
        setSettingsModalActiveTab(settingsTab as SettingsModalActiveTab);
      }
    }
  }, [
    searchParams,
    userProfile?.uid,
    setShowLibraryModal,
    setShowSettingModal,
    setSettingsModalActiveTab,
  ]);

  return (
    <Sider
      width={source === 'sider' ? (collapse ? 0 : 220) : 220}
      className={cn(
        'border border-solid border-gray-100 shadow-sm',
        source === 'sider' ? 'h-[calc(100vh)]' : 'h-[calc(100vh-100px)] rounded-r-lg',
      )}
      style={{
        background: 'linear-gradient(to bottom, #F0E6DD, #E8D4C2)',
        border: '1px solid #A05A2C',
        boxShadow: '5px 0 15px rgba(0,0,0,0.2)',
        position: 'relative',
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.1' d='M25,0 C50,25 50,75 25,100 M75,0 C50,25 50,75 75,100 M0,25 C25,50 75,50 100,25 M0,75 C25,50 75,50 100,75'/%3E%3C/svg%3E"),
          linear-gradient(90deg, rgba(240, 230, 221, 0.95) 0%, rgba(232, 212, 194, 0.9) 50%, rgba(240, 230, 221, 0.95) 100%)
        `,
        backgroundSize: '100px 100px, 100% 100%',
        backgroundPosition: '0 0, 0 0',
        overflow: 'visible'
      }}
    >
      {/* 注入全局样式 */}
      <style>{siderMenuStyles}</style>
      
      {/* 中国风装饰元素 - 顶部 */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '0',
        right: '0',
        height: '15px',
        background: '#A05A2C',
        borderRadius: '5px 5px 0 0',
        boxShadow: '0 -2px 5px rgba(0,0,0,0.3)',
        zIndex: 1
      }}></div>
      
      {/* 中国风装饰元素 - 底部 */}
      <div style={{
        position: 'absolute',
        bottom: '-15px',
        left: '0',
        right: '0',
        height: '15px',
        background: '#A05A2C',
        borderRadius: '0 0 5px 5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        zIndex: 1
      }}></div>
      
      {/* 中国风隔板 - 顶部 */}
      <div style={{
        position: 'absolute',
        top: '70px',
        left: '0',
        right: '0',
        height: '12px',
        background: 'linear-gradient(to bottom, #A05A2C, #C87D56 50%, #A05A2C)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.3)'
      }}></div>
      
      {/* 中国风隔板 - 中部 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        height: '12px',
        background: 'linear-gradient(to bottom, #A05A2C, #C87D56 50%, #A05A2C)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.3)'
      }}></div>
      
      {/* 中国风隔板 - 底部 */}
      <div style={{
        position: 'absolute',
        bottom: '70px',
        left: '0',
        right: '0',
        height: '12px',
        background: 'linear-gradient(to bottom, #A05A2C, #C87D56 50%, #A05A2C)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.3)'
      }}></div>
      
      {/* 中国风侧面纹理 - 右侧 */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '12px',
        height: '100%',
        background: 'linear-gradient(to right, #A05A2C, #C87D56 50%, #A05A2C)',
        boxShadow: '-3px 0 5px rgba(0,0,0,0.2) inset',
        zIndex: 1,
        borderLeft: '1px solid rgba(0,0,0,0.3)',
        borderRight: '1px solid rgba(255,255,255,0.1)'
      }}></div>
      
      {/* 中国风顶部装饰 */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '0',
        right: '0',
        height: '15px',
        background: 'linear-gradient(to bottom, #8C3130, #A05A2C)',
        borderRadius: '5px 5px 0 0',
        boxShadow: '0 -2px 5px rgba(0,0,0,0.3)',
        zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}></div>
      
      {/* 中国风底部装饰 */}
      <div style={{
        position: 'absolute',
        bottom: '-15px',
        left: '0',
        right: '0',
        height: '15px',
        background: 'linear-gradient(to bottom, #A05A2C, #8C3130)',
        borderRadius: '0 0 5px 5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        zIndex: 1,
        borderBottom: '1px solid rgba(0,0,0,0.3)'
      }}></div>

      <div className="flex h-full flex-col overflow-y-auto" style={{ position: 'relative', zIndex: 2 }}>
        <SiderLogo source={source} navigate={(path) => navigate(path)} setCollapse={setCollapse} />

        <div className="px-3 py-2">
          <div className="relative">
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23784931' stroke-width='1' stroke-opacity='0.1' d='M0,0 L10,0 L10,10 L0,10 Z M10,0 L20,0 L20,10 L10,10 Z M0,10 L10,10 L10,20 L0,20 Z'/%3E%3C/svg%3E")
              `,
              backgroundSize: '40px 40px',
              opacity: 0.3,
              pointerEvents: 'none',
              zIndex: 0,
              borderRadius: '6px'
            }}></div>
            <SearchQuickOpenBtn 
              style={{
                background: 'linear-gradient(to right, #E8D4C2, #F0E6DD)',
                border: '1px solid rgba(107, 68, 35, 0.5)',
                borderRadius: '6px',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.15)',
                borderLeft: '5px solid #2B4B6F',
                overflow: 'hidden',
                position: 'relative',
                width: '170px',
                margin: '8px 0'
              }}
              className="!bg-transparent menu-item-container"
            />
          </div>
        </div>

        <Menu
          className="flex-1 border-r-0"
          openKeys={defaultOpenKeys}
          selectedKeys={selectedKey ? [selectedKey] : []}
          defaultSelectedKeys={selectedKey ? [selectedKey] : []}
          style={{
            background: 'transparent',
            color: '#784931',
            fontFamily: '"Heiti SC", "SimHei", sans-serif'
          }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex-1 overflow-y-auto">
              <div className="sider-section">
                {siderSections.map((item, itemIndex) => (
                  <React.Fragment key={item.key}>
                    <SubMenu
                      key={item.key}
                      className="[&_.arco-menu-icon-suffix_.arco-icon-down]:z-[1] [&_.arco-menu-icon-suffix_.arco-icon-down]:rotate-90 [&_.arco-menu-inline-header]:pr-0"
                      style={{
                        background: 'transparent',
                        color: '#784931'
                      }}
                      title={
                        <MenuItemContent
                          type={item.key}
                          icon={item.icon}
                          title={t(`loggedHomePage.siderMenu.${item.name}`)}
                          hoverContent={item.hoverContent}
                        />
                      }
                    >
                      {/* 子菜单背景装饰 */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: item.key === 'Canvas' 
                          ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%238C3130' stroke-width='1' stroke-opacity='0.08' d='M30,0 C40,10 40,20 30,30 C20,40 20,50 30,60 M0,30 C10,20 20,20 30,30 C40,40 50,40 60,30'/%3E%3C/svg%3E")`
                          : `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%232B4B6F' stroke-width='1' stroke-opacity='0.08' d='M0,0 L10,0 L10,10 L0,10 Z M10,0 L20,0 L20,10 L10,10 Z M0,10 L10,10 L10,20 L0,20 Z'/%3E%3C/svg%3E")`,
                        backgroundSize: item.key === 'Canvas' ? '60px 60px' : '40px 40px',
                        opacity: 0.5,
                        pointerEvents: 'none',
                        zIndex: 0
                      }}></div>
                      
                      {item.key === 'Canvas' && (
                        <>
                          <NewCanvasItem />

                          {isLoadingCanvas ? (
                            <>
                              <Skeleton.Input
                                key="skeleton-1"
                                active
                                size="small"
                                style={{ width: 204, background: 'rgba(232, 212, 194, 0.3)' }}
                              />
                              <Skeleton.Input
                                key="skeleton-2"
                                active
                                size="small"
                                style={{ marginTop: 8, width: 204, background: 'rgba(232, 212, 194, 0.3)' }}
                              />
                              <Skeleton.Input
                                key="skeleton-3"
                                active
                                size="small"
                                style={{ marginTop: 8, width: 204, background: 'rgba(232, 212, 194, 0.3)' }}
                              />
                            </>
                          ) : (
                            canvasList.map((canvas) => (
                              <CanvasListItem key={canvas.id} canvas={canvas} />
                            ))
                          )}
                        </>
                      )}
                    </SubMenu>
                    {itemIndex < siderSections.length - 1 && (
                      <Divider
                        key={`divider-${item.key}`}
                        style={{
                          margin: '8px 0',
                          borderColor: 'rgba(107, 68, 35, 0.2)'
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <div className="mb-2 flex flex-col gap-2">
                {planType === 'free' && <SubscriptionHint />}
              </div>
              {!!userProfile?.uid && (
                <MenuItem
                  key="Settings"
                  className="flex h-12 items-center justify-between"
                  data-cy="settings-menu-item"
                  renderItemInTooltip={() => (
                    <MenuItemTooltipContent title={t('loggedHomePage.siderMenu.settings')} />
                  )}
                >
                  <SettingItem />
                </MenuItem>
              )}
            </div>
          </div>
        </Menu>

        <SettingModal visible={showSettingModal} setVisible={setShowSettingModal} />

        <SettingsGuideModal />
        <TourModal />
        <StorageExceededModal />
      </div>
    </Sider>
  );
};
