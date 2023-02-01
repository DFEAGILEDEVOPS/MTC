window.addEventListener('load', (event) => {
  console.log(`page is loaded. tab id is ${getTabId1()}`)
  console.dir(document.tabs)
})

function getTabId2() {
  return browser.tabs[0].id
}

function getTabId1() {
  const sessionStorageKey = "TAB_ID_KEY"
  const idFromStorage = sessionStorage.getItem(sessionStorageKey)
  if (idFromStorage) {
      return idFromStorage
  } else {
      const id = uuidv4()
      sessionStorage.setItem(sessionStorageKey, id)
      return id
  }
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

