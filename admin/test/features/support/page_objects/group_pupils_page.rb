class GroupPupilsPage < SitePrism::Page
  set_url '/school/group-pupils'

  element :heading, '.heading-xlarge', text: 'Group pupils'
  element :intro, '#lead-paragraph', text: 'Organise pupils into groups if you are planning to administer the check to smaller cohorts.'
  element :create_group, "a[href='/school/group-pupils/add']"
  element :related_heading, ".heading-medium", text: 'Related'
  element :guidance, "a[href='/pdfs/mtc_cag_feb_2018_trial.pdf']", text: 'Guidance'
  element :pupil_register, "a[href='#']", text: 'Pupil register'
  element :generate_pins, "a[href='#']", text: 'Generate pupil PINs'
  element :info_message, '.info-message'

  section :group_list, '#groupList' do
    sections :rows, 'tbody tr' do
      element :group_name, 'strong a'
      element :group_count, 'span'
      element :highlight, '.highlight-item'
      element :remove, '.modal-link'
    end
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :content, '.modal-content p'
    element :cancel, '.modal-cancel'
    element :confirm, '.modal-confirm'
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