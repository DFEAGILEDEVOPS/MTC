class AddEditCheckWindowPage < SitePrism::Page

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
