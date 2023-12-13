class PupilRegisterPage < SitePrism::Page
  set_url '/pupil-register/pupils-list'

  element :heading, '.govuk-heading-xl', text: "View, add or edit pupils on your school's register"
  element :add_pupil, 'a', text: 'Add pupil'
  element :add_multiple_pupil, 'a', text: 'Add multiple pupils'
  element :info_message, '.govuk-info-message', text: 'Changes to pupil details have been saved'
  element :new_pupil_info_message, '.govuk-info-message', text: '1 new pupil has been added'
  element :add_multiple_pupil_info_message, '.govuk-info-message'
  element :not_taking_check_link, 'a[href="/pupils-not-taking-the-check"]'
  element :edited_pupil, '.highlight-item'
  element :pupil_status_explanation, '.govuk-details__summary-text'
  element :pupil_filter, '#search-name'
  section :phase_banner, PhaseBanner, '.govuk-phase-banner'
  section :cookies_banner, CookiesBannerSection, '#global-cookie-message'

  section :pupil_list_column_heading, '#register-pupils thead tr' do
    element :name_heading, 'th:nth-child(1)'
    element :group_heading, 'th:nth-child(2)'
    element :result_heading, 'th:nth-child(3)'
  end

  section :optional_columns, 'details.govuk-details' do
    element :optional_columns_text, '.govuk-details__summary-text'
    element :upn, '#optcolUpn'
    element :upn_label, '.govuk-label', text: 'UPN'
    element :group, '#optcolGroup'
    element :group_label, '.govuk-label', text: 'Group'
  end

  section :pupil_list, '#register-pupils' do
    element :pupil_header, '.govuk-table__header', text: 'Pupil'
    element :dob_header, '.govuk-table__header', text: 'Date of birth'
    element :upn_header, '#jqUpnHeader'
    element :group_header, '#jqGroupHeader'
    element :pupil_count, '.govuk-table__caption'
    sections :pupil_row, 'tbody tr' do
      element :names, '#pupilName'
      element :dob, 'td:nth-child(2)'
      element :upn, 'td:nth-child(3)'
      element :group, 'td:nth-child(4)'
      element :edited_pupil, '.govuk-highlight-item'
      element :edit_pupil_link, 'a'
      element :view_history, 'a', text: 'View'
    end
  end

  def find_pupil_row(name)
    wait_until{!(pupil_list.pupil_row.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.pupil_row.find {|pupil| pupil.text.include? name}
  end

  def select_optional_column(column_name)
    optional_columns.optional_columns_text.click if !optional_columns.upn_label.visible?
    optional_columns.send(column_name.downcase).click unless pupil_list.send(column_name.downcase + "_header").visible?
    wait_until(3, 1) {pupil_list.send(column_name.downcase + "_header").visible?}
  end

end
