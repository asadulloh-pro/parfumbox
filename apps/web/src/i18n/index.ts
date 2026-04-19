import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
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
    syncDocumentLang(i18n.language);
  });

i18n.on('languageChanged', (lng) => {
  syncDocumentLang(lng);
  try {
    localStorage.setItem(I18N_STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export function intlLocaleForLanguage(lng: string): string {
  return lng === 'ru' ? 'ru-RU' : 'uz-UZ';
}

export default i18n;
