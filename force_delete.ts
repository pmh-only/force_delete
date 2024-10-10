class ForceDeleteExtension {
  private readonly LOOP_INTERVAL_TIME = 100

  private readonly EXPLICIT_TARGET_SELECTORS = [

    // S3 ---
    '.delete-bucket-actions__input>input',

    // VPC ---
    'div[data-id="confirmation-modal-input"]>input',

    // IAM ---
    'div[data-testid="roles-delete-modal-input"]>input',
    'div[data-testid="policies-delete-modal-input"]>input',
    'div[data-testid="policies-from-role-delete-modal-input"]>input',

    // Firehose ---
    'div[data-hook="DELETE_CONFIRMATION_INPUT"]>input',

    // RDS ---
    'div[data-testid="delete-protection-input"]>input'

  ]

  private readonly OVERRIDDEN_TARGET_VALUES = [
    {
      target: 'div[data-testid="delete-protection-input"]>input',
      value: 'delete me'
    }
  ]

  private readonly IMPLICIT_TARGET_PLACEHOLDERS = [
    'delete',
    'delete me',
    'confirm',
    'permanently delete'
  ]

  public readonly startLoop = (): void => {
    setInterval(
      this.process.bind(this),
      this.LOOP_INTERVAL_TIME)
  }

  private readonly process = (): void =>
    this.applyDeleteMessages(this.findTargets())

  //
  // Target Element Finder ---
  private readonly findTargets = (): HTMLInputElement[] => [
    ...this.findExplicitTargets(),
    ...this.findImplicitTargets()
  ]

  private readonly findExplicitTargets = (): HTMLInputElement[] =>
    this.EXPLICIT_TARGET_SELECTORS
      .map(this.findTargetElements.bind(this))
      .reduce((prev, curr) => ([...prev, ...curr]), [])
      .filter((v) =>
        v !== null &&
        v instanceof HTMLInputElement
      )
      .filter((v) =>
        !v.disabled &&
        v.value.length < 1
      )

  private readonly findImplicitTargets = (): HTMLInputElement[] =>
    this.findTargetElements('input')
      .filter((v) =>
        v !== null &&
        v instanceof HTMLInputElement
      )
      .filter((v) =>
        !v.disabled &&
        v.value.length < 1 &&
        this.IMPLICIT_TARGET_PLACEHOLDERS.includes(v.placeholder.toLowerCase())
      )

  private readonly findTargetElements = (targetSelector: string): Array<Element | null> =>
    [...document.querySelectorAll(targetSelector)]

  //
  // Delete-safe Message Applier ---

  private readonly applyDeleteMessages = (elements: HTMLInputElement[]): void =>
    elements.forEach(this.applyDeleteMessage.bind(this))

  private readonly applyDeleteMessage = (element: HTMLInputElement): void => {
    element.classList.add('__force_deleted') // Play autocomplete animation

    element.value = this.calculateValue(element)
    element.dispatchEvent(new Event('input', {
      bubbles: true
    }))
  }

  //
  // Value Calculator ---
  private readonly calculateValue = (element: HTMLInputElement): string =>
    this.findOverriddenValue(element) ??
    this.findPlaceholderValue(element) ??
    'delete'

  private readonly findOverriddenValue = (element: HTMLElement): string | undefined =>
    this.OVERRIDDEN_TARGET_VALUES
      .find((v) => [...document.querySelectorAll(v.target)].includes(element))
      ?.value

  private readonly findPlaceholderValue = (element: HTMLInputElement): string | undefined =>
    element.placeholder.length > 0
      ? element.placeholder
      : undefined
}

//
// Main ---

new ForceDeleteExtension()
  .startLoop()
