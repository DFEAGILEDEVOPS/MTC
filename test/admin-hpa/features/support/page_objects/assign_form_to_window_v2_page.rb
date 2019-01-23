class AssignFormToWindowV2Page < SitePrism::Page
  set_url '/check-form/assign-forms-to-check-windows'

  element :heading, '.heading-xlarge', text: 'Assign forms to check window'
  element :information, '#lead-paragraph', text: 'Select forms to assign to each window. One form can be applied to different windows.'

  section :check_windows, '.assigned-check-windows' do
    sections :rows, 'dd' do
      element :name_of_window, '.font-small'
      element :try_it_out_check_link, 'div .bold-small a', text: "'Try it out' period"
      element :try_it_out_check_date, "p[id*='familiarisation-period']"
      element :mtc_check_link, 'div .bold-small a', text: "Multiplication tables check period"
      element :mtc_check_date, "p[id*='live-period']"
    end
  end

end
