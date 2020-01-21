class SchoolLandingPage < SitePrism::Page
  set_url '/school/school-home'

  element :heading, '.govuk-heading-xl'
  # prepare for the check

  element :guidance, 'a', text: 'Guidance documents'
  element :guidance_text, '.govuk-body-m', text: 'Read the three guidance documents and watch the guidance videos to ensure best use and understanding of how to administer the MTC to pupils'

  # pupil register
  element :pupil_register, 'a', text: 'Pupil register'
  element :pupil_register_text, '.govuk-body-m', text: 'Add, edit and review pupils'

  # groups
  element :group_pupils, 'a[href="/group/pupils-list'
  element :group_pupils_text, 'p', text: "Create groups e.g. by class or ability. These can be used as a filter when generating and printing PINs for the 'Try it out' and official MTC check"

  # pupils not taking check
  element :pupils_not_taking_check, 'a[href="/pupils-not-taking-the-check/pupils-list"]'
  element :pupils_not_taking_check_text, 'p', text: 'Enter a reason for pupils who were unable to take the check. This includes pupils who have left the school and those with circumstances that exempts them from taking the check'

  # access arrangements
  element :access_arrangements, 'a', text: 'Access arrangements'
  element :access_arrangements_text, 'p', text: 'Select arrangements for pupils with special educational needs or disabilities'


  # preview check
  element :generate_pupil_pin_familiarisation, 'a[href="/pupil-pin/generate-familiarisation-pins-overview"]'
  element :generate_pupil_pin_familiarisation_text, 'p', text: 'Generate school password and personal identification numbers (PINs) so pupils can familiarise themselves with the MTC'

  # live check
  element :generate_pupil_pin, 'a[href="/pupil-pin/generate-live-pins-overview"]'
  element :generate_pupil_pin_disabled, '.disabled-link', text: 'Start the multiplication tables check - password and PINs'
  element :generate_pupil_pin_text, 'p', text: 'Generate school password and personal identification numbers (PINs) so pupils can take the MTC'


  element :incomplete_banner, '.warning-banner', text: 'INCOMPLETE'
  element :incomplete_banner_text, '.govuk-font-greyed-out', text: 'There are pupils with an incomplete status in your register'

  # review check
  element :pupil_status, 'a', text: 'Pupil status'
  element :restarts, 'a[href="/restart/overview"]'
  element :restarts_text, 'p', text: 'Select pupils to restart because of an interrupted check'

  # After check
  element :hdf, 'a', text: "Headteacher's declaration form"
  element :hdf_disabled, '.heading-small', text: "Headteacher's declaration form"
  element :hdf_text, 'p', text: "Complete headteacher's declaration form once all pupils have completed or have a reason for not taking the check"
  element :hdf_disabled_text, 'p', text: "Complete the headteacher's declaration form once you have submitted your pupil register"
  element :results, '.govuk-disabled-link', text: 'Results'
  element :results_text, 'span', text: "View pupils' results"

  element :teacher_name, '.signed-in-as'
  section :phase_banner, PhaseBanner, '.govuk-phase-banner'

  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'
  element :remove_impersonation, '.govuk-button-as-link', text: 'Remove impersonation'

  section :service_message, '.govuk-warning-message' do
    element :service_message_heading, '.govuk-heading-l'
    element :service_message_text, '.govuk-body'
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

