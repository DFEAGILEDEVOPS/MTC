class PupilReasonPage < SitePrism::Page
  set_url '/school/pupils-not-taking-check/select-pupils'

  element :heading, '.heading-xlarge', text: 'Select pupils not taking the check'
  element :select_reason_text, 'h2', '1. Select reason'
  elements :attendance_codes, 'input[id^=attendance-code-]'
  element :back_to_top, 'a', text: 'Back to top'
  element :generate_pins, 'a', text: 'Generate PINs'
  element :pupil_coloumn, 'a', text: 'Pupil name'
  element :reason_coloumn, 'a', text: 'Reason'

  section :sticky_banner, StickyBannerSection, '.sticky-banner-wrapper'

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

  section :explanation_section, 'details' do
    element :toggle, 'summary[role="button"]'
    element :absent, 'strong', text: 'Absent'
    element :absent_explanation, 'div', text: 'Pupil has not taken the check due to absence'
    element :left_school, 'strong', text: 'Left school'
    element :left_school_explanation, 'div', text: 'Pupil is unable to access the check. This may be due to a physical disability or behavioural, emotional or social difficulties.'
    element :unable_to_access, 'strong', text: 'Unable to access'
    element :unable_to_access_explanation, 'div', text: 'Pupil is unable to access the check.'
    element :below_standard, 'strong', text: 'Working below expectation'
    element :below_standard_explanation, 'div', text: 'Pupil is considered unable to answer the easiest questions or is working below year 2 in multiplication tables.'
    element :just_arrived, 'strong', text: 'Just arrived with EAL'
    element :just_arrived_explanation, 'div', text: "Pupil with English as an additional language (EAL) has just arrived in school from overseas during the check window and there isn't enough time to establish their abilities."
  end
end
