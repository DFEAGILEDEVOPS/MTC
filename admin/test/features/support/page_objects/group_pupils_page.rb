class GroupPupilsPage < SitePrism::Page
  set_url '/school/group-pupils'

  element :heading, '.heading-xlarge', text: 'Group pupils'
  element :intro, '#lead-paragraph', text: 'Organise pupils into groups if you are not planning to administer the check to the whole cohort at the same time.'
  element :create_group, "a[href='/school/group-pupils/add']"
  element :related_heading, ".heading-medium", text: 'Related'
  element :guidance, "a[href='/PDFs/MTC_administration_guidance_June-2017-trial.pdf']", text: 'Guidance'
  element :pupil_register, "a[href='#']", text: 'Pupil register'
  element :generate_pins, "a[href='#']", text: 'Generate pupil PINs'

  section :group_list, '#groupList' do
    sections :rows, 'tbody tr' do
      element :group_name, 'td:first-of-type'
      element :remove, '.modal-link'
    end
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :content, '.modal-content p'
    element :cancel, '.modal-cancel'
    element :confirm, '.modal-confirm'

  end

end