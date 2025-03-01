import { useTranslation } from 'react-i18next';
import Logo from '@/assets/logo.png';
import { IconLoading } from '@arco-design/web-react/icon';

export const SuspenseLoading = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="flex justify-center items-center mb-5">
        <img src={Logo} alt="万峰白板" className="w-12 h-12 mr-3" />
        <span className="text-3xl font-bold">万峰白板</span>
      </div>
      <div className="text-gray-600">
        <IconLoading className="mr-2" />
        <span>{t('common.appStarting')}</span>
      </div>
    </div>
  );
};
