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
  readonly VITE_STORE_ID: string
  readonly VITE_STORE_NAME: string
  readonly VITE_CURRENCY: string
  readonly VITE_TAX_RATE: string
  readonly VITE_SUPPORT_PHONE: string
  readonly VITE_SUPPORT_EMAIL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// PWA types
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}