class ErrorSummary < SitePrism::Section

  element :heading, '.error-summary-heading'
  element :day, 'a[href="#dob-day"]'
  element :month, 'a[href="#dob-month"]'
  element :year, 'a[href="#dob-year"]'
  element :gender, 'a[href="#gender"]'
  element :first_name, 'a[href="#foreName"]'
  element :middle_name, 'a[href="#middleNames"]'
  element :last_name, 'a[href="#lastName"]'
  element :upn, 'a[href="#upn"]'

end