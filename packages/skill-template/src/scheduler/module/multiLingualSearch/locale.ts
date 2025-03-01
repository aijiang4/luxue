// Add locale mapping constants
export const LOCALE_MAPPING = {
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en',
  fr: 'fr',
  es: 'es',
  de: 'de',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
} as const;

// Update LOCALE_PRIORITY to include all supported locales
export const LOCALE_PRIORITY = [
  'en',
  'fr',
  'es',
  'de',
  'it',
  'ja',
  'zh-Hans',
  'zh-Hant',
  'zh-CN',
  'zh-TW',
  'ko',
] as const;

// Add helper functions for locale normalization
export const normalizeLocale = (locale: string): string => {
  return LOCALE_MAPPING[locale] || locale;
};

export const denormalizeLocale = (locale: string): string => {
  // Convert back to internal format if needed
  if (locale === 'zh-CN') return 'zh-Hans';
  if (locale === 'zh-TW') return 'zh-Hant';
  return locale;
};

export const getOptimizedSearchLocales = (
  baseLocale: string,
  maxSearchLocaleLen: number,
): string[] => {
  // Normalize the input locale for comparison
  const normalizedBaseLocale = normalizeLocale(baseLocale);

  // Start with English as base locale
  const locales = new Set(['en']);

  // Add recommended/display locale if different from English
  if (normalizedBaseLocale !== 'en') {
    locales.add(normalizedBaseLocale);
  }

  // Keep adding locales until we reach maxSearchLocaleLen
  if (locales.size < maxSearchLocaleLen) {
    // Get remaining priority locales that haven't been added yet
    const remainingLocales = LOCALE_PRIORITY.map(normalizeLocale).filter(
      (locale) => !locales.has(locale),
    );

    // Add additional locales until we reach the desired length
    for (const locale of remainingLocales) {
      if (locales.size >= maxSearchLocaleLen) break;
      locales.add(locale);
    }
  }

  // Convert Set back to array, maintaining LOCALE_PRIORITY order
  // and convert back to internal format while deduplicating normalized forms
  const seenNormalizedLocales = new Set<string>();
  const result = LOCALE_PRIORITY.filter((locale) => {
    const normalized = normalizeLocale(locale);
    if (locales.has(normalized) && !seenNormalizedLocales.has(normalized)) {
      seenNormalizedLocales.add(normalized);
      return true;
    }
    return false;
  }).map(denormalizeLocale);

  // If we still don't have enough locales after deduplication,
  // add more from the priority list
  if (result.length < maxSearchLocaleLen) {
    const additionalLocales = LOCALE_PRIORITY.filter((locale) => {
      const normalized = normalizeLocale(locale);
      return !seenNormalizedLocales.has(normalized);
    }).map(denormalizeLocale);

    result.push(...additionalLocales.slice(0, maxSearchLocaleLen - result.length));
  }

  return result;
};
