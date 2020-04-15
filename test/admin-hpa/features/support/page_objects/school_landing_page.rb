class SchoolLandingPage < SitePrism::Page
  set_url '/school/school-home'

  element :heading, '.govuk-heading-xl'
  # prepare for the check

  element :guidance, 'a', text: 'Read guidance and watch videos'

  # pupil register
  element :pupil_register, 'a', text: "View, add or edit pupils on your school's register"

  # groups
  element :group_pupils, 'a[href="/group/pupils-list'

  # pupils not taking check
  element :pupils_not_taking_check, 'a[href="/pupils-not-taking-the-check/pupils-list"]'

  # access arrangements
  element :access_arrangements, 'a', text: 'Enable access arrangements for pupils who need them'


  # preview check
  element :generate_pupil_pin_familiarisation, 'a[href="/pupil-pin/generate-familiarisation-pins-overview"]'
  element :generate_pupil_pin_familiarisation_text, 'p', text: 'Generate school password and personal identification numbers (PINs) so pupils can familiarise themselves with the MTC'

  # live check
  element :generate_pupil_pin, 'a[href="/pupil-pin/generate-live-pins-overview"]'
  element :generate_pupil_pin_disabled, '.disabled-link', text: 'Start the multiplication tables check - password and PINs'


  element :incomplete_banner, '.warning-banner', text: 'REVIEW PUPIL STATUS'
  element :incomplete_banner_text, '.govuk-font-greyed-out', text: 'Ensure all pupils have successfully completed the check'

  # review check
  element :pupil_status, 'a', text: 'See how many of your pupils have completed the official check'
  element :restarts, 'a[href="/restart/overview"]'

  # After check
  element :hdf, 'a', text: "Complete the headteacher's declaration form"
  element :hdf_disabled, '.heading-small', text: "Complete the headteacher's declaration form"
  element :hdf_disabled_text, 'p', text: "Complete the headteacher's declaration form once you have submitted your pupil register"
  element :results, '.govuk-disabled-link', text: 'View pupil results'

  element :teacher_name, '.signed-in-as'
  section :phase_banner, PhaseBanner, '.govuk-phase-banner'

  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'
  element :remove_impersonation, '.govuk-button-as-link', text: 'Remove impersonation'

  section :service_message, '.govuk-warning-message' do
    element :service_message_heading, '.govuk-heading-l'
    element :service_message_text, '.govuk-body'
  end

  section :helpdesk_tools, '.app-related-items', text: 'Helpdesk Tools' do
    element :summary, 'a[href="/helpdesk/school-summary"]', text: 'View PIN usage'
  end

  section :mtc_process, '#step-by-step-navigation' do
    element :show_all, 'button', text: 'Show all'
    section :prepare_for_check, '#prepare-for-the-check' do
      element :header, '.app-step-nav__header'
      element :info_text, 'p', text: 'Prepare for the check by reading guidance documents, ensuring all pupils who will be taking the check are on the pupil register, grouping pupils and applying access arrangements'
    end
    section :preview_the_check, '#preview-the-check' do
      element :header, '.app-step-nav__header'
      element :info_text, 'p', text: "The MTC can be previewed to see what the pupils will see during the check in the 'try it out' area. This area can also be used to preview access arrangements and check that the browsers and devices in the school are compatible with the MTC"
    end
    section :start_check, '#start-the-official-check' do
      element :header, '.app-step-nav__header'
      element :info_text, 'p', text: 'This is the official Multiplication tables check. Please generate passwords and PINs and hand them to pupils to use for the Official check.'
    end
    section :review_check, '#review-the-check' do
      element :header, '.app-step-nav__header'
      element :info_text, 'p', text: 'Go through the pupil status to ensure all pupils have successfully taken the check or have a reason for removing pupil from the MTC register'
    end
    section :after_check, '#after-the-check' do
      element :header, '.app-step-nav__header'
      element :info_text, 'p', text: "Once the pupil status is reviewed and complete. Go into the headteacher's declaration form to check through the pupil outcomes. View the results once they have been released."
    end
  end

end

