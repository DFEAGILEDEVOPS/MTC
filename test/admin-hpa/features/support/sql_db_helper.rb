class SqlDbHelper

  def self.connect(admin_user, admin_password, server, port, database, azure_var)
    begin
      TinyTds::Client.new(username: admin_user,
                          password: admin_password,
                          host: server,
                          port: port,
                          database: database,
                          azure: azure_var,
                          timeout: 120
      )
    rescue TinyTds::Error => e
      abort "Test run failed due to - #{e.to_s}; SQL details: username=#{admin_user}, password=#{admin_password}, host=#{server}, port=#{port}, database=#{database}, azure=#{azure_var}"
    end
  end

  def self.pupil_details_using_names(firstname, lastname, school_id)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE foreName='#{firstname}' AND lastName='#{lastname}' AND school_id=#{school_id}"
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

  def self.list_all_schools
    sql = "SELECT * FROM [mtc_admin].[school]"
    result = SQL_CLIENT.execute(sql)
    @array_of_schools = result.each {|row| row.map}
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

  def self.find_school_by_urn(urn)
    sql = "SELECT * FROM [mtc_admin].[school] WHERE urn='#{urn}'"
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

  def self.get_settings
    sql = "SELECT * FROM [mtc_admin].[settings]"
    result = SQL_CLIENT.execute(sql)
    settings_res = result.first
    result.cancel
    settings_res
  end

  def self.set_check_time_limit(minutes)
    sql = "UPDATE [mtc_admin].[settings] set checkTimeLimit=#{minutes}"
    result = SQL_CLIENT.execute(sql)
    result.do
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

  def self.update_check_window(id, column_name, new_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set #{column_name}='#{new_date}' WHERE id='#{id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
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

  def self.get_attendance_codes
    @array_of_attCode = []
    sql = "SELECT * FROM [mtc_admin].[attendanceCode] where visible=1"
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

  def self.set_attendance_code_for_a_pupil(pupil_id,attendance_code=nil)
    attendance_code.nil? ? 1 : attendance_code
    sql = "INSERT INTO [mtc_admin].[pupilAttendance] (recordedBy_user_id, attendanceCode_id, pupil_id) VALUES (1, #{attendance_code}, #{pupil_id})"
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
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE group_id = #{group_id}"
    result = SQL_CLIENT.execute(sql)
    @array_of_pupil_group = result.each {|row| row.map}
    @array_of_pupil_group.map {|row| row['id']}
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

  # requires review
  def self.update_check_end_date(check_end_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set familiarisationCheckEndDate = '#{check_end_date}', checkEndDate = '#{check_end_date}' WHERE id IN (1)"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  # requires review
  def self.update_admin_end_date(check_end_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set adminEndDate = '#{check_end_date}' WHERE id IN (1)"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  # requires review
  def self.activate_or_deactivate_active_check_window(check_end_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set adminEndDate = '#{check_end_date}' WHERE id NOT IN (2)"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  # requires review
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

  def self.get_check_pin(check_id)
    sql = "SELECT * FROM [mtc_admin].[checkPin] WHERE check_id='#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    pupil_pin_res = result.first
    result.cancel
    pupil_pin_res
  end

  def self.remove_all_pupil_from_group(school_id)
    p "removing all pupils from group. school_id:#{school_id}"
    sql = "UPDATE [mtc_admin].[pupil] SET group_id=NULL WHERE school_id=#{school_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_all_school_groups(school_id)
    sql = "DELETE FROM [mtc_admin].[group] WHERE school_id=#{school_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  # requires review
  def self.delete_forms
    sql = "DELETE FROM [mtc_admin].[checkForm] where name like 'test-check-form%'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  # requires review
  def self.delete_assigned_forms
    sql = "DELETE FROM [mtc_admin].[checkFormWindow] where id <> 1"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_pupils_not_taking_check(school_id)
    sql = "DELETE pa FROM [mtc_admin].[pupilAttendance] pa
            INNER JOIN [mtc_admin].[pupil] p ON pa.pupil_id = p.id
            WHERE p.school_id =#{school_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
  end


  def self.set_pupil_attendance_via_school(school_id, code)
    sql = "UPDATE [mtc_admin].[pupil] set attendanceId=#{code} WHERE school_id=#{school_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
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

  def self.delete_schools_audit_history
    sql = "DELETE from [mtc_admin].[schoolAudit] where newData like '%Mo School%'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.delete_schools_imported
    sql = "DELETE from [mtc_admin].[school] where name like '%Mo School%'"
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

  # requires review
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

  def self.get_all_checks_from_school(school_id)
    sql = "SELECT * FROM [mtc_admin].[check] where pupil_id IN (Select id from mtc_admin.pupil where school_id=#{school_id})"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.count_all_restarts
    sql = "SELECT COUNT(*) FROM [mtc_admin].[pupilRestart]"
    result = SQL_CLIENT.execute(sql)
    count = result.first
    result.cancel
    count.values.first
  end

  def self.find_pupil_restart(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[pupilRestart] where pupil_id=#{pupil_id}"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.create_group(group_name, school_id)
    sql = "INSERT INTO [mtc_admin].[group] (name, createdAt, updatedAt, school_id) VALUES ('#{group_name}','2019-06-25 17:46:39.557', '2019-06-25 17:46:39.557', #{school_id})"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.add_pupil_to_group(group_id, pupil_id)
    sql = "UPDATE [mtc_admin].[pupil] set group_id = #{group_id} where id = #{pupil_id}"
    result = SQL_CLIENT.execute(sql)
    result.insert
  end

  def self.update_to_25_questions
    p 'UPDATING TO 25 QUESTIONS'
    sql = "UPDATE [mtc_admin].[checkForm] set formData='[{\"f1\":1,\"f2\":1},{\"f1\":1,\"f2\":2},{\"f1\":1,\"f2\":3},{\"f1\":1,\"f2\":4},{\"f1\":1,\"f2\":5},{\"f1\":1,\"f2\":6},{\"f1\":1,\"f2\":7},{\"f1\":1,\"f2\":8},{\"f1\":1,\"f2\":9},{\"f1\":1,\"f2\":10},{\"f1\":1,\"f2\":11},{\"f1\":1,\"f2\":12},{\"f1\":2,\"f2\":1},{\"f1\":2,\"f2\":2},{\"f1\":2,\"f2\":3},{\"f1\":2,\"f2\":4},{\"f1\":2,\"f2\":5},{\"f1\":2,\"f2\":6},{\"f1\":2,\"f2\":7},{\"f1\":2,\"f2\":8},{\"f1\":2,\"f2\":9},{\"f1\":2,\"f2\":10},{\"f1\":2,\"f2\":11},{\"f1\":2,\"f2\":12},{\"f1\":3,\"f2\":1}]' WHERE name IN ('MTC0103', 'MTC0100')"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.update_to_10_questions
    p "UPDATING TO 10 QUESTIONS"
    sql = "UPDATE [mtc_admin].[checkForm] set formData='[{\"f1\" : 2,\"f2\" : 5},{\"f1\" : 11,\"f2\" : 2},{\"f1\" : 5,\"f2\" : 10},{\"f1\" : 4,\"f2\" : 4},{\"f1\" : 3,\"f2\" : 9},{\"f1\" : 2,\"f2\" : 4},{\"f1\" : 3,\"f2\" : 3},{\"f1\" : 4,\"f2\" : 9},{\"f1\" : 6,\"f2\" : 5},{\"f1\" : 12,\"f2\" : 12}]' WHERE name IN ('MTC0103', 'MTC0100')"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.get_service_message(title)
    sql = "SELECT * FROM [mtc_admin].[serviceMessage] WHERE title = '#{title}'"
    result = SQL_CLIENT.execute(sql)
    res = result.first
    result.cancel
    res
  end

  def self.check_details(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id = '#{pupil_id}' ORDER BY id DESC"
    result = SQL_CLIENT.execute(sql)
    chk_res = result.first
    result.cancel
    chk_res
  end

  def self.pupil_details(upn, school_id)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE upn='#{upn}' AND school_id=#{school_id}"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.live_checks_created_at(date, school_id)
    sql = "SELECT * from mtc_admin.[check] c INNER JOIN [mtc_admin].pupil p ON (p.currentCheckId = c.id) where CONVERT(DATE, c.createdAt)='#{date}' AND p.school_id =#{school_id} AND c.isLiveCheck = 1"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.count_live_logins_per_date(date, school_id)
    sql = "SELECT COUNT(*) from mtc_admin.[check] c INNER JOIN [mtc_admin].pupil p ON (p.currentCheckId = c.id) where CONVERT(DATE, c.createdAt)='#{date}' AND p.school_id =#{school_id} AND c.isLiveCheck = 1 and c.pupilLoginDate is not null"
    result = SQL_CLIENT.execute(sql)
    count = result.first
    result.cancel
    count.values.first
  end

  def self.tio_checks_created_at(date, school_id)
    sql = "SELECT * from mtc_admin.[check] c INNER JOIN [mtc_admin].pupil p ON (p.id = c.pupil_id) where CONVERT(DATE, c.createdAt)='#{date}' AND p.school_id =#{school_id} AND c.isLiveCheck = 0"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.count_tio_logins_per_date(date, school_id)
    sql = "SELECT COUNT(*) from mtc_admin.[check] c INNER JOIN [mtc_admin].pupil p ON (p.id = c.pupil_id) where CONVERT(DATE, c.createdAt)='#{date}' AND p.school_id =#{school_id} AND c.isLiveCheck = 0 and c.pupilLoginDate is not null"
    result = SQL_CLIENT.execute(sql)
    count = result.first
    result.cancel
    count.values.first
  end

  def self.get_answers(check_result_id)
    sql = "SELECT * FROM [mtc_results].[answer] WHERE checkResult_id='#{check_result_id}'"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.get_check_result(check_id)
    sql = "SELECT * FROM [mtc_results].[checkResult] WHERE check_id='#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    check_result = result.first
    result.cancel
    check_result
  end

  def self.get_check_id(check_code)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE checkCode='#{check_code}'"
    result = SQL_CLIENT.execute(sql)
    check = result.first
    result.cancel
    check['id']
  end

  def self.get_check(check_code)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE checkCode='#{check_code}'"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end

  def self.get_check_result_id(check_id)
    sql = "SELECT * FROM [mtc_results].[checkResult] WHERE check_id='#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    check_result = result.first
    result.cancel
    check_result['id']
  end

  def self.wait_for_check_result(check_id)
    begin
      retries ||= 0
      sleep 1
      p 'waiting for check result record'
      get_check_result_id(check_id)
    rescue NoMethodError => e
      p "retry number" + retries.to_s
      retry if (retries += 1) < 60
    end
  end

  def self.get_event_types_for_check(check_result_id)
    sql = %{
          SELECT
              e.*,
            etl.eventType
          FROM
            mtc_results.event e
            JOIN mtc_results.eventTypeLookup etl ON (e.eventTypeLookup_id = etl.id)
          WHERE
            e.checkResult_id = #{check_result_id}
          ORDER BY
            e.browserTimestamp
    }
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.get_question_id(factor1, factor2, is_warm_up)
    is_warm_up = is_warm_up ? 1 : 0
    sql = "SELECT * FROM [mtc_admin].[question] WHERE factor1=#{factor1} AND factor2=#{factor2} AND isWarmup=#{is_warm_up}"
    result = SQL_CLIENT.execute(sql)
    question = result.first
    result.cancel
    question
  end

  def self.get_input_data(check_result_id)
    sql = %{
          SELECT
            check_id,
            mark,
            markedAt,
            CONCAT(q.factor1, 'x', q.factor2) as question,
            a.answer,
            a.isCorrect,
            a.questionNumber,
            a.browserTimestamp as answerBrowserTimestamp,
            ui.userInput,
            ui.browserTimestamp as inputBrowserTimestamp,
            uitl.name
      FROM
            mtc_results.checkResult cr
            LEFT JOIN mtc_results.answer a ON (cr.id = a.checkResult_id)
            LEFT JOIN mtc_results.userInput ui ON (a.id = ui.answer_id)
            LEFT JOIN mtc_results.userInputTypeLookup uitl ON (
               ui.userInputTypeLookup_id = uitl.id
            )
      LEFT JOIN mtc_admin.question q ON (a.question_id = q.id)
      WHERE
            cr.id = #{check_result_id}
      ORDER BY
            IIF(
              ui.browserTimestamp IS NULL, a.browserTimestamp,
              ui.browserTimestamp
            ),
            ui.browserTimestamp;
    }
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.get_schools_list
    sql = "select * from [mtc_admin].[school]"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.get_check_id_using_names(forename,lastname, school_id)
    sql = "select id from mtc_admin.[check] where pupil_id = (SELECT id FROM [mtc_admin].[pupil] WHERE foreName='#{forename}' AND lastName='#{lastname}' AND school_id=#{school_id})"
    result = SQL_CLIENT.execute(sql)
    id = result.first
    result.cancel
    id
  end

  def self.get_list_of_la_codes
    sql = "select lacode from mtc_admin.laCodeLookup where lacode != 0"
    result = SQL_CLIENT.execute(sql)
    la_codes = result.each {|row| row.map}
    la_codes.map {|code| code['lacode'].to_s}
  end

  def self.pupil_details_using_school(upn,school_id)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE upn='#{upn}' AND school_id=#{school_id}"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.find_school_by_name(name)
    sql = "SELECT * FROM [mtc_admin].[school] WHERE name='#{name}'"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res
  end

  def self.count_restarts_taken_for_pupil(pupil_id)
    sql = "select count(*) from mtc_admin.pupilRestart where pupil_id=#{pupil_id} AND isDeleted=0"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res.values.first
  end

  def self.get_all_pupil_checks(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id='#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  # requires review (and isDeleted=0?)
  def self.update_attendance_code_id_for_pupil(pupil_id,new_attendance_code)
    sql = "update mtc_admin.pupilAttendance set attendanceCode_id = #{new_attendance_code} where pupil_id=#{pupil_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  # requires review (a lot of logic is being bypassed, why not do via UI?)
  def self.set_pupil_as_frozen(pupil_id,new_attendance_code)
    sql = "update mtc_admin.pupil set frozen = 1, attendanceId = #{new_attendance_code} where id=#{pupil_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
    set_attendance_code_for_a_pupil(pupil_id, 7)
  end

  def self.type_of_establishment
    sql = "select * from mtc_admin.typeOfEstablishmentLookup"
    result = SQL_CLIENT.execute(sql)
    type_of_establishment = result.each {|row| row.map}
    type_of_establishment.map {|toe| toe['name'] + ' ('+ toe['code'].to_s + ')'}
  end

  def self.find_type_of_establishment(name)
    sql = "select * from mtc_admin.typeOfEstablishmentLookup where name='#{name}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end

  def self.find_type_of_establishment_by_code(code)
    sql = "select * from mtc_admin.typeOfEstablishmentLookup where code='#{code}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end


  def self.find_type_of_establishment_by_id(id)
    sql = "select * from mtc_admin.typeOfEstablishmentLookup where id='#{id}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end


  def self.pupil_audit_record(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[pupilAudit] WHERE pupil_id='#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.login_event(user_id)
    sql = "SELECT * FROM [mtc_admin].[adminLogonEvent] WHERE user_id = #{user_id}"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end


  def self.get_form(form_id)
    sql = "SELECT * FROM [mtc_admin].[checkForm] WHERE id = '#{form_id}'"
    result = SQL_CLIENT.execute(sql)
    chk_form_res = result.first
    result.cancel
    chk_form_res
  end


  def self.pupil_details_by_upn(upn)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE upn='#{upn}'"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
  end


  def self.delete_check_pin(check_id)
    sql = "DELETE FROM [mtc_admin].[checkPin] where check_id=#{check_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
  end


  def self.received_check(check_code)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE checkCode = '#{check_code}' and received=1"
    result = SQL_CLIENT.execute(sql)
    check = result.first
    result.cancel
    check
  end

  def self.wait_for_received_check(check_code)
    begin
      retries ||= 0
      sleep 1
      p 'waiting for check to be received'
      received_check(check_code)
    rescue NoMethodError => e
      p "retry number" + retries.to_s
      retry if (retries += 1) < 60
    end
  end

  def self.group_details(group_id)
    sql = "SELECT * FROM [mtc_admin].[group] WHERE id='#{group_id}'"
    result = SQL_CLIENT.execute(sql)
    group_details_res = result.first
    result.cancel
    group_details_res
  end

  def self.get_random_school()
    begin
      sql = "SELECT TOP 1 t.* FROM (SELECT s.id FROM mtc_admin.school s
        WHERE s.id NOT IN
        (SELECT school_id FROM mtc_admin.adminLogonEvent WHERE school_id IS NOT NULL)) as t
        ORDER BY NEWID()"
      result = SQL_CLIENT.execute(sql)
      school_details = result.first
      result.cancel
      school_details
    rescue => e
      abort "sql_db_helper.get_random_school failed.
      Error: #{e.to_s}"
    end
  end

  def self.get_school_teacher(school_urn)
    sql = "SELECT TOP 1 u.* FROM [mtc_admin].[user] u
      INNER JOIN mtc_admin.school s on u.school_id = s.id
      WHERE s.urn='#{school_urn}' AND u.role_id=3"
    result = SQL_CLIENT.execute(sql)
    user = result.first
    result.cancel
    user
  end

end
