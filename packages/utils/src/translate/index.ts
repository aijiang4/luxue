import { LangCode } from './types';

// Language detection function
export async function detectLanguage(text: string): Promise<LangCode> {
  try {
    const truncatedText = text.length > 1000 ? text.slice(0, 1000) : text;

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=en&q=${encodeURIComponent(truncatedText)}`,
    );

    if (!response.ok) {
      throw new Error('Language detection failed');
    }

    const data = await response.json();
    // Google API returns the detected language code in the third element
    const detectedLang = data?.[2] as string;

    // Handle special cases
    if (detectedLang === 'zh-CN') return 'zh-Hans';
    if (detectedLang === 'zh-TW') return 'zh-Hant';

    return (detectedLang as LangCode) || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

// Translation function
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage = 'auto',
): Promise<string> {
  try {
    // If the target language is auto, return the original text
    if (targetLanguage === 'auto') {
      return text;
    }

    // Handle special cases for Chinese
    const normalizedTarget =
      targetLanguage === 'zh-Hans'
        ? 'zh-CN'
        : targetLanguage === 'zh-Hant'
          ? 'zh-TW'
          : targetLanguage;

    const normalizedSource =
      sourceLanguage === 'zh-Hans'
        ? 'zh-CN'
        : sourceLanguage === 'zh-Hant'
          ? 'zh-TW'
          : sourceLanguage;

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${normalizedSource}&tl=${normalizedTarget}&q=${encodeURIComponent(
        text,
      )}`,
    );

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    // Merge all translation fragments
    const translatedText = data[0]
      .map((item: any[]) => item[0])
      .filter(Boolean)
      .join('');

    return translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if an error occurs
  }
}

// Optional: Add a batch translation function
export async function batchTranslateText(
  texts: string[],
  targetLanguage: string,
  sourceLanguage = 'auto',
): Promise<string[]> {
  // Use Promise.all to process concurrently, but add a delay to avoid too many requests
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const results: string[] = [];
  for (const text of texts) {
    const translated = await translateText(text, targetLanguage, sourceLanguage);
    results.push(translated);
    await delay(100);
  }

  return results;
}
