import { CommunicateMessage, FormSavedDataContent } from './types'

class FormSaverExtension {
  private readonly api = browser ?? chrome

  public startListen = (): void =>
    this.api.runtime.onMessage.addListener(this.messageHandler.bind(this))

  // ---

  private readonly messageHandler = (message: unknown, _: any, sendResponse: (message: CommunicateMessage) => void): undefined => {
    const receivedMessage = message as CommunicateMessage

    if (receivedMessage.type === 'SAVE_FORM') {
      return sendResponse(this.saveForm()) as undefined
    }

    if (receivedMessage.type === 'LOAD_FORM') {
      return this.loadForm(receivedMessage.data?.contents ?? []) as undefined
    }
  }

  private readonly saveForm = (): CommunicateMessage => {
    const inputElements = this.findInputElements()

    return {
      type: 'FORM_SAVED',
      data: {
        url: window.location.href,
        contents: [
          ...this.retrieveTextInputValues(inputElements)
        ]
      }
    }
  }

  private readonly loadForm = (formSaved: FormSavedDataContent[]): void => {
    this.loadTextInputValues(formSaved)
  }

  // ---

  private readonly findInputElements = (): HTMLInputElement[] =>
    [...document.querySelectorAll('input')]

  private readonly retrieveTextInputValues = (elements: HTMLInputElement[]): FormSavedDataContent[] =>
    elements
      .filter((v) => v.type === 'text')
      .map((v) => ({
        selector: `div#${v.parentElement?.id ?? ''}>input`,
        type: 'TEXT' as const,
        value: v.value
      }))

  // ---

  private readonly loadTextInputValues = (formSaved: FormSavedDataContent[]): void =>
    formSaved
      .filter((v) => v.type === 'TEXT')
      .forEach(this.loadTextInputValue.bind(this))

  private readonly loadTextInputValue = (formSaved: FormSavedDataContent): void => {
    const element = document.querySelector(formSaved.selector)
    if (element === null || !(element instanceof HTMLInputElement) || element.type !== 'text') { return }

    element.value = formSaved.value
    element.dispatchEvent(new Event('input', {
      bubbles: true
    }))
  }
}

new FormSaverExtension()
  .startListen()
