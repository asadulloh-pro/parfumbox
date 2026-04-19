import { useTranslation } from 'react-i18next';
import type { AppLang } from '../../i18n';

import './language-switcher.css';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active: AppLang = i18n.language === 'ru' ? 'ru' : 'uz';

  return (
    <div className="pb-lang" role="group" aria-label={t('language.label')}>
      <button
        type="button"
        className={`pb-lang__btn${active === 'uz' ? ' pb-lang__btn--active' : ''}`}
        onClick={() => void i18n.changeLanguage('uz')}
      >
        {t('language.uz')}
      </button>
      <button
        type="button"
        className={`pb-lang__btn${active === 'ru' ? ' pb-lang__btn--active' : ''}`}
        onClick={() => void i18n.changeLanguage('ru')}
      >
        {t('language.ru')}
      </button>
    </div>
  );
}
