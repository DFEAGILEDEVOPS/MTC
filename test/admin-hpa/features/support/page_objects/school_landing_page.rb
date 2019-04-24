class SchoolLandingPage < SitePrism::Page
  set_url '/school/school-home'

  element :home, '#content > .page-header > .breadcrumbs a', text: 'Home'
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge'
  element :pupil_register, 'a[href="/pupil-register/pupils-list"]'
  element :pupil_register_text, 'span', text: 'Add, edit and review pupils'
  element :incomplete_banner, '.warning-banner', text: 'INCOMPLETE'
  element :incomplete_banner_text, '.font-xsmall.font-greyed-out', text: 'There are pupils with an incomplete status in your register'
  element :group_pupils, 'a[href="/group/pupils-list'
  element :group_pupils_text, 'p', text: 'Create groups'
  element :pupils_not_taking_check, 'a[href="/pupils-not-taking-the-check/pupils-list"]'
  element :pupils_not_taking_check_text, 'p', text: 'Enter a reason for pupils who are unable to take the check'
  element :access_arrangements, 'a', text: 'Access arrangements'
  element :access_arrangements_text, 'p', text: 'Select arrangements for pupils with access needs'
  element :generate_pupil_pin, 'a[href="/pupil-pin/generate-live-pins-overview"]'
  element :generate_pupil_pin_disabled, '.disabled-link', text: 'Start the multiplication tables check - password and PINs'
  element :generate_pupil_pin_text, 'p', text: 'Generate school password and personal identification numbers (PINs) so pupils can take the MTC'
  element :generate_pupil_pin_familiarisation, 'a[href="/pupil-pin/generate-familiarisation-pins-overview"]'
  element :generate_pupil_pin_familiarisation_text, 'p', text: 'Generate school password and personal identification numbers (PINs) so pupils can familiarise themselves with the MTC'
  element :restarts, 'a[href="/restart/overview"]'
  element :restarts_text, 'p', text: 'Select pupils to restart because of an interrupted check'
  element :hdf, 'a', text: "Headteacher's declaration form"
  element :hdf_disabled, '.heading-small', text: "Headteacher's declaration form"
  element :hdf_text, 'p', text: "Complete headteacher's declaration form once all pupils have a status of 'Completed' or a reason for not taking the check"
  element :hdf_disabled_text, 'p', text: "Complete the headteacher's declaration form once you have submitted your pupil register"
  element :results, '.disabled-link', text: 'Results'
  element :results_text, 'span', text: "View pupil results"

  element :teacher_name, '.signed-in-as'
  section :phase_banner, PhaseBanner, '.phase-banner'

  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'

  element :related, '#content h3'
  element :guidance, 'aside.support-column nav li a', text: 'Guidance'

end

