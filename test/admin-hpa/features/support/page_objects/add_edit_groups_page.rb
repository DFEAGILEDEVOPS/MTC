class AddEditGroupsPage < SitePrism::Page
  set_url '/group/pupils-list{/add_or_edit}'

  element :group_name, '#name'
  section :sticky_banner, StickyBannerSection, '.govuk-sticky-banner-wrapper'
  section :error_summary, 'div[aria-labelledby="error-summary-title"]' do
    element :heading, 'h2', text: 'You need to fix the errors on this page before continuing'
    element :message, 'p', text: "See highlighted errors below"
    element :message, 'li a'
  end
  element :length_error, '.govuk-error-message', text: "Enter a group name in no more than 35 characters"
  element :special_char_error, '.govuk-error-message', text: "Enter a group name without special characters"
  element :name_already_in_use, '.govuk-error-message'

  element :select_all_pupils, '#tickAllCheckboxes'
  element :unselect_all_pupils, '#tickAllCheckboxes'
  section :pupil_list, 'tbody' do
    sections :rows, 'tr' do
      element :name, 'label'
      element :checkbox, 'input[type="checkbox"]'
    end
  end

  def select_pupil_for_a_group(name)
    pupil = find_pupil_row(name)
    name = pupil.name.text
    pupil.checkbox.click
    name
  end

  def find_pupil_row(name)
    wait_until {!(pupil_list.rows.find {|pupil| pupil.text.include? name}).nil?}
    pupil_list.rows.find {|pupil| pupil.text.include? name}
  end

end
