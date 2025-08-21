class PupilReasonPage < SitePrism::Page
  set_url '/pupils-not-taking-the-check/select-pupils'

  element :heading, '.govuk-heading-xl', text: 'Provide a reason why a pupil is not taking the check'
  element :select_reason_text, 'h2', '1. Select reason'
  elements :attendance_codes, 'input[id^=attendance-code-]'
  element :back_to_top, 'a', text: 'Back to top'
  element :generate_pins, 'a', text: 'Generate PINs'
  element :pupil_coloumn, 'a', text: 'Pupil name'
  element :reason_coloumn, 'a', text: 'Reason'
  element :csrf, 'input[name="_csrf"]', visible: false

  section :sticky_banner, StickyBannerSection, '.govuk-sticky-banner-wrapper'
  section :group_filter, GroupFilter, '#main-content .govuk-grid-column-two-thirds'

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
    element :absent, 'strong', text: 'Absent during the whole check window'
    element :absent_explanation, 'div', text: 'Pupil did not take the check due to absence during the check window.'
    element :left_school, 'strong', text: 'Left school'
    element :left_school_explanation, 'div', text: 'Pupil has left the school.'
    element :unable_to_access, 'strong', text: 'Unable to access'
    element :unable_to_access_explanation, 'div', text: 'Pupil is unable to access the check. This may be due to a physical disability or behavioural, emotional or social difficulties.'
    element :below_standard, 'strong', text: 'Working below expectation'
    element :below_standard_explanation, 'div', text: "Headteachers should use their knowledge of each pupil to decide whether it is appropriate for them to take the check. Consider omitting pupils who do not possess the skills specified in the key stage 1 programme of study for multiplication tables. For example, pupils who cannot recall their 2, 5 and 10 times tables."
    element :just_arrived, 'strong', text: 'Just arrived and unable to establish abilities'
    element :just_arrived_explanation, 'div', text: "Pupil has arrived during the check window and there isn't enough time to establish their abilities. This may be for example a pupil with English as an additional language and not being able to communicate with the pupil."
  end


  def attendance_code_mapping
    {'attendance-code-ABSNT' => 'Absent during check window',
     'attendance-code-INCRG' => 'Incorrect registration',
     'attendance-code-LEFTT' => 'Left school',
     'attendance-code-NOACC' => 'Unable to access',
     'attendance-code-BLSTD' => 'Working below expectation',
     'attendance-code-JSTAR' => 'Just arrived and unable to establish abilities'
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
