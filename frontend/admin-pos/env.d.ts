/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_ENABLE_OFFLINE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}