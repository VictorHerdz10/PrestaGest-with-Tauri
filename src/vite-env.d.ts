/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // otras variables de entorno...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}