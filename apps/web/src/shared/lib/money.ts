import i18n, { intlLocaleForLanguage } from '../../i18n';

export function formatPrice(cents: number): string {
  const locale = intlLocaleForLanguage(i18n.language);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
