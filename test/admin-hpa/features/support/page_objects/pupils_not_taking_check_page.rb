class PupilsNotTakingCheckPage < SitePrism::Page
  set_url '/pupils-not-taking-the-check'

  element :heading, '.heading-xlarge', text: 'Pupils not taking the check'
  element :info_text, 'p.lede', text: "All pupils must be considered for the multiplication tables check at the end of year 4. If a pupil is not going to take the check, a reason must be provided."
  element :add_reason, 'a', text: "Select pupil and reason"
  element :back_to_top, 'a', text: "Back to top"
  element :flash_message, '.info-message'
  element :signed_in_as, '.signed-in-as'
  element :no_pupils_listed_message, '.top-padding-30', text: 'No pupils added'
  element :home, '#content .breadcrumbs a', text: 'Home'
  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'
  element :related_heading, ".heading-medium", text: 'Related'
  element :guidance, "a", text: 'Guidance'
  element :access_arrangements, "a", text: 'Access arrangements'
  element :generate_pins, "aside ul li:nth-child(3) a", text: 'Start the MTC - password and PINs'

  section :pupil_list, 'tbody' do
    sections :rows, 'tr' do
      element :name, 'label'
      element :reason, 'td:nth-of-type(2)'
      element :remove, 'a', text: 'Remove'
      element :highlight, '.highlight-item'
    end
  end

end
