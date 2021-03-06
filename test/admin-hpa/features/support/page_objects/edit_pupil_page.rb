class EditPupilPage < SitePrism::Page
  set_url '/school/pupil/edit/{id}'

  element :heading, '.heading-xlarge'
  element :message, '.heading-medium'
  element :first_name, 'input[name="foreName"]'
  element :middle_name, 'input[name="middleNames"]'
  element :last_name, 'input[name="lastName"]'
  element :first_name_alias, 'input[name="foreNameAlias"]'
  element :last_name_alias, 'input[name="lastNameAlias"]'
  element :upn, 'input[name="upn"]'
  element :day, '#dob-day'
  element :month, '#dob-month'
  element :year, '#dob-year'
  element :female, '#gender-female'
  element :male, '#gender-male'
  element :save_changes, '.govuk-button', text: 'Save'
  element :back, '.govuk-button', text: 'Cancel'
  section :phase_banner, PhaseBanner, '.govuk-phase-banner'
  section :error_summary, ErrorSummary, "div[data-module='govuk-error-summary']"
  elements :error_messages, '.govuk-error-message'
  section :reason, ReasonSection, ".show-age-content"

  def enter_details(hash)
    p hash.fetch(:upn, '')
    first_name.set hash.fetch(:first_name, '')
    middle_name.set hash.fetch(:middle_name, '')
    last_name.set hash.fetch(:last_name, '')
    first_name_alias.set hash.fetch(:first_name_alias, '')
    last_name_alias.set hash.fetch(:last_name_alias, '')
    upn.set hash.fetch(:upn, '')
    day.set hash.fetch(:day, '')
    month.set hash.fetch(:month, '')
    year.set hash.fetch(:year, '')
    female.click if hash.fetch(:female, nil)
    male.click if hash.fetch(:male, nil)
  end
end
