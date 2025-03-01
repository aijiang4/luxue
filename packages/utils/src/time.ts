import { LOCALE } from '@refly-packages/common-types';
import dayjsConfig from './dayjsConfig';

export const time = (
  date: string | number | Date | dayjsConfig.Dayjs,
  locale: LOCALE = LOCALE.EN,
) => {
  return dayjsConfig(date, { locale });
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
