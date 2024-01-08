class GroupPupilsPage < SitePrism::Page
  set_url '/group/pupils-list'

  element :heading, '.govuk-heading-xl', text: 'Organise pupils into groups'
  element :intro, '.govuk-body', text: 'You can organise pupils into classes or smaller groups. This will make administering the check easier as you can filter by these groups when generating PINs, recording pupils as not taking the check, or arranging restarts.'
  element :create_group, ".govuk-button", text: 'View pupils and create new group'
  element :related_heading, "#subsection-title", text: 'Related'
  element :guidance, "a", text: 'Read the guidance and watch videos'
  element :not_taking_check, "a[href='/pupils-not-taking-the-check/pupils-list']", text: 'Provide a reason why pupil is not taking the check'
  element :access_arrangment, "a[href='/access-arrangements/overview']", text: 'Enable access arrangements for pupils who need them'
  element :info_message, '.govuk-info-message'
  element :csrf, 'input[name="_csrf"]', visible: false

  section :group_list, '#groupList' do
    sections :rows, 'tbody tr' do
      element :group_name, 'td:nth-child(1) a'
      element :group_count, 'span'
      element :highlight, '.govuk-highlight-item'
      element :remove, '.modal-link'
    end
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :content, '.modal-content p'
    element :cancel, '#js-modal-cancel-button'
    element :confirm, '#js-modal-confirmation-button'
  end

  section :service_message, 'div[class^="mtc-notification-banner"]' do
    element :service_message_heading, '#govuk-notification-banner-title'
    element :service_message_text, '.govuk-notification-banner__content'
  end

  def remove_all_groups
    (groups = group_list.rows.count
    groups.to_i.times do
      group_list.rows.first.remove.click
      modal.confirm.click
    end) unless has_no_group_list?
  end

  def remove_group(name)
    row = group_list.rows.find {|row| row.group_name.text == name}
    row.remove.click
    modal.confirm.click
  end

end
