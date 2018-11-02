class UnassignFormPage < SitePrism::Page
  set_url '/test-developer/assign-form-to-window'

  element :heading, '.heading-xlarge'
  element :flash_message, '.info-message'


  section :check_forms, '#assignFormToWindowList tbody' do
    sections :rows, 'tr' do
      element :name_of_form, 'td:first-of-type'
      element :remove_from_window, '.link-button'
    end
  end

end
