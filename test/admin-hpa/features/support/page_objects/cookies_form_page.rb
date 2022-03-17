class CookiesFormPage < SitePrism::Page
  set_url '/cookies-form'

  element :heading, '.govuk-heading-xl', text: 'Cookies on the multiplication tables check (MTC)'
  element :cookies_saved_text, 'p', text: 'Cookies are files saved on your phone, tablet or computer when you visit a website.'
  element :cookies_usage_text, 'p', text: 'We use cookies to store information about how you use the MTC service, such as the pages you visit.'
  element :settings_heading, '.govuk-heading-m', text: 'Cookie settings'
  element :website_use_heading, 'legend', text: 'Cookies that measure website use'
  element :necessary_cookies_heading, '.govuk-heading-m', text: 'Strictly necessary cookies'
  element :on, '#radio-51383d9f-0'
  element :off, '#radio-51383d9f-1'
  element :mtc_cookies_link, "a[href='/cookies-mtc']"
  element :save, '.govuk-button', text: 'Save changes'

end
