class PupilsNotTakingCheckPage < SitePrism::Page
  set_url '/pupils-not-taking-the-check/pupils-list'

  element :heading, '.govuk-heading-xl', text: 'Provide a reason why a pupil is not taking the check'
  element :info_text, 'p.govuk-body', text: "The multiplication tables check is statutory for all year 4 pupils. If your school’s headteacher decides a pupil should not take the check, the reason must be recorded, this includes pupils who have left the school."
  element :add_reason, 'a', text: "Select pupils and reason"
  element :back_to_top, 'a', text: "Back to top"
  element :flash_message, '.govuk-info-message'
  element :signed_in_as, '.signed-in-as'
  element :no_pupils_listed_message, '.govuk-body', text: 'No pupils added'
  element :home, '.govuk-breadcrumbs__link', text: 'Home'
  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'
  element :related_heading, ".govuk-heading-m", text: 'Related'
  element :guidance, "a", text: 'Read the guidance and watch videos'
  element :access_arrangements, "a", text: 'Enable access arrangements for pupils who need them'

  section :pupil_list, 'tbody' do
    sections :rows, 'tr' do
      element :name, 'label'
      element :reason, 'td:nth-of-type(2)'
      element :remove, 'a', text: 'Remove reason'
      element :highlight, '.govuk-highlight-item'
    end
  end

end
