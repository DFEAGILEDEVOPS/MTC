class AssignFormToWindowV2Page < SitePrism::Page
  set_url '/check-form/assign-forms-to-check-windows'

  element :heading, '.govuk-heading-xl', text: 'Assign forms to check window'
  element :information, '.govuk-body', text: 'Select forms to assign to each window. Each form can be used for multiple windows.'
  element :flash_message, '.govuk-info-message'
  element :save_button, 'input[value="Save"]'
  element :cancel_button, 'a.govuk-button--secondary'


  section :check_windows, '.assigned-check-windows' do
    sections :rows, 'dd' do
      element :name_of_window, 'p[class="govuk-!-font-size-19"]'
      element :try_it_out_check_link, '.govuk-link', text: "'Try it out' period"
      element :try_it_out_check_link_text, "div[id$='-familiarisation']"
      element :try_it_out_check_date, "div[id*='familiarisation-period']"
      element :mtc_check_link, '.govuk-link', text: "Multiplication tables check period"
      element :mtc_check_link_text, "div[id$='-live']"
      element :mtc_check_date, "div[id*='live-period']"
    end
  end

end
