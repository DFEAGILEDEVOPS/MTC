class PupilReasonPage < SitePrism::Page
  set_url '/school/pupils-not-taking-check/select-pupils'

  element :heading, '.heading-xlarge', text: 'Select pupils not taking the check'
  element :select_reason_text, 'h2', '1. Select reason'
  elements :attendance_codes, 'input[id^=attendance-code-]'
  element :back_to_top, 'a', text: 'Back to top'
  element :generate_pins, 'a', text: 'Generate PINs'
  element :pupil_coloumn, 'a', text: 'Pupil name'
  element :reason_coloumn, 'a', text: 'Reason'

  section :sticky_banner, '.sticky-banner-wrapper' do
    element :cancel, 'a[href="/school/pupils-not-taking-check/select-pupils"]'
    element :confirm, 'input[value="Confirm"]'
  end

  element :select_all_pupils, '#selectAll'
  element :unselect_all_pupils, '#selectAll'
  section :pupil_list, 'tbody' do
    sections :rows, 'tr' do
      element :checkbox, 'input[type="checkbox"]'
      element :selected, 'input[data-checked="true"]'
      element :name, 'label'
      element :reason, 'td:nth-of-type(2)'
    end

  end

end
