import { CommunicateMessage, FormSavedData } from '../types'

void (async () => {
  const api = browser ?? chrome

  const [tab] = await api.tabs.query({
    active: true,
    currentWindow: true
  })

  if (tab.url === undefined) {
    document.body.innerText = 'Extension disabled on this page'
    return
  }

  if (localStorage.getItem('form_saved') === null) { localStorage.setItem('form_saved', '[]') }

  document.getElementById('save')?.addEventListener('click', () => {
    void (async () => {
      const formSaved: CommunicateMessage = await api.tabs.sendMessage(tab.id ?? 0, {
        type: 'SAVE_FORM'
      })

      if (formSaved.type !== 'FORM_SAVED') { return }

      const prevSaved = JSON.parse(localStorage.getItem('form_saved') ?? '') as Array<FormSavedData & { id: string }>
      const newSaved = JSON.stringify([
        {
          id: crypto.randomUUID(),
          ...formSaved.data
        },
        ...prevSaved.slice(0, 10)
      ])

      localStorage.setItem('form_saved', newSaved)

      renderTable()
    })()
  })

  renderTable()
  function renderTable (): void {
    const formSaved = JSON.parse(localStorage.getItem('form_saved') ?? '') as Array<FormSavedData & { id: string }>
    const renderPoint = document.getElementById('render_point')

    if (renderPoint === null) {
      return
    }

    renderPoint.innerHTML = ''

    for (const form of formSaved) {
      renderPoint.innerHTML += `
        <tr>
          <td>${form.id.substring(0, 8)}</td>
          <td>${new URL(form.url).pathname}${new URL(form.url).hash}</td>
          <td>${form.contents.filter((v) => v.type === 'TEXT').length} Texts</td>
          <td>
            <button id="load-${form.id}">Load</button>
            <button id="delete-${form.id}">x</button>
          </td>
        </tr>
      `
    }

    for (const form of formSaved) {
      document.getElementById(`load-${form.id}`)?.addEventListener('click', () => {
        void api.tabs.sendMessage<CommunicateMessage>(tab.id ?? 0, {
          type: 'LOAD_FORM',
          data: form
        })
      })

      document.getElementById(`delete-${form.id}`)?.addEventListener('click', () => {
        const prevSaved = JSON.parse(localStorage.getItem('form_saved') ?? '') as Array<FormSavedData & { id: string }>
        const newSaved = JSON.stringify(prevSaved.filter((v) => v.id !== form.id))

        localStorage.setItem('form_saved', newSaved)
        renderTable()
      })
    }
  }
})()
