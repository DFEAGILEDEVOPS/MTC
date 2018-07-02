class AddEditCheckWindowPage < SitePrism::Page
  set_url '/choose-check-window{/add_or_edit}'

  element :check_name, '#checkWindowName'
  element :admin_start_day, '#adminStartDay'
  element :admin_start_month, '#adminStartMonth'
  element :admin_start_year, '#adminStartYear'
  element :check_start_day, '#checkStartDay'
  element :check_start_month, '#checkStartMonth'
  element :check_start_year, '#checkStartYear'
  element :check_end_day, '#checkEndDay'
  element :check_end_month, '#checkEndMonth'
  element :check_end_year, '#checkEndYear'
  element :save_changes, 'input[value="Save"]'
  element :back, 'a.button.button-secondary'
  elements :error_message, '.error-message'
  element :csrf, 'input[name="_csrf"]', visible: false

  section :error_summary, '.column-two-thirds .error-summary' do
    element :error_heading, 'h2', text: 'You need to fix the errors on this page before continuing.'
    element :error_text, 'p', text: 'See highlighted errors below'
  end

  def enter_details(hash)
    check_name.set hash.fetch(:check_name, '')
    admin_start_day.set hash.fetch(:admin_start_day, '')
    admin_start_month.set hash.fetch(:admin_start_mon, '')
    admin_start_year.set hash.fetch(:admin_start_year, '')
    check_start_day.set hash.fetch(:check_start_day, '')
    check_start_month.set hash.fetch(:check_start_mon, '')
    check_start_year.set hash.fetch(:check_start_year, '')
    check_end_day.set hash.fetch(:check_end_day, '')
    check_end_month.set hash.fetch(:check_end_mon, '')
    check_end_year.set hash.fetch(:check_end_year, '')
  end
end
