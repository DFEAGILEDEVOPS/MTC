class AddPupilPage < SitePrism::Page
  set_url '/school/pupil/add'

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
  section :phase_banner, PhaseBanner, '.phase-banner'

  section :what_is_upn, "details[role='group']" do
    element :toggle, "summary .summary"
    element :explanatory_text, "div.panel-no-border", text: "The unique pupil number (UPN) is a 13-character code that identifies each pupil in the local-authority-maintained school system. If your pupil does not have a UPN there is more detail on how to generate UPNs."
    element :more_details, "a[href='https://www.gov.uk/government/publications/unique-pupil-numbers']"
  end

  section :errors, '.error-summary' do
    element :heading, '.error-summary-heading'
    element :dob_required, 'a[href="#dob-year"]'
    element :gender_required, 'a[href="#gender"]'
    element :first_name_required, 'a[href="#foreName"]'
    element :middle_name_required, 'a[href="#middleNames"]'
    element :last_name_required, 'a[href="#lastName"]'
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
