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
    # collection=CLIENT[:pupils].find({})
    # result = []
    # collection.each { |pupil| result << pupil }
    # result.select{|pupil| pupil['pin'] == nil}.first

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

  def self.reset_pin(forename,lastname,school_id,flag=nil)
    sql = "UPDATE [mtc_admin].[pupil] set pin=null WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
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

  # def self.get_completed_checks
  #   collection=CLIENT[:completedchecks].find({})
  #   result = []
  #   collection.each { |check| result << check }
  #   result
  # end

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

  def update_check_windows(id, column_name, endDate)
    sql = "UPDATE [mtc_admin].[checkWindow] set #{column_name}='#{endDate}' WHERE id='#{id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.get_feedback(check_id)
    # result = []
    # collection=CLIENT[:pupilfeedbacks].find({'sessionId': session_id})
    # collection.each {|a| result << a}
    # result.first

    sql = "SELECT * FROM [mtc_admin].[pupilFeedback] WHERE check_id = '#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res
  end

end
