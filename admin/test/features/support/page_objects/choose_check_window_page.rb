class ChooseCheckWindowPage < SitePrism::Page
  set_url '/choose-check-window'

  element :heading, '.heading-xlarge', text: 'Choose check window'
  element :information, '.information'
  element :page_instructions, '.lede', text: 'Use this page to choose which check window you want to assign forms to.'
  section :phase_banner, PhaseBanner, '.phase-banner'

  section :assign_to_check_window, "form[action='assign-forms-to-check-windows']" do
    sections :rows, 'tbody tr' do
      element :checkbox, 'td:nth-of-type(1) .multiple-choice input'
      element :title, 'td:nth-of-type(1) .multiple-choice label'
      element :start_date, 'td:nth-of-type(2)'
      element :end_date, 'td:nth-of-type(3)'
    end
  end

  element :continue, 'input[value="Continue"]'
  element :back, 'a[href="manage-check-forms"]'

end
