import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { IconMemo } from '@refly-packages/ai-workspace-common/components/common/icon';

interface CreateMemoSelectorProps {
  text: string;
  handleClick: () => void;
}

export const CreateMemoSelector: React.FC<CreateMemoSelectorProps> = (props) => {
  const { handleClick } = props;
  const { t } = useTranslation();

  return (
    <Tooltip title={t('knowledgeBase.canvas.editor.toolbar.createMemo')}>
      <Button type="text" className="rounded-none px-2" onClick={handleClick}>
        <IconMemo className="w-[3.5] h-[3.5] text-[#00968F]" size={16} strokeWidth={3} />
      </Button>
    </Tooltip>
  );
};
