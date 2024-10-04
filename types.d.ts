import type { Browser } from 'webextension-polyfill'

declare global {
  const browser: Browser | undefined
  const chrome: Browser
}

interface CommunicateMessage {
  type: 'SAVE_FORM' | 'LOAD_FORM' | 'FORM_SAVED',
  data?: FormSavedData
}

interface FormSavedData {
  url: string
  contents:  FormSavedDataContent[]
}

interface FormSavedDataContent {
  selector: string,
  type: 'TEXT',
  value: string
}
