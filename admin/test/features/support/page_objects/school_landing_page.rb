class SchoolLandingPage < SitePrism::Page
  set_url '/school/school-home'

  element :home, '#content > .page-header > .breadcrumbs a', text: 'Home'
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge'
  element :instructions, 'p.lede', text: 'To start the check you will need to generate PINs for each individual pupil.'
  element :pupil_register, 'a[href="/school/pupil-register/lastName/true"]'
  element :pupils_not_taking_check, 'a[href="/school/pupils-not-taking-check"]'
  element :generate_pupil_pin, 'a[href="/pupil-pin/generate-pins-overview"]'
  element :manage_pupil_instructions, 'p', text: 'Generate and print pupil Personal Identification Numbers (PINs) and view existing PINs'
  element :submit_attendance_register, 'a', text: 'Submit attendance register'
  element :teacher_name, '.signed-in-as'
  element :submit_attendance_register_instructions, '.list li:nth-child(2) p', text: "Review your attendance register and submit the headteacher’s declaration form"
  element :results, 'a[href="/school/results"]', text: 'Results'
  element :results_instructions, 'p', text: "View a summary and breakdown of pupil results"
  section :phase_banner, PhaseBanner, '.phase-banner'

  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'

  element :before_you_start, '#content h3'
  element :guidance, 'aside.support-column nav li a', text: 'Guidance'

end

