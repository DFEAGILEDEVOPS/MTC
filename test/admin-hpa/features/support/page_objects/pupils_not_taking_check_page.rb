class PupilsNotTakingCheckPage < SitePrism::Page
  set_url '/pupils-not-taking-the-check/pupils-list'

  element :heading, '.govuk-heading-xl', text: 'Confirm pupils not taking the check'
  element :info_text, 'p.govuk-body', text: "Headteachers may decide a pupil should not take the check, this should be recorded within this section. Further information on ‘Pupils not taking the check’ can be found in the check administration guidance."
  element :add_reason, 'a', text: "Select pupils"
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
      element :remove, 'a', text: 'Remove'
      element :highlight, '.govuk-highlight-item'
    end
  end

end
