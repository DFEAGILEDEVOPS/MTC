class ErrorSummary < SitePrism::Section

  element :heading, '.error-summary-heading'
  element :day, 'a[href="#dob-day"]'
  element :reason, 'a[href="#ageReason"]'
  element :month, 'a[href="#dob-month"]'
  element :year, 'a[href="#dob-year"]'
  element :gender, 'a[href="#gender"]'
  element :first_name, 'a[href="#foreName"]'
  element :hdf_first_name, 'a[href="#firstName"]'
  element :hdf_confirm, 'a[href="#confirmBoxes"]'
  element :middle_name, 'a[href="#middleNames"]'
  element :last_name, 'a[href="#lastName"]'
  element :first_name_alias, 'a[href="#foreNameAlias"]'
  element :last_name_alias, 'a[href="#lastNameAlias"]'
  elements :upn, 'a[href="#upn"]'
  element :job_title, 'a[href="#jobTitle"]'

end
