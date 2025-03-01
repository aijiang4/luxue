import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStoreShallow } from '@refly-packages/ai-workspace-common/stores/subscription';
import { Button } from 'antd';
import { IconSubscription } from '@refly-packages/ai-workspace-common/components/common/icon';

export const SubscriptionHint = memo(() => {
  const { t } = useTranslation();
  const { setSubscribeModalVisible } = useSubscriptionStoreShallow((state) => ({
    setSubscribeModalVisible: state.setSubscribeModalVisible,
  }));

  const handleUpgrade = () => {
    setSubscribeModalVisible(true);
  };

  return (
    <div className="w-full px-2">
      <Button
        className="w-full"
        type="primary"
        size="middle"
        icon={<IconSubscription className="flex items-center justify-center text-base" />}
        onClick={handleUpgrade}
      >
        <span className="text-sm">{t('settings.subscription.subscribeNow')}</span>
      </Button>
    </div>
  );
});

SubscriptionHint.displayName = 'SubscriptionHint';
