class ForceDeleteExtension {
  private readonly LOOP_INTERVAL_TIME = 500

  private readonly TARGET_SELECTORS = [

    // S3 ---
    '.empty-bucket-actions__input>input',
    '.delete-bucket-actions__input>input',

    // VPC ---
    'div[data-id="confirmation-modal-input"]>input'

  ]

  public readonly startLoop = (): void => {
    setInterval(
      this.process.bind(this),
      this.LOOP_INTERVAL_TIME)
  }

  private readonly process = (): void => {
    this.applyDeleteMessages(this.findTargets())
  }

  //
  // Target Element Finder ---

  private readonly findTargets = (): HTMLInputElement[] =>
    this.TARGET_SELECTORS
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

  private readonly findTargetElements = (targetSelector: string): Array<Element | null> =>
    [...document.querySelectorAll(targetSelector)]

  //
  // Delete-safe Message Applier ---

  private readonly applyDeleteMessages = (elements: HTMLInputElement[]): void =>
    elements.forEach(this.applyDeleteMessage.bind(this))

  private readonly applyDeleteMessage = (element: HTMLInputElement): void => {
    element.value = element.placeholder
    element.dispatchEvent(new Event('input', {
      bubbles: true
    }))
  }
}

//
// Main ---

new ForceDeleteExtension()
  .startLoop()
