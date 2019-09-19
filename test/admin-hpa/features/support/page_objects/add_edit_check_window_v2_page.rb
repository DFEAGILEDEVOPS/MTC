class AddEditCheckWindowV2Page < SitePrism::Page
  set_url '/check-window/create-check-window'

  element :check_name, '#checkWindowName'

  elements :disabled_fields, '.disabled-check-window-field'

  element :admin_start_day, '#adminStartDay'
  element :admin_start_month, '#adminStartMonth'
  element :admin_start_year, '#adminStartYear'
  element :admin_end_day, '#adminEndDay'
  element :admin_end_month, '#adminEndMonth'
  element :admin_end_year, '#adminEndYear'

  element :familiarisation_check_start_day, '#familiarisationCheckStartDay'
  element :familiarisation_check_start_month, '#familiarisationCheckStartMonth'
  element :familiarisation_check_start_year, '#familiarisationCheckStartYear'
  element :familiarisation_check_end_day, '#familiarisationCheckEndDay'
  element :familiarisation_check_end_month, '#familiarisationCheckEndMonth'
  element :familiarisation_check_end_year, '#familiarisationCheckEndYear'

  element :live_check_start_day, '#liveCheckStartDay'
  element :live_check_start_month, '#liveCheckStartMonth'
  element :live_check_start_year, '#liveCheckStartYear'
  element :live_check_end_day, '#liveCheckEndDay'
  element :live_check_end_month, '#liveCheckEndMonth'
  element :live_check_end_year, '#liveCheckEndYear'

  element :save_changes, 'input[value="Save"]'
  element :cancel, 'a.govuk-button.govuk-button--secondary'
  elements :error_messages, '.govuk-error-message'
  element :csrf, 'input[name="_csrf"]', visible: false

  section :error_summary, "div.govuk-error-summary[data-module='govuk-error-summary']" do
    element :error_heading, 'h2', text: 'You need to fix the errors on this page before continuing.'
    element :error_text, 'p', text: 'See highlighted errors below.'
    elements :error_messages, '.govuk-list li'
  end

  def enter_details(hash)
    check_name.set hash.fetch(:check_name, '')
    admin_start_day.set hash.fetch(:admin_start_day, '')
    admin_start_month.set hash.fetch(:admin_start_month, '')
    admin_start_year.set hash.fetch(:admin_start_year, '')
    admin_end_day.set hash.fetch(:admin_end_day, '')
    admin_end_month.set hash.fetch(:admin_end_month, '')
    admin_end_year.set hash.fetch(:admin_end_year, '')
    familiarisation_check_start_day.set hash.fetch(:familiarisation_start_day, '')
    familiarisation_check_start_month.set hash.fetch(:familiarisation_start_month, '')
    familiarisation_check_start_year.set hash.fetch(:familiarisation_start_year, '')
    familiarisation_check_end_day.set hash.fetch(:familiarisation_end_day, '')
    familiarisation_check_end_month.set hash.fetch(:familiarisation_end_month, '')
    familiarisation_check_end_year.set hash.fetch(:familiarisation_end_year, '')
    live_check_start_day.set hash.fetch(:live_start_day, '')
    live_check_start_month.set hash.fetch(:live_start_month, '')
    live_check_start_year.set hash.fetch(:live_start_year, '')
    live_check_end_day.set hash.fetch(:live_end_day, '')
    live_check_end_month.set hash.fetch(:live_end_month, '')
    live_check_end_year.set hash.fetch(:live_end_year, '')
  end
end
