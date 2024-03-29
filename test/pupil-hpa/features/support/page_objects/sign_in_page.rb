class SignInPage < SitePrism::Page
  set_url '/sign-in'

  element :heading, '.heading-xlarge', text: "Sign in"
  element :global_header, '#global-header .header-logo'
  element :footer_link, '.footer-wrapper .footer-meta .copyright a'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

  section :login_failure, '.error-summary' do
    element :heading, '#error-summary-heading-1', text: 'Details entered do not match our records'
    element :message, 'p' , text: "Please check with your teacher that you used the correct school password and PIN. Your teacher may also find it useful to view your check status on the ‘Check how many pupils have completed the check’ page within in the MTC service."
  end

  element :logo, '.organisation-logo'
  element :first_letter, '#last-name'
  element :day, '#dob-day'
  element :month, '#dob-month'
  element :pin, '.pin-entry'
  element :school_pin, '#schoolPin'
  element :pupil_pin, '#pupilPin'
  element :sign_in_button, '.button-start'
  element :auto_complete_off, "form[autocomplete='off']"

  def login(pin_school, pin_pupil=nil)
    school_pin.set pin_school
    pupil_pin.set pin_pupil
  end

end
