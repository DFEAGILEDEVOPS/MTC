class SignInPage < SitePrism::Page
  set_url '/sign-in'

  element :heading, '.govuk-heading-xl', text: 'Check Development Service'
  element :instructions, 'p.govuk-body', text: 'Sign-in to access the Check Development Service'
  element :username_field, '#username'
  element :password_field, '#password'
  element :sign_in, 'button[type="submit"]', text: 'Sign in'
  element :contact, "a[href='/contact']"
  element :cookies, "#govuk-footer a[href='/cookies-form']"
  section :phase_banner, PhaseBanner, '.govuk-phase-banner'
  section :cookies_banner, CookiesBannerSection, '#global-cookie-message'

  def enter_credentials(username, password)
    username_field.set username
    password_field.set password
  end

  def login(username,password)
    enter_credentials(username,password)
    sign_in.click
  end

end
