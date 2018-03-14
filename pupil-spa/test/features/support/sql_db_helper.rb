class SqlDbHelper

  def self.find_school(school_id)
    sql = "SELECT * FROM [mtc_admin].[school] WHERE id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res
  end

  def self.get_list_of_schools
    sql = "SELECT * FROM [mtc_admin].[school]"
    result = SQL_CLIENT.execute(sql)
    @array_of_schools = result.each{|row| row.map}
    result.cancel
    @array_of_schools
  end

  def self.find_pupil_via_pin(pin)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE pin='#{pin}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.find_next_pupil
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE pin is Null"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.find_pupil_from_school(first_name, school_id)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE foreName='#{first_name}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end


  def self.expire_pin(forename,lastname,school_id,flag=true)
    sql = "UPDATE [mtc_admin].[pupil] set pinExpiresAt=null WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.reset_pin(forename,lastname,school_id,new_time,flag=nil)
    sql = "UPDATE [mtc_admin].[pupil] set pin=#{flag}, pinExpiresAt= '#{new_time}' WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_pupil_pin_expiry(forename,lastname,school_id,new_time)
    sql = "UPDATE [mtc_admin].[pupil] set pinExpiresAt='#{new_time}' WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end


  def self.set_school_pin_expiry(estab_code,newTime)
    sql = "UPDATE [mtc_admin].[school] set pinExpiresAt='#{newTime}' WHERE estabCode='#{estab_code}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_school_pin(school_id, new_time, school_pin)
  sql = "UPDATE [mtc_admin].[school] set pin='#{school_pin}', pinExpiresAt='#{new_time}' WHERE id='#{school_id}'"
  result = SQL_CLIENT.execute(sql)
  result.do
  end

  def self.get_pupil_check_metadata(check_code)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE checkCode = '#{check_code}'"
    result = SQL_CLIENT.execute(sql)
    chk_window_res = result.first
    result.cancel
    chk_window_res

  end

  def self.get_check_window(check_window_id)
    sql = "SELECT * FROM [mtc_admin].[checkWindow] WHERE id = '#{check_window_id}'"
    result = SQL_CLIENT.execute(sql)
    chk_window_res = result.first
    result.cancel
    chk_window_res

  end

  def self.get_check_window_via_name(name)
    sql = "SELECT * FROM [mtc_admin].[checkWindow] WHERE name = '#{name}'"
    result = SQL_CLIENT.execute(sql)
    chk_window_res = result.first
    result.cancel
    chk_window_res

  end

  def self.get_form(form_id)
    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE id = '#{form_id}'"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res

  end

  def self.number_of_checks
    sql = "SELECT * FROM [mtc_admin].[check]"
    result = SQL_CLIENT.execute(sql)
    chk_window_count = result.do
    chk_window_count
  end


  def self.check_windows
    check_window_result = []
    sql = "SELECT * FROM [mtc_admin].[checkWindow]"
    result = SQL_CLIENT.execute(sql)
    check_window_result = result.each{|row| row.map}
    result.cancel
    check_window_result
  end

  def self.update_check_window(id, column_name, new_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set #{column_name}='#{new_date}' WHERE id='#{id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.get_feedback(check_id)
    sql = "SELECT * FROM [mtc_admin].[pupilFeedback] WHERE check_id = '#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res
  end

  def self.create_check(updatedime, createdTime, pupil_id)
    sql = "INSERT INTO [mtc_admin].[check] (updatedAt, createdAt, pupil_id, checkWindow_id, checkForm_id) VALUES ('#{updatedime}', '#{createdTime}', #{pupil_id}, 1, 1)"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.activate_or_deactivate_active_check_window(check_end_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set checkEndDate = '#{check_end_date}' WHERE id NOT IN (2)"
    result = SQL_CLIENT.execute(sql)
    result.do
  end


end
