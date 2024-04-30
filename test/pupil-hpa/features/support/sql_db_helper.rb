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
    @array_of_schools = result.each {|row| row.map}
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

  def self.find_pupil_via_pin_and_checkCode(pin, check_code)
    pin_query = "SELECT id FROM [mtc_admin].[pin] WHERE val='#{pin}'"
    result = SQL_CLIENT.execute(pin_query)
    pin_id = result.first
    result.cancel
    check_query = "SELECT pupil_id FROM [mtc_admin].[check] WHERE id in(SELECT check_id FROM [mtc_admin].[checkPin] WHERE pin_id='#{pin_id.values.first}') and checkCode = '#{check_code}'"
    result = SQL_CLIENT.execute(check_query)
    pupil_id = result.first
    result.cancel
    pupil_query = "SELECT * FROM [mtc_admin].[pupil] WHERE id='#{pupil_id.values.first}'"
    result = SQL_CLIENT.execute(pupil_query)
    pupil_details = result.first
    result.cancel
    pupil_details
  end

  # this is too fragile for parallel use
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
    check_window_result = result.each {|row| row.map}
    result.cancel
    check_window_result
  end

  def self.update_check_window(id, column_name, new_date)
    sql = "UPDATE [mtc_admin].[checkWindow] set #{column_name}='#{new_date}' WHERE id='#{id}'"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.create_check(updatedime, createdTime, pupil_id, is_live_check = true)
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

  def self.get_check_config_data(check_id)
    sql = "SELECT * FROM [mtc_admin].[checkConfig] WHERE check_id='#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end

  def self.check_details(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id = '#{pupil_id}' ORDER BY id DESC"
    result = SQL_CLIENT.execute(sql)
    chk_res = result.first
    result.cancel
    chk_res
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

  def self.get_attendance_code_for_a_pupil(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[pupilAttendance] WHERE pupil_id = '#{pupil_id}' and isDeleted = 'false'"
    result = SQL_CLIENT.execute(sql)
    pupil_att_code_res = result.first
    result.cancel
    pupil_att_code_res
  end

  def self.get_check(check_code)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE checkCode='#{check_code}'"
    result = SQL_CLIENT.execute(sql)
    data = result.first
    result.cancel
    data
  end

  def self.check_attendance_code(id)
    sql = "SELECT * FROM [mtc_admin].[attendanceCode] WHERE id = '#{id}'"
    result = SQL_CLIENT.execute(sql)
    chk_att_code_res = result.first
    result.cancel
    chk_att_code_res
  end

  def self.get_check_using_pupil(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id='#{pupil_id}'"
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


  def self.pupil_details_using_school(upn, school_id)
    sql = "SELECT * FROM [mtc_admin].[pupil] WHERE upn='#{upn}' AND school_id=#{school_id}"
    result = SQL_CLIENT.execute(sql)
    pupil_details_res = result.first
    result.cancel
    pupil_details_res
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


  def self.get_access_arrangements_for_a_pupil(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[pupilAccessArrangements] WHERE pupil_id = '#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    access_arrangement_array = result.each {|row| row.map}
    result.cancel
    access_arrangement_array
  end

  def self.get_device_information(device_identity)
    sql = "SELECT * FROM [mtc_results].[userDevice] WHERE ident = '#{device_identity}'"
    result = SQL_CLIENT.execute(sql)
    device_details = result.first
    result.cancel
    device_details
  end

  def self.get_check_id(check_code)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE checkCode='#{check_code}'"
    result = SQL_CLIENT.execute(sql)
    check = result.first
    result.cancel
    check['id']
  end

  def self.wait_for_check_result_row(check_id)
    begin
      retries ||= 0
      sleep 2
      p 'waiting for check result record'
      a = get_check_result_id(check_id)
    rescue NoMethodError => e
      retry if (retries += 1) < 60
    end
  end

  def self.get_check_result_id(check_id)
    sql = "SELECT * FROM [mtc_results].[checkResult] WHERE check_id='#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    check_result = result.first
    result.cancel
    check_result['id']
  end

  def self.get_answers(check_result_id)
    sql = "SELECT * FROM [mtc_results].[answer] WHERE checkResult_id='#{check_result_id}'"
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

  def self.get_check_result(check_id)
    sql = "SELECT * FROM [mtc_results].[checkResult] WHERE check_id='#{check_id}'"
    result = SQL_CLIENT.execute(sql)
    check_result = result.first
    result.cancel
    check_result
  end

  def self.get_list_of_la_codes
    sql = "select lacode from mtc_admin.laCodeLookup where lacode != 0"
    result = SQL_CLIENT.execute(sql)
    la_codes = result.each {|row| row.map}
    la_codes.map {|code| code['lacode'].to_s}
  end

  def self.get_schools_list
    sql = "select * from [mtc_admin].[school]"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  # def self.get_ps_record_for_pupil(pupil_id)
  #   sql = "SELECT * FROM [mtc_results].[psychometricReport] WHERE PupilId='#{pupil_id}'"
  #   result = SQL_CLIENT.execute(sql)
  #   ps_report = result.first
  #   result.cancel
  #   ps_report
  # end

  def self.browser_lookup(browser_id)
    sql = "SELECT * FROM [mtc_results].[browserFamilyLookup] WHERE id='#{browser_id}'"
    result = SQL_CLIENT.execute(sql)
    browser_lookup = result.first
    result.cancel
    browser_lookup
  end

  def self.pupil_restarts(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[pupilRestart] WHERE pupil_id='#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.get_all_pupil_checks(pupil_id)
    sql = "SELECT * FROM [mtc_admin].[check] WHERE pupil_id='#{pupil_id}'"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

  def self.count_all_ps_records_for_school(school_id)
    sql =  "select count(*) from mtc_results.psychometricReport where PupilUPN in (Select mtc_admin.pupil.upn from mtc_admin.pupil where school_id=#{school_id})"
    result = SQL_CLIENT.execute(sql)
    school_res = result.first
    result.cancel
    school_res.values.first
  end


  def self.delete_check_pin(check_id)
    sql = "DELETE FROM [mtc_admin].[checkPin] where check_id=#{check_id}"
    result = SQL_CLIENT.execute(sql)
    result.do
  end

  def self.set_school_as_test_school(dfe_number)
    sql = "update [mtc_admin].[school] set isTestSchool=1 where dfeNumber=#{dfe_number}"
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

  def self.get_ps_report_job
    sql = "SELECT * FROM [mtc_admin].[job] WHERE jobType_id = 2 ORDER BY completedAt DESC"
    result = SQL_CLIENT.execute(sql)
    ps_report = result.first
    result.cancel
    ps_report
  end

  def self.get_ps_record_for_pupil(table_name,pupil_id)
    sql = "SELECT * FROM mtc_results.#{table_name} WHERE PupilId = #{pupil_id}"
    result = SQL_CLIENT.execute(sql)
    ps_report = result.first
    result.cancel
    ps_report
  end

  def self.get_random_school()
    begin
      sql = "SELECT TOP 1 t1.* FROM (SELECT * FROM mtc_admin.school s
        WHERE s.id NOT IN (SELECT school_id FROM mtc_admin.adminLogonEvent WHERE school_id IS NOT NULL)) as t1
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

  def self.get_school_records_from_ps_report(school_urn,ps_report_table_name)
    sql = "SELECT * FROM [mtc_results].[#{ps_report_table_name}] WHERE SchoolURN='#{school_urn}'"
    result = SQL_CLIENT.execute(sql)
    result.each {|row| row.map}
  end

end
