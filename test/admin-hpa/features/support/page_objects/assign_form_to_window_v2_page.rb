class AssignFormToWindowV2Page < SitePrism::Page
  set_url '/check-form/assign-forms-to-check-windows'

  element :heading, '.heading-xlarge', text: 'Assign forms to check window'
  element :information, '#lead-paragraph', text: 'Select forms to assign to each window. Each form can be used for multiple windows.'
  element :flash_message, '.info-message.clickable'


  section :check_windows, '.assigned-check-windows' do
    sections :rows, 'dd' do
      element :name_of_window, '.font-small'
      element :try_it_out_check_link, 'div .bold-small a', text: "'Try it out' period"
      element :try_it_out_check_link_text, "div[id$='-familiarisation']"
      element :try_it_out_check_date, "p[id*='familiarisation-period']"
      element :mtc_check_link, 'div .bold-small a', text: "Multiplication tables check period"
      element :mtc_check_link_text, "div[id$='-live']"
      element :mtc_check_date, "p[id*='live-period']"
    end
  end

end
