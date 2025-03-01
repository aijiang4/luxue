import { memo, FC } from 'react';
import { Button, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStoreShallow } from '@refly-packages/ai-workspace-common/stores/subscription';
import { useSubscriptionUsage } from '@refly-packages/ai-workspace-common/hooks/use-subscription-usage';

interface StorageLimitProps {
  resourceCount: number;
}

export const StorageLimit: FC<StorageLimitProps> = memo(({ resourceCount }) => {
  const { t } = useTranslation();
  const { setSubscribeModalVisible } = useSubscriptionStoreShallow((state) => ({
    setSubscribeModalVisible: state.setSubscribeModalVisible,
  }));

  const handleUpgrade = () => {
    setSubscribeModalVisible(true);
  };

  const { storageUsage } = useSubscriptionUsage();
  const canImportCount = storageUsage?.fileCountQuota - (storageUsage?.fileCountUsed ?? 0);
  const storageLimitTip = () => {
    if (canImportCount <= 0) {
      return t('resource.import.storageLimited');
    }
    if (resourceCount > 0 && canImportCount < resourceCount) {
      return t('resource.import.storagePartialLimited', { count: canImportCount });
    }
  };
  return storageLimitTip() ? (
    <div className="flex items-center whitespace-nowrap text-md">
      <Alert
        message={storageLimitTip()}
        type="warning"
        showIcon
        action={
          <Button
            type="text"
            size="small"
            className="text-green-500 ml-2 rounded-sm font-bold"
            onClick={handleUpgrade}
          >
            {t('resource.import.upgrade')}
          </Button>
        }
      />
    </div>
  ) : null;
});
