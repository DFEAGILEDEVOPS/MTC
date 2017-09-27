class PupilReasonPage < SitePrism::Page
  set_url '/school/pupils-not-taking-check/select-pupils'

  element :heading, '.heading-xlarge', text: 'Select pupils not taking the check'
  element :select_reason_text, 'h2', '1. Select reason'
  elements :attendance_codes, 'input[id^=attendance-code-]'
  element :back_to_top, 'a', text: 'Back to top'
  element :generate_pins, 'a', text: 'Generate PINs'

  element :select_all_pupils, '#tickAllCheckboxes'
  section :pupil_list, 'tbody' do
    sections :rows, 'tr' do
      element :checkbox, 'input[type="checkbox"]'
      element :name, 'label'
      element :reason, 'td:last-of-type'
    end

  end

end
