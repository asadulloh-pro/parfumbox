import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/uz-latn';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

export const I18N_STORAGE_KEY = 'parfumbox.lang';
export const LANGUAGES = ['uz', 'ru'] as const;
export type AppLang = (typeof LANGUAGES)[number];

function readStoredLang(): AppLang {
  try {
    const v = localStorage.getItem(I18N_STORAGE_KEY);
    if (v === 'uz' || v === 'ru') return v;
  } catch {
    /* ignore */
  }
  return 'uz';
}

function syncDayjsLocale(lng: string) {
  dayjs.locale(lng === 'ru' ? 'ru' : 'uz-latn');
}

function syncDocumentLang(lng: string) {
  document.documentElement.lang = lng === 'ru' ? 'ru' : 'uz';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
    },
    lng: readStoredLang(),
    fallbackLng: 'uz',
    interpolation: { escapeValue: false },
  })
  .then(() => {
    syncDayjsLocale(i18n.language);
    syncDocumentLang(i18n.language);
  });

i18n.on('languageChanged', (lng) => {
  syncDayjsLocale(lng);
  syncDocumentLang(lng);
  try {
    localStorage.setItem(I18N_STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export default i18n;
