class CookiesBannerSection < SitePrism::Section

  element :heading, '.govuk-heading-m', text: 'Tell us whether you accept cookies'
  element :cookie_text, '.govuk-body'
  element :cookie_link, ".govuk-body a[href='/cookies-form']"
  element :accept_all, 'button', text: 'Accept all cookies'
  element :cookie_prefs, "a[href='/cookies-form']", text: 'Set cookie preferences'
end
