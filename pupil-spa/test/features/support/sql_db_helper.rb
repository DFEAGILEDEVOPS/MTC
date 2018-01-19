class SqlDbHelper

  # def self.pupil_details_using_names(firstname, lastname)
  #   sql = "SELECT * FROM [mtc_admin].[pupil] WHERE foreName='#{firstname}' AND lastName='#{lastname}'"
  #   result = SQL_CLIENT.execute(sql)
  #   pupil_details_res = result.first
  #   result.cancel
  #   pupil_details_res
  # end
  #
  # def self.find_pupil_from_school(first_name, school_id)
  #   sql = "SELECT * FROM [mtc_admin].[pupil] WHERE foreName='#{first_name}' AND school_id='#{school_id}'"
  #   result = SQL_CLIENT.execute(sql)
  #   pupil_details_res = result.first
  #   result.cancel
  #   pupil_details_res
  # end
  #
  # def self.find_teacher(name)
  #   @array_of_users = []
  #   sql = "SELECT * FROM [mtc_admin].[user] WHERE identifier='#{name}'"
  #   result = SQL_CLIENT.execute(sql)
  #   @array_of_users = result.each{|row| row.map}
  # end

  def self.find_school(school_id)
    sql = "SELECT * FROM [mtc_admin].[school] WHERE id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res
  end

  def self.find_pupil_via_pin(pin)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE pin='#{pin}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  # def self.find_school_by_dfeNumber(school_dfeNumber)
  #   sql = "SELECT * FROM [mtc_admin].[school] WHERE dfeNumber='#{school_dfeNumber}'"
  #   result = SQL_CLIENT.execute(sql)
  #   school_res = result.first
  #   result.cancel
  #   school_res
  # end
  #
  # def self.list_of_pupils_from_school(school_id)
  #   @array_of_pupils = []
  #   sql = "SELECT * FROM [mtc_admin].[pupil] WHERE school_id='#{school_id}'"
  #   result = SQL_CLIENT.execute(sql)
  #   @array_of_pupils = result.each{|row| row.map}
  # end

  def self.expire_pin(forename,lastname,school_id,flag=true)
    sql = "UPDATE [mtc_admin].[pupil] set pinExpiresAt=null WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.reset_pin(forename,lastname,school_id,flag=nil)
    sql = "UPDATE [mtc_admin].[pupil] set pin=null WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  # def self.set_pupil_pin(forename,lastname,school_id,newPin)
  #   sql = "UPDATE [mtc_admin].[pupil] set pin='#{newPin}' WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
  #   result = SQL_CLIENT.execute(sql)
  #   result.do
  # end
  #
  # def self.set_pupil_pin_expiry(forename,lastname,school_id,newTime)
  #   sql = "UPDATE [mtc_admin].[pupil] set pinExpiresAt='#{newTime}' WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
  #   result = SQL_CLIENT.execute(sql)
  #   result.do
  # end

  def self.set_school_pin_expiry(estab_code,newTime)
    sql = "UPDATE [mtc_admin].[school] set pinExpiresAt='#{newTime}' WHERE estabCode='#{estab_code}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  # def self.get_settings
  #   sql = "SELECT * FROM [mtc_admin].[settings]"
  #   result = SQL_CLIENT.execute(sql)
  #   settings_res = result.first
  #   result.cancel
  #   settings_res
  # end
  #
  # def self.latest_setting_log
  #   sql = "SELECT * FROM [mtc_admin].[settingsLog] ORDER BY createdAt DESC"
  #   result = SQL_CLIENT.execute(sql)
  #   settingsLog_res = result.first
  #   result.cancel
  #   settingsLog_res
  # end

  def self.get_completed_checks
    collection=CLIENT[:completedchecks].find({})
    result = []
    collection.each { |check| result << check }
    result
  end

  def self.get_pupil_check_metadata(check_code)
    # collection=CLIENT[:checks].find({'checkCode': check_code})
    # result = []
    # collection.find.each { |check| result << check }
    # result.first

    sql = "SELECT * FROM [mtc_admin].[check] WHERE checkCode = '#{check_code}'"
    result = SQL_CLIENT.execute(sql)
    chk_window_res = result.first
    result.cancel
    chk_window_res

  end

  def self.get_check_window(check_window_id)
    # collection=CLIENT[:checkwindows].find({'_id': BSON::ObjectId(check_window_id)})
    # result = []
    # collection.find.each { |window| result << window }
    # result.first

    sql = "SELECT * FROM [mtc_admin].[checkWindow] WHERE id = '#{check_window_id}'"
    result = SQL_CLIENT.execute(sql)
    chk_window_res = result.first
    result.cancel
    chk_window_res

  end

  def self.get_check_window_via_name(name)
    # collection=CLIENT[:checkwindows].find({'name': name})
    # result = []
    # collection.find.each { |window| result << window }
    # result.first

    sql = "SELECT * FROM [mtc_admin].[checkWindow] WHERE name = '#{name}'"
    result = SQL_CLIENT.execute(sql)
    chk_window_res = result.first
    result.cancel
    chk_window_res

  end

  def self.get_form(form_id)
    # collection=CLIENT[:checkforms].find({'_id': form_id})
    # result = []
    # collection.find.each { |form| result << form }
    # result.first

    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE id = '#{form_id}'"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res

  end

  def self.number_of_checks
    # collection = CLIENT[:checks]
    # collection.find.count

    sql = "SELECT * FROM [mtc_admin].[check]"
    result = SQL_CLIENT.execute(sql)
    chk_window_count = result.done
    chk_window_count
  end


  def self.check_windows
    check_window_result = []
    sql = "SELECT * FROM [mtc_admin].[checkWindow]"
    result = SQL_CLIENT.execute(sql)
    check_window_result = result.each{|row| row.map}
  end

end
