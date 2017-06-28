class SchoolLandingPage < SitePrism::Page
  set_url '/school/school-home'

  element :home, '#content > .page-header > .breadcrumbs a', text: 'Home'
  element :breadcrumb, '#content > .page-header > .breadcrumbs'
  element :heading, '.heading-xlarge'
  element :instructions, 'p.lede', text: 'To start the check you will need to generate PINs for each individual pupil.'
  element :manage_pupil, 'a[href="/school/manage-pupils"]'
  element :manage_pupil_instructions, 'p', text: 'Generate PINs for pupils to start the multiplication tables check and select pupil attendance codes'
  element :submit_attendance_register, 'a[href="/school/submit-attendance"]', text: 'Submit attendance register'
  element :submit_attendance_register_instructions, 'p', text: "Review your attendance register and submit the headteacher's declaration form"
  element :results, 'a[href="/school/results"]', text: 'Results'
  element :results_instructions, 'p', text: "View detailed pupil results"
  section :phase_banner, PhaseBanner, '.phase-banner'

  element :sign_out, 'a[href="/sign-out"]', text: 'Sign out'

  section :before_you_start, '.column-one-third.blue-top-border' do
    element :guidance, "a[href='/PDFs/MTC_administration_guidance_June-2017-trial.pdf']", text: 'Guidance'
  end

end

