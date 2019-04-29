class SqlDbHelper

  def self.connect(admin_user,admin_password,server,port,database,azure_var)
    begin
      TinyTds::Client.new(username: admin_user,
                          password: admin_password,
                          host: server,
                          port: port,
                          database: database,
                          azure: azure_var
      )
    rescue TinyTds::Error => e
      abort 'Test run failed due to - ' + e.to_s
    end
  end

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

  def self.get_pupil_pin(pupil_id, school_id)
    check_query = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id='#{pupil_id}'"
    result = SQL_CLIENT.execute(check_query)
    check_row = result.first
    result.cancel
    checkpin_query = "SELECT * FROM [mtc_admin].[checkPin] WHERE check_id='#{check_row['id']}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(checkpin_query)
    checkpin_query = result.first
    result.cancel
    pin_query = "SELECT * FROM [mtc_admin].[pin] WHERE id='#{checkpin_query['pin_id']}'"
    result = SQL_CLIENT.execute(pin_query)
    pin_query = result.first
    result.cancel
    pin_query
  end

  def self.find_pupil_via_pin(pin)
    pin_query = "SELECT id FROM [mtc_admin].[pin] WHERE val='#{pin}'"
    result = SQL_CLIENT.execute(pin_query)
    pin_id = result.first
    result.cancel
    check_pin_query = "SELECT check_id FROM [mtc_admin].[checkPin] WHERE pin_id='#{pin_id.values.first}'"
    result = SQL_CLIENT.execute(check_pin_query)
    check_id = result.first
    result.cancel
    check_query = "SELECT pupil_id FROM [mtc_admin].[check] WHERE id = '#{check_id.values.first}'"
    result = SQL_CLIENT.execute(check_query)
    pupil_id = result.first
    result.cancel
    pupil_query = "SELECT * FROM [mtc_admin].[pupil] WHERE id='#{pupil_id.values.first}'"
    result = SQL_CLIENT.execute(pupil_query)
    pupil_details = result.first
    result.cancel
    pupil_details
  end

  def self.find_next_pupil
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE pin is Null"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.find_teacher(name)
    sql = "SELECT * FROM [mtc_admin].[user] WHERE identifier='#{name}'"
    result = SQL_CLIENT.execute(sql)
    teacher_res = result.first
    result.cancel
    teacher_res
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

  def self.create_check(updatedime, createdTime, pupil_id, is_live_check=true)
    sql = "INSERT INTO [mtc_admin].[check] (updatedAt, createdAt, pupil_id, checkWindow_id, checkForm_id, isLiveCheck) VALUES ('#{updatedime}', '#{createdTime}', #{pupil_id}, 1, 1, '#{is_live_check}' )"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.activate_or_deactivate_active_check_window(check_end_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set checkEndDate = '#{check_end_date}' WHERE id NOT IN (2)"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.get_check_data(check_code)
    sql = "SELECT data FROM [mtc_admin].[check] WHERE checkCode='#{check_code}'"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end

  def self.get_pupil_check_form_allocation(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[checkFormAllocation] WHERE pupil_Id='#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end

  def self.get_settings
    sql = "SELECT * FROM [mtc_admin].[settings]"
    result = SQL_CLIENT.execute(sql)
    settings_res = result.first
    result.cancel
    settings_res
  end

  def self.set_pupil_access_arrangement(pupil_id, created_time, updated_time, access_arrangments_id)
    if (access_arrangments_id.eql?(4))
      sql = "INSERT INTO [mtc_admin].[pupilAccessArrangements] (pupil_id, createdAt, updatedAt, recordedBy_user_id, inputAssistanceInformation, accessArrangements_id) VALUES ( #{pupil_id}, '#{created_time}', '#{updated_time}', 4, 'This is Test', '#{access_arrangments_id}' )"
    else
      sql = "INSERT INTO [mtc_admin].[pupilAccessArrangements] (pupil_id, createdAt, updatedAt, recordedBy_user_id, accessArrangements_id) VALUES ( #{pupil_id}, '#{created_time}', '#{updated_time}', 4, '#{access_arrangments_id}' )"
    end
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.get_check(check_code)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE checkCode='#{check_code}'"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end


  def self.get_check_using_pupil(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id='#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end

  def self.get_check_result(check_id)
    sql = "SELECT * FROM [mtc_admin].[checkResult] WHERE check_id='#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end

  def self.get_check_result_id
    sql = "SELECT id FROM [mtc_admin].[checkResult]"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end

  def self.pupil_details(upn)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE upn='#{upn}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end


end
