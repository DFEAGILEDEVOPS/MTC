class SignInFailurePage < SitePrism::Page
  set_url '/sign-in-failure'

  element :retry_sign_in, "a[href='/sign-in']"
  element :error_message, ".lede", text: "The details entered do not match our records. Please check with your teacher that you used the correct school password and pupil PIN."
  element :heading, '.heading-xlarge',text: "Unable to confirm details"
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

end
