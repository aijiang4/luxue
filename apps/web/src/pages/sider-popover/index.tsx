import { Popover } from 'antd';
import { SiderLayout } from '@/components/layout/sider';

interface SiderPopoverProps {
  children: React.ReactNode;
}
const SiderPopover = (props: SiderPopoverProps) => {
  const { children } = props;

  return (
    <Popover
      zIndex={11}
      overlayInnerStyle={{ padding: 0, boxShadow: 'none', border: 'none' }}
      className="shadow-none"
      arrow={false}
      placement="bottom"
      mouseEnterDelay={0.5}
      content={<SiderLayout source="popover" />}
    >
      {children}
    </Popover>
  );
};

export default SiderPopover;
