class SchoolLandingPage < SitePrism::Page
  set_url '/school/school-home'

  element :home, '#content > .page-header > .breadcrumbs a', text: 'Home'
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge'
  element :instructions, 'p.lede', text: 'To start the check you will need to generate PINs for each individual pupil.'
  element :manage_pupil, 'a[href="/school/manage-pupils"]'
  element :manage_pupil_instructions, 'p', text: 'Generate PINs for pupils to start the multiplication tables check and select pupil attendance codes'
  element :submit_attendance_register, 'a[href="/school/submit-attendance"]', text: 'Submit attendance register'
  element :submit_attendance_register_instructions, '.list li:nth-child(2) p', text: "Review your attendance register and submit the headteacher’s declaration form"
  element :results, 'a[href="/school/results"]', text: 'Results'
  element :results_instructions, 'p', text: "View detailed pupil results"
  section :phase_banner, PhaseBanner, '.phase-banner'

  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'

  element :before_you_start, '#content h3'
  element :guidance, "h3 + .list li a", text: 'Guidance'

end

