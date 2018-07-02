class AddPupilPage < SitePrism::Page
  set_url '/pupil-register/pupil/add'

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
  element :add_pupil, 'input[value="Add pupil"]'
  element :back, 'a.button.button-secondary'
  element :csrf, 'input[name="_csrf"]', visible: false
  section :phase_banner, PhaseBanner, '.phase-banner'
  elements :error_messages, '.error-message'
  section :error_summary, ErrorSummary, '.column-two-thirds .error-summary'

  section :what_is_upn, "details[role='group']" do
    element :toggle, "summary .summary"
    element :explanatory_text, "div.panel-no-border", text: "The unique pupil number (UPN) is a 13-character code that identifies each pupil in the local authority maintained school system. If your pupil does not have a UPN please follow the guidance on how to generate UPNs (link opens in a new window)."
    element :more_details, "a[href='https://www.gov.uk/government/publications/unique-pupil-numbers']"
  end

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
