import { Button, Typography } from 'antd';

// styles
import './index.scss';
import { useUserStoreShallow } from '@refly-packages/ai-workspace-common/stores/user';
// components
import { UILocaleList } from '@refly-packages/ai-workspace-common/components/ui-locale-list';
import { IconDown } from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';
import { OutputLocaleList } from '../../output-locale-list';
import { LOCALE } from '@refly/common-types';
import { localeToLanguageName } from '@refly-packages/ai-workspace-common/utils/i18n';

export const LanguageSetting = () => {
  const { localSettings } = useUserStoreShallow((state) => ({
    localSettings: state.localSettings,
  }));

  const { t, i18n } = useTranslation();
  const uiLocale = i18n?.languages?.[0] as LOCALE;
  const outputLocale = localSettings?.outputLocale;

  return (
    <div className="language-setting">
      <div className="language-setting-content">
        <div className="language-setting-content-item">
          <Typography.Title level={5}>{t('settings.language.uiLocale.title')}</Typography.Title>
          <Typography.Paragraph type="secondary">
            {t('settings.language.uiLocale.description')}
          </Typography.Paragraph>
          <UILocaleList width={200}>
            <Button>
              {t('language')} <IconDown />
            </Button>
          </UILocaleList>
        </div>

        <div className="language-setting-content-item">
          <Typography.Title level={5}>{t('settings.language.outputLocale.title')}</Typography.Title>
          <Typography.Paragraph type="secondary">
            {t('settings.language.outputLocale.description')}
          </Typography.Paragraph>
          <OutputLocaleList width={200} position="bl">
            <Button>
              {localeToLanguageName?.[uiLocale]?.[outputLocale]} <IconDown />
            </Button>
          </OutputLocaleList>
        </div>
      </div>
    </div>
  );
};
