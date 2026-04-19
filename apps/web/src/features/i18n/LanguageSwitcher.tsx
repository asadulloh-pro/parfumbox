import { useTranslation } from 'react-i18next';
import { usePatchMeMutation } from '../../app/parfumApi';
import { useAppSelector } from '../../app/hooks';
import type { AppLang } from '../../i18n';

import './language-switcher.css';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const token = useAppSelector((s) => s.auth.accessToken);
  const [patchMe] = usePatchMeMutation();
  const active: AppLang = i18n.language === 'ru' ? 'ru' : 'uz';

  function setLang(lng: AppLang) {
    void i18n.changeLanguage(lng);
    if (token) {
      void patchMe({ locale: lng });
    }
  }

  return (
    <div className="pb-lang" role="group" aria-label={t('language.label')}>
      <button
        type="button"
        className={`pb-lang__btn${active === 'uz' ? ' pb-lang__btn--active' : ''}`}
        onClick={() => setLang('uz')}
      >
        {t('language.uz')}
      </button>
      <button
        type="button"
        className={`pb-lang__btn${active === 'ru' ? ' pb-lang__btn--active' : ''}`}
        onClick={() => setLang('ru')}
      >
        {t('language.ru')}
      </button>
    </div>
  );
}
