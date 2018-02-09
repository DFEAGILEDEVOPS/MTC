class SqlDbHelper

  def self.pupil_details(upn)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE upn='#{upn}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.pupil_details_using_names(firstname, lastname)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE foreName=N'#{firstname}' AND lastName=N'#{lastname}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.find_pupil_from_school(first_name, school_id)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE foreName=N'#{first_name}' AND school_id='#{school_id}'"
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

  def self.find_school(school_id)
    sql = "SELECT * FROM [mtc_admin].[school] WHERE id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res
  end

  def self.find_school_by_dfeNumber(school_dfeNumber)
    sql = "SELECT * FROM [mtc_admin].[school] WHERE dfeNumber='#{school_dfeNumber}'"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res
  end

  def self.list_of_pupils_from_school(school_id)
    @array_of_pupils = []
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    @array_of_pupils = result.each {|row| row.map}
  end

  def self.pupil_pins
    sql = "SELECT * FROM [mtc_admin].[pupil] where pin IS NOT NULL"
    result = SQL_CLIENT.execute(sql)
    @array_of_pins = result.each{|row| row.map}
    result.cancel
    @array_of_pins.map {|row| row['pin']}
  end

  def self.reset_pin(forename,lastname,school_id,flag=nil)
    sql = "UPDATE [mtc_admin].[pupil] set pin=null WHERE foreName=N'#{forename.gsub("'", "''")}' AND lastName=N'#{lastname.gsub("'", "''")}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.reset_all_pins
    sql = "UPDATE [mtc_admin].[pupil] set pin=null"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.reset_all_pin_expiry_times
    sql = "UPDATE [mtc_admin].[pupil] set pinExpiresAt=null"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_all_checks
    sql = "DELETE FROM [mtc_admin].[check]"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_all_restarts
    sql = "DELETE FROM [mtc_admin].[pupilRestart]"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_pupil_pin(forename, lastname, school_id, newPin)
    sql = "UPDATE [mtc_admin].[pupil] set pin='#{newPin}' WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_pupil_pin_expiry(forename,lastname,school_id,new_time)
    sql = "UPDATE [mtc_admin].[pupil] set pinExpiresAt='#{new_time}' WHERE foreName=N'#{forename}' AND lastName=N'#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_school_pin_expiry(estab_code,new_time)
    sql = "UPDATE [mtc_admin].[school] set pinExpiresAt='#{new_time}' WHERE estabCode='#{estab_code}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.get_settings
    sql = "SELECT * FROM [mtc_admin].[settings]"
    result = SQL_CLIENT.execute(sql)
    settings_res = result.first
    result.cancel
    settings_res
  end

  def self.latest_setting_log
    sql = "SELECT * FROM [mtc_admin].[settingsLog] ORDER BY createdAt DESC"
    result = SQL_CLIENT.execute(sql)
    settingsLog_res = result.first
    result.cancel
    settingsLog_res
  end

  def self.check_window_details(check_name)
    sql = "SELECT * FROM [mtc_admin].[checkWindow] WHERE name = '#{check_name}'"
    result = SQL_CLIENT.execute(sql)
    chk_window_res = result.first
    result.cancel
    chk_window_res
  end

  def self.check_windows
    check_window_result = []
    sql = "SELECT * FROM [mtc_admin].[checkWindow]"
    result = SQL_CLIENT.execute(sql)
    check_window_result = result.each {|row| row.map}
  end

  def self.check_form_details(check_form_name)
    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE name = '#{check_form_name}'"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res
  end

  def self.check_details(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id = '#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    chk_res = result.first
    result.cancel
    chk_res
  end


  def self.get_attendance_codes
    @array_of_attCode = []
    sql = "SELECT * FROM [mtc_admin].[attendanceCode]"
    result = SQL_CLIENT.execute(sql)
    @array_of_attCode = result.each{|row| row.map}
    result.cancel
    @array_of_attCode
  end

  def self.get_attendance_code_for_a_pupil(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[pupilAttendance] WHERE pupil_id = '#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    pupil_att_code_res = result.first
    result.cancel
    pupil_att_code_res
  end

  def self.check_attendance_code(id)
    sql = "SELECT * FROM [mtc_admin].[attendanceCode] WHERE id = '#{id}'"
    result = SQL_CLIENT.execute(sql)
    chk_att_code_res = result.first
    result.cancel
    chk_att_code_res
  end

  def self.create_check(updatedime, createdTime, pupil_id, pupilLoginDate, checkStartedTime)
    sql = "INSERT INTO [mtc_admin].[check] (updatedAt, createdAt, pupil_id, checkWindow_id, checkForm_id, pupilLoginDate, startedAt) VALUES ('#{updatedime}', '#{createdTime}', #{pupil_id}, 1, 1, '#{pupilLoginDate}', '#{checkStartedTime}' )"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.find_group(group_name)
    sql = "SELECT * FROM [mtc_admin].[group] WHERE name = '#{group_name}'"
    result = SQL_CLIENT.execute(sql)
    row = result.first
    result.cancel
    row
  end

  def self.get_pupil_ids_from_group(group_name)
    group = find_group(group_name)
    group_id = group['id']
    @array_of_pupil_group = []
    sql = "SELECT * FROM [mtc_admin].[pupilGroup] WHERE group_id = #{group_id}"
    result = SQL_CLIENT.execute(sql)
    @array_of_pupil_group = result.each {|row| row.map}
    @array_of_pupil_group.map {|row| row['pupil_id']}
  end

  def self.pupils_assigned_to_group(pupil_ids_array)
    @array_of_pupils = []
    pupil_ids_array.each do |pupil_id|
      sql = "SELECT * FROM [mtc_admin].[pupil] WHERE id = #{pupil_id}"
      result = SQL_CLIENT.execute(sql)
      @array_of_pupils << result.first
      result.cancel
    end
    @array_of_pupils.map {|pupil| "#{pupil['lastName']}, #{pupil['foreName']}" }
  end

  def self.check_form_details_using_id(check_form_id)
    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE id = #{check_form_id}"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res
  end

end