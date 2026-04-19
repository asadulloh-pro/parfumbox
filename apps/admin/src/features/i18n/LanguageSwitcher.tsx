import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AppLang } from '../../i18n';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <SegmentedControl
      size="xs"
      value={i18n.language === 'ru' ? 'ru' : 'uz'}
      onChange={(v) => void i18n.changeLanguage(v as AppLang)}
      data={[
        { label: t('language.uz'), value: 'uz' },
        { label: t('language.ru'), value: 'ru' },
      ]}
      aria-label={t('language.label')}
    />
  );
}
