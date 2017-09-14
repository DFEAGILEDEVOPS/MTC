class EditPupilPage < SitePrism::Page
  set_url '/school/pupil/edit/{id}'

  element :heading, '.heading-xlarge'
  element :message, '.heading-medium'
  element :first_name, 'input[name="foreName"]'
  element :middle_name, 'input[name="middleNames"]'
  element :last_name, 'input[name="lastName"]'
  element :upn, 'input[name="upn"]'
  element :day, '#dob-day'
  element :month, '#dob-month'
  element :year, '#dob-year'
  element :female, '#gender-female'
  element :male, '#gender-male'
  element :save_changes, 'input[value="Save"]'
  element :back, 'a.button.button-secondary'
  section :phase_banner, PhaseBanner, '.phase-banner'
  section :error_summary, ErrorSummary, '.error-summary'
  elements :error_messages, '.error-message'

  def enter_details(hash)
    first_name.set hash.fetch(:first_name, '')
    middle_name.set hash.fetch(:middle_name, '')
    last_name.set hash.fetch(:last_name, '')
    upn.set hash.fetch(:upn, '')
    day.set hash.fetch(:day, '')
    month.set hash.fetch(:month, '')
    year.set hash.fetch(:year, '')
    female.click if hash.fetch(:female, nil)
    male.click if hash.fetch(:male, nil)
  end
end
