/**
 * i18n Configuration
 * Internationalization setup for La Fine Parfumerie
 */

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

// Locale metadata
export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

// Locale flags (emoji)
export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
};

// Date format by locale
export const dateFormats: Record<Locale, Intl.DateTimeFormatOptions> = {
  fr: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
  en: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
};

// Currency format by locale
export const currencyFormats: Record<Locale, Intl.NumberFormatOptions> = {
  fr: {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  },
  en: {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  },
};

// Number format by locale
export const numberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  fr: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  en: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
};

/**
 * Get messages for a locale
 */
export async function getMessages(locale: Locale) {
  return (await import(`./locales/${locale}.json`)).default;
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, dateFormats[locale]).format(date);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, currencyFormats[locale]).format(amount);
}

/**
 * Format number according to locale
 */
export function formatNumber(num: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, numberFormats[locale]).format(num);
}

/**
 * Check if locale is RTL (Right-to-Left)
 * Note: Currently no RTL locales, but prepared for future
 */
export function isRTL(locale: Locale): boolean {
  const rtlLocales: Locale[] = [];
  return rtlLocales.includes(locale);
}
