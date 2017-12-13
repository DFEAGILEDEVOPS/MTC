class AssignFormToWindowPage < SitePrism::Page
  set_url '/test-developer/assign-form-to-window'

  element :heading, '.heading-xlarge', text: 'Assign forms to check window'
  element :information, '#lead-paragraph', text: 'Select forms to assign to each window. One form can be allied to different windows.'
  element :flash_message, '.info-message'

  section :check_windows, '#assignFormToWindowList tbody' do
    sections :rows, 'tr' do
      element :name_of_window, 'td:first-of-type'
      element :assign_form, 'td a[href^="/test-developer/assign-form-to-window/"]'
    end
  end

  section :check_forms, '#assignFormToWindowList tbody' do
    sections :rows, 'tr' do
      element :name_of_form, 'td:first-of-type'
      element :select, '.multiple-choice-mtc'
    end
  end

  section :sticky_banner, '.sticky-banner-wrapper' do
    element :count, '.grid-row .column-half.first-half'
    element :cancel, 'a[href="/school/pupils-not-taking-check"]'
    element :confirm, 'input[value="Confirm"]'
  end

end
