/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Optional JWT for local browser testing when not inside Telegram (never commit real tokens). */
  readonly VITE_DEV_JWT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
