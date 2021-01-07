module Helpers

  def wait_until(timeout_sec = ENV['WAIT_TIME'].to_i, delay_sec = 0.5, &block)
    WaitUtil.wait_for_condition("waiting for condition", :timeout_sec => timeout_sec, :delay_sec => delay_sec) do
      block.call
    end
  end

  def time_to_nearest_hour(time)
    time - time.sec - 60 * time.min
    return time.strftime("%Y-%m-%d %H")
  end

  def calculate_age(expected_years_old)
    academic_start_date = Time.parse calculate_academic_year
    pupil_dob = academic_start_date - expected_years_old.to_i.years
  end

  def calculate_academic_year
    if Date.parse("1/9/#{Date.today.year}").future?
      academic_year = "1/9/#{(Date.today.year) - 1}"
    else
      academic_year = "1/9/#{Date.today.year}"
    end
    academic_year
  end

  def complete_check(school_password, pupil_pin, check_code)
    Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
    response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
    @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
    @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, mark, nil)
    AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
    school_uuid = @parsed_response_pupil_auth['school']['uuid']
    @check_code = @parsed_response_pupil_auth['checkCode']
    AzureTableHelper.wait_for_received_check(school_uuid, check_code)
  end

  def get_highest_estab_code
    SqlDbHelper.get_schools_list.map {|school| school['estabCode']}.sort.last
  end

  def get_highest_urn
    SqlDbHelper.get_schools_list.map {|school| school['urn']}.sort.last
  end

  def calculate_ctf_reason_code(reason)
    case reason
    when 'Working below expectation'
      'B'
    when 'Absent during check window'
      'A'
    when 'Just arrived and unable to establish abilities'
      'J'
    when 'Left school'
      'L'
    when 'Unable to access'
      'U'
    when 'Incorrect registration'
      'Z'
    when 'Not taken'
      'X'
    else
      p reason
      fail 'Reason not recognised '
    end
  end

  def prior_fridays(date,fridays_ago)
    days_before = (date.wday + 1) % 7 + 1
    most_recent = date.to_date - days_before
    diff = (date.mjd - most_recent.mjd)
    case fridays_ago
    when 1
      most_recent
    when 2
      diff < 14 ? most_recent - 14 : most_recent
    else
      fail 'Option not recognised'
    end
  end

end
