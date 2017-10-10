class PupilsNotTakingCheckPage < SitePrism::Page
  set_url '/school/pupils-not-taking-check'

  element :heading, '.heading-xlarge', text: 'Pupils not taking the check'
  element :info_text, 'p.lede', text: "All pupils should be considered for the multiplication tables check at the end of year 4. If the headteacher decides a pupil should not take the check, they must provide a reason."
  element :add_reason, 'a', text: "Add reason for pupil"
  element :back_to_top, 'a', text: "Back to top"
  element :generate_pins, 'a', text: "Generate PINs"
  element :flash_message, '.info-message'
  element :signed_in_as, '.signed-in-as'
  element :no_pupils_listed_message, '.padding-top', text: 'No pupils with reason for not taking the check.'
  element :home, '#content .breadcrumbs a', text: 'Home'
  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'

  section :pupil_list, 'tbody' do
    sections :rows, 'tr' do
      element :name, 'label'
      element :reason, 'td:nth-of-type(2)'
      element :remove, 'a', text: 'Remove'
      element :highlight, '.highlight-item'
    end
  end

end
