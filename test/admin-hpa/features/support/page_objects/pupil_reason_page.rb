class PupilReasonPage < SitePrism::Page
  set_url '/pupils-not-taking-the-check/select-pupils'

  element :heading, '.govuk-heading-xl', text: 'Select pupils not taking the check'
  element :select_reason_text, 'h2', '1. Select reason'
  elements :attendance_codes, 'input[id^=attendance-code-]'
  element :back_to_top, 'a', text: 'Back to top'
  element :generate_pins, 'a', text: 'Generate PINs'
  element :pupil_coloumn, 'a', text: 'Pupil name'
  element :reason_coloumn, 'a', text: 'Reason'
  element :csrf, 'input[name="_csrf"]', visible: false

  section :sticky_banner, StickyBannerSection, '.govuk-sticky-banner-wrapper'
  section :group_filter, GroupFilter, '.govuk-grid-column-two-thirds'

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
    element :toggle, '.govuk-details__summary'
    element :absent, 'strong', text: 'Absent'
    element :absent_explanation, 'div', text: 'Pupil did not take the check due to absence.'
    element :left_school, 'strong', text: 'Left school'
    element :left_school_explanation, 'div', text: 'Pupil has left the school.'
    element :unable_to_access, 'strong', text: 'Unable to access'
    element :unable_to_access_explanation, 'div', text: 'Pupil is unable to access the check. This may be due to a physical disability or behavioural, emotional or social difficulties.'
    element :below_standard, 'strong', text: 'Working below expectation'
    element :below_standard_explanation, 'div', text: "Headteachers should use their knowledge of each pupil when considering whether it's appropriate to administer the check. The headteacher should consider entering any pupils who know, apply and understand the matters, skills and processes specified in the key stage 1 programme of study in relation to multiplication tables."
    element :just_arrived, 'strong', text: 'Just arrived with EAL'
    element :just_arrived_explanation, 'div', text: "Pupil with English as an additional language (EAL) has arrived during the check period and there isn't enough time to establish their abilities."
  end


  def attendance_code_mapping
    {'attendance-code-ABSNT' => 'Absent',
     'attendance-code-INCRG' => 'Incorrect registration',
     'attendance-code-LEFTT' => 'Left school',
     'attendance-code-NOACC' => 'Unable to access',
     'attendance-code-BLSTD' => 'Working below expectation',
     'attendance-code-JSTAR' => 'Just arrived with EAL'
    }
  end

  def select_reason(reason)
    mapping = attendance_code_mapping.find {|k, v| v == reason}
    attendance_codes.find {|code| code['id'] == mapping.first}.click
  end

  def select_pupil(name)
    row = pupil_list.rows.find {|row| row.name.text.include? name}
    row.checkbox.click
  end

  def add_reason_for_pupil(name, reason)
    select_pupil(name)
    select_reason(reason)
    sticky_banner.confirm.click
  end

end
