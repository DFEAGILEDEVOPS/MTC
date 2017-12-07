class AssignFormToWindowPage < SitePrism::Page
  set_url '/choose-check-window'

  element :heading, '.heading-xlarge', text: 'Assign forms to check window'
  element :information, '#lead-paragraph', text: 'Select forms to assign to each window. One form can be allied to different windows.'

  section :check_windows, '#assignFormToWindowList tbody' do
    sections :rows, 'tr' do
      element :name_of_window, 'td:first-of-type'
      element :assign_form, 'td a[href^="/test-developer/assign-form-to-window/"]'
    end
  end

end
