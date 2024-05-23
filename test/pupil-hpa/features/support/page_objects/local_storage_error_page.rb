class LocalStorageErrorPage < SitePrism::Page
  set_url '/local-storage-error'

  element :heading, 'h1', text: 'Local Storage is not enabled on your browser'
  element :teacher_instructions, '.panel.no-border'

end
