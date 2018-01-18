class SqlDbHelper

  def self.pupil_details(upn)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE upn='#{upn}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.pupil_details_using_names(firstname, lastname)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE foreName='#{firstname}' AND lastName='#{lastname}'"
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

  def self.find_teacher(name)
    @array_of_users = []
    sql = "SELECT * FROM [mtc_admin].[user] WHERE identifier='#{name}'"
    result = SQL_CLIENT.execute(sql)
    @array_of_users = result.each{|row| row.map}
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
    @array_of_pupils = result.each{|row| row.map}
  end

  def self.reset_pin(forename,lastname,school_id,flag=nil)
    sql = "UPDATE [mtc_admin].[pupil] set pin=null WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_pupil_pin(forename,lastname,school_id,newPin)
    sql = "UPDATE [mtc_admin].[pupil] set pin='#{newPin}' WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_pupil_pin_expiry(forename,lastname,school_id,newTime)
    sql = "UPDATE [mtc_admin].[pupil] set pinExpiresAt='#{newTime}' WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_school_pin_expiry(estab_code,newTime)
    sql = "UPDATE [mtc_admin].[school] set pinExpiresAt='#{newTime}' WHERE estabCode='#{estab_code}'"
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
    check_window_result = result.each{|row| row.map}
  end

  def self.check_form_details(check_form_name)
    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE name = '#{check_form_name}'"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res
  end

  def self.get_attendance_codes
    sql = "SELECT * FROM [mtc_admin].[attendanceCode]"
    result = SQL_CLIENT.execute(sql)
    array_of_result = result.each{|row| row.map}
    result.cancel
    hash = {}
    array_of_result.map{|a| hash.merge!(a['code'] => a['reason'])}
    hash
  end

  # def self.check_attendance_code(id)
  #   result = []
  #   collection=CLIENT[:attendancecodes].find({'_id': BSON::ObjectId(id)})
  #   collection.each {|a| result << a}
  #   result.first
  # end


  def self.create_check(updatedime, createdTime, pupil_id, pupilLoginDate, checkStartedTime)
    sql = "INSERT INTO [mtc_admin].[check] (updatedAt, createdAt, pupilId, checkCode, checkWindowId, checkFormId, pupilLoginDate, checkStartedAt) VALUES ('#{updatedime}', '#{createdTime}', '#{pupil_id}', '40e5356c-#{rand(1000)}-#{rand(1000)}-a46e-b100d346a9e6', '#{check_window_id}', '100', '#{pupilLoginDate}', '#{checkStartedTime}' )"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end
end