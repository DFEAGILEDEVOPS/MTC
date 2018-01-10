class AddEditGroupsPage < SitePrism::Page
  set_url '/school/group-pupils{/add_or_edit}'

  element :group_name, '#name'
  section :sticky_banner, StickyBannerSection, '.sticky-banner-wrapper'
  section :error_summary, '.error-summary' do
    element :heading, 'h2', text: 'Check the details in the groups form'
    element :name_length, 'p', text: "Check that the group name is no longer than 35 characters, has no forbidden characters and hasn't being already used."
    element :pupil_selection, 'p', text: "Check that least one pupil has been selected"
  end
  element :length_error, '.error-message', text: "Group name can't contain more than 35 characters"
  element :special_char_error, '.error-message', text: "Check the group name doesn't contain special characters"
  element :name_already_in_use, '.error-message', text: "Group name already exists"

  element :select_all_pupils, '#tickAllCheckboxes'
  element :unselect_all_pupils, '#tickAllCheckboxes'
  section :pupil_list, 'tbody' do
    sections :rows, 'tr' do
      element :name, 'label'
      element :checkbox, 'input[type="checkbox"]'
    end
  end

end
