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
    sql = "SELECT * FROM [mtc_admin].[user] WHERE identifier='#{name}'"
    result = SQL_CLIENT.execute(sql)
    teacher_res = result.first
    result.cancel
    teacher_res
  end

  def self.reset_all_pin_expiry_times
    sql = "UPDATE [mtc_admin].[checkPin] set pinExpiresAt='2018-12-12 23:00:59.999 +00:00'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_pupil_pin_expiry(forename, lastname, school_id, new_time)
    sql = "UPDATE [mtc_admin].[pupil] set pinExpiresAt='#{new_time}' WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
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
    # sql = "SELECT * FROM [mtc_admin].[pupil] where pin IS NOT NULL"
    sql = "SELECT * FROM [mtc_admin].[Pin] where id in (SELECT pin_id FROM [mtc_admin].[checkPin])"
    result = SQL_CLIENT.execute(sql)
    @array_of_pins = result.each {|row| row.map}
    result.cancel
    @array_of_pins.map {|row| row['val']}
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

  def self.update_check_window_start_date_to_past(name)
    check_window = check_window_details(name)
    sql = "UPDATE [mtc_admin].[checkWindow] set checkStartDate='2018-05-21 00:00:00 +01:00' WHERE id=#{check_window['id']};"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.check_windows
    check_window_result = []
    sql = "SELECT * FROM [mtc_admin].[checkWindow]"
    result = SQL_CLIENT.execute(sql)
    check_window_result = result.each {|row| row.map}
  end

  def self.access_arrangements
    sql = "SELECT * FROM [mtc_admin].[accessArrangements]"
    result = SQL_CLIENT.execute(sql)
    access_arrangement_array = result.each {|row| row.map}
    result.cancel
    access_arrangement_array
  end

  def self.find_access_arrangements_by_id(id)
    sql = "SELECT * FROM [mtc_admin].[accessArrangements] where id='#{id}'"
    result = SQL_CLIENT.execute(sql)
    access_arrangement_array = result.each {|row| row.map}
    result.cancel
    access_arrangement_array
  end

  def self.get_access_arrangements_for_a_pupil(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[pupilAccessArrangements] WHERE pupil_id = '#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    access_arrangement_array = result.each {|row| row.map}
    result.cancel
    access_arrangement_array
  end

  def self.question_reader_reasons
    sql = "SELECT * FROM [mtc_admin].[questionReaderReasons]"
    result = SQL_CLIENT.execute(sql)
    question_reader_reason_array = result.each {|row| row.map}
    result.cancel
    question_reader_reason_array
  end


  def self.familiarisation_check_form
    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE isLiveCheckForm=0 AND isDeleted=0"
    result = SQL_CLIENT.execute(sql)
    array = result.each {|row| row.map}
    result.cancel
    array
  end

  def self.check_form_details(check_form_name)
    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE name = '#{check_form_name}'"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res
  end

  def self.check_details(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id = '#{pupil_id}' ORDER BY id DESC"
    result = SQL_CLIENT.execute(sql)
    chk_res = result.first
    result.cancel
    chk_res
  end

  def self.set_all_pupils_check_completed(school_id)
    sql = "UPDATE [mtc_admin].[pupil]
    SET pupilStatus_id = 5
    WHERE school_id = #{school_id}"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.set_all_pupils_check_started(school_id)
    sql = "UPDATE [mtc_admin].[pupil]
    SET pupilStatus_id = 4
    WHERE school_id = #{school_id}"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.set_all_pupils_attendance_reason(school_id, user_id, value)
    sql = "DELETE FROM [mtc_admin].pupilAttendance
    WHERE pupil_id IN (SELECT id from [mtc_admin].pupil WHERE school_id = #{school_id});
    DECLARE @attendanceCode_id int
    SET @attendanceCode_id = (SELECT TOP (1) id FROM [mtc_admin].attendanceCode WHERE reason = '#{value}')
    INSERT INTO [mtc_admin].pupilAttendance (recordedBy_user_id, attendanceCode_id, pupil_id, isDeleted)
    SELECT #{user_id}, @attendanceCode_id, id, 0 FROM [mtc_admin].pupil
    WHERE school_id = #{school_id}"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.get_attendance_codes
    @array_of_attCode = []
    sql = "SELECT * FROM [mtc_admin].[attendanceCode]"
    result = SQL_CLIENT.execute(sql)
    @array_of_attCode = result.each {|row| row.map}
    result.cancel
    @array_of_attCode
  end

  def self.get_attendance_code_for_a_pupil(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[pupilAttendance] WHERE pupil_id = '#{pupil_id}' and isDeleted = 'false'"
    result = SQL_CLIENT.execute(sql)
    pupil_att_code_res = result.first
    result.cancel
    pupil_att_code_res
  end

  def self.set_attendance_code_for_a_pupil(pupil_id)
    sql = "INSERT INTO [mtc_admin].[pupilAttendance] (recordedBy_user_id, attendanceCode_id, pupil_id) VALUES (1, 1, #{pupil_id})"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.check_attendance_code(id)
    sql = "SELECT * FROM [mtc_admin].[attendanceCode] WHERE id = '#{id}'"
    result = SQL_CLIENT.execute(sql)
    chk_att_code_res = result.first
    result.cancel
    chk_att_code_res
  end

  def self.create_check(updatedime, createdTime, pupil_id, pupilLoginDate, checkStartedTime)
    sql = "INSERT INTO [mtc_admin].[check] (updatedAt, createdAt, pupil_id, checkWindow_id, checkForm_id, pupilLoginDate, startedAt, isLiveCheck) VALUES ('#{updatedime}', '#{createdTime}', #{pupil_id}, 1, 1, '#{pupilLoginDate}', '#{checkStartedTime}', '#{true}' )"
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
    @array_of_pupils.map {|pupil| "#{pupil['lastName']}, #{pupil['foreName']}"}
  end

  def self.check_form_details_using_id(check_form_id)
    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE id = #{check_form_id}"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res
  end

  def self.activate_or_deactivate_active_check_window(check_end_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set adminEndDate = '#{check_end_date}' WHERE id NOT IN (2)"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.deactivate_all_test_check_window()
    sql = "UPDATE [mtc_admin].[checkWindow] set isDeleted = 1 WHERE id NOT IN (1,2)"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.get_jobs
    sql = "SELECT * FROM [mtc_admin].[job]"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.get_pupil_pin(check_id)
    sql = "SELECT * FROM [mtc_admin].[Pin] where id in (SELECT pin_id FROM [mtc_admin].[checkPin] WHERE check_id='#{check_id}')"
    result = SQL_CLIENT.execute(sql)
    pupil_pin_res = result.first
    result.cancel
    pupil_pin_res
  end

  def self.delete_all_from_pupil_group
    sql = "DELETE FROM [mtc_admin].[pupilGroup]"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_all_from_group
    sql = "DELETE FROM [mtc_admin].[group]"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_forms
    sql = "DELETE FROM [mtc_admin].[checkForm] where name like 'test-check-form%'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_assigned_forms
    sql = "DELETE FROM [mtc_admin].[checkFormWindow] where id <> 1"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_pupils_not_taking_check
    sql = "DELETE FROM [mtc_admin].[pupilAttendance]"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_pupil_status(reset_from, reset_to)
      sql = "UPDATE [mtc_admin].[pupil] set pupilStatus_id=#{reset_to} WHERE pupilStatus_id=#{reset_from}"
      result = SQL_CLIENT.execute(sql)
      result.do
  end

  def self.set_pupil_status_via_id(status_id, pupil_id)
      sql = "UPDATE [mtc_admin].[pupil] set pupilStatus_id=#{status_id} WHERE id=#{pupil_id}"
      result = SQL_CLIENT.execute(sql)
      result.do
  end

  def self.get_pupil_with_no_attandance_code(school_id)
    sql = "select * from [mtc_admin].[pupil] where school_id='#{school_id}' and pupilStatus_id NOT IN (6)"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res
  end

  def self.get_default_assigned_fam_form
    sql = "select * from [mtc_admin].[checkFormWindow] where checkForm_id=4 and checkWindow_id=1"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res
  end

  def self.assign_fam_form_to_window
    sql = "INSERT INTO [mtc_admin].[checkFormWindow] (checkForm_id, checkWindow_id, createdAt) VALUES (4, 1, '2019-01-29 14:32:56.61 +00:00')"
    result = SQL_CLIENT.execute(sql)
    result.insert
   end

  def self.delete_from_hdf(school_id)
    sql = "DELETE from [mtc_admin].[hdf] where school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_hdf_form_confirmed_status(school_id, confirmed)
    sql = "UPDATE [mtc_admin].[hdf] SET confirmed='#{confirmed}' WHERE school_id='#{school_id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.add_fam_form
    sql = "UPDATE [mtc_admin].[checkForm] set isDeleted = 0 WHERE name='MTC0103'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.pupil_reason(pupil_id)
    sql = "select * from [mtc_admin].[pupilAgeReason] where pupil_id=#{pupil_id}"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res
  end


  def self.get_mod_schools
    sql = "SELECT * FROM [mtc_admin].[school] WHERE leaCode='702'"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.count_schools
    sql = "SELECT COUNT(*) FROM mtc_admin.school"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res.values.first
  end

  def self.set_check_status(status_id,check_id)
    sql = "UPDATE [mtc_admin].[check] set checkStatus_id=#{status_id} WHERE id=#{check_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.update_to_25_questions
    p 'UPDATING TO 25 QUESTIONS'
    sql = "UPDATE [mtc_admin].[checkForm] set formData='[{\"f1\":1,\"f2\":1},{\"f1\":1,\"f2\":2},{\"f1\":1,\"f2\":3},{\"f1\":1,\"f2\":4},{\"f1\":1,\"f2\":5},{\"f1\":1,\"f2\":6},{\"f1\":1,\"f2\":7},{\"f1\":1,\"f2\":8},{\"f1\":1,\"f2\":9},{\"f1\":12,\"f2\":12},{\"f1\":1,\"f2\":1},{\"f1\":1,\"f2\":2},{\"f1\":1,\"f2\":3},{\"f1\":1,\"f2\":4},{\"f1\":1,\"f2\":5},{\"f1\":1,\"f2\":6},{\"f1\":1,\"f2\":7},{\"f1\":1,\"f2\":8},{\"f1\":1,\"f2\":9},{\"f1\":12,\"f2\":12},{\"f1\":1,\"f2\":2},{\"f1\":1,\"f2\":3},{\"f1\":1,\"f2\":4},{\"f1\":1,\"f2\":5},{\"f1\":2,\"f2\":5}]' WHERE name IN ('MTC0103', 'MTC0100')"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.update_to_10_questions
    p "UPDATING TO 10 QUESTIONS"
    sql = "UPDATE [mtc_admin].[checkForm] set formData='[{\"f1\" : 2,\"f2\" : 5},{\"f1\" : 11,\"f2\" : 2},{\"f1\" : 5,\"f2\" : 10},{\"f1\" : 4,\"f2\" : 4},{\"f1\" : 3,\"f2\" : 9},{\"f1\" : 2,\"f2\" : 4},{\"f1\" : 3,\"f2\" : 3},{\"f1\" : 4,\"f2\" : 9},{\"f1\" : 6,\"f2\" : 5},{\"f1\" : 12,\"f2\" : 12}]' WHERE name IN ('MTC0103', 'MTC0100')"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

end
