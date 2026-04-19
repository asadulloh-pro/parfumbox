import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetMeQuery } from '../../app/parfumApi';
import { useAppSelector } from '../../app/hooks';
import type { AppLang } from '../../i18n';

/** Applies saved profile locale (server) so UI matches user preference after login / reload. */
export function ProfileLocaleSync() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const { i18n } = useTranslation();
  const { data: me } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (!me?.locale) return;
    const l: AppLang = me.locale === 'ru' ? 'ru' : 'uz';
    if (i18n.language !== l) {
      void i18n.changeLanguage(l);
    }
  }, [me?.locale, i18n]);

  return null;
}
