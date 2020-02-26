class PupilsNotTakingCheckPage < SitePrism::Page
  set_url '/pupils-not-taking-the-check/pupils-list'

  element :heading, '.govuk-heading-xl', text: 'Give a reason why a pupil is not taking the check'
  element :info_text, 'p.govuk-body', text: "All pupils must be considered to take the multiplication tables check at the end of year 4. If a pupil is working below expectation or has left your school, a reason must be provided."
  element :add_reason, 'a', text: "Select pupil and reason"
  element :back_to_top, 'a', text: "Back to top"
  element :flash_message, '.govuk-info-message'
  element :signed_in_as, '.signed-in-as'
  element :no_pupils_listed_message, '.govuk-body', text: 'No pupils added'
  element :home, '.govuk-breadcrumbs__link', text: 'Home'
  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'
  element :related_heading, ".govuk-heading-m", text: 'Related'
  element :guidance, "a", text: 'Read the guidance and watch videos'
  element :access_arrangements, "a", text: 'Set access arrangements for pupils that need them'

  section :pupil_list, 'tbody' do
    sections :rows, 'tr' do
      element :name, 'label'
      element :reason, 'td:nth-of-type(2)'
      element :remove, 'a', text: 'Remove'
      element :highlight, '.govuk-highlight-item'
    end
  end

end
