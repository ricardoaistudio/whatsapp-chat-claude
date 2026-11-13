export type WaMode = 'claro' | 'escuro' | 'off'

declare module 'claude-code' {
  interface PluginState {
    'whatsapp-chat': { mode: WaMode }
  }
}
