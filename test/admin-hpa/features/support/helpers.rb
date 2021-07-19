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
    when 'Pupil not taking the check'
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

  def get_service_bus_queue(name,config_array)
    config_array.select{|config| config['name'] == name}
  end

  def get_expected_config(name)
    default_max_size = ENV['SERVICE_BUS_QUEUE_MAX_SIZE_DEFAULT_MEGABYTES'].nil? ? 5120 : ENV['SERVICE_BUS_QUEUE_MAX_SIZE_DEFAULT_MEGABYTES']
    ps_schools_max_size = ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_SCHOOLS'].nil? ? 5120 : ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_SCHOOLS']
    ps_staging_max_size = ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_STAGING'].nil? ? 81920 : ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_STAGING']
    ps_export_max_size = ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_EXPORT'].nil? ? 81920 : ENV['SERVICE_BUS_QUEUE_MAX_SIZE_MEGABYTES_PS_REPORT_EXPORT']
    case name
    when 'check-completion','check-notification','check-marking','check-notification','check-sync','check-validation','pupil-login','queue-replay','school-results-cache','sync-results-to-db-complete'
      [{"maxSizeInMegabytes"=>default_max_size.to_i, "defaultMessageTimeToLive"=>"P120D", "lockDuration"=>"PT5M", "requiresDuplicateDetection"=>true, "deadLetteringOnMessageExpiration"=>true, "duplicateDetectionHistoryTimeWindow"=>"P1D", "enablePartitioning"=>false, "requiresSession"=>false, "name"=>name}]
    when 'ps-report-schools'
      [{"maxSizeInMegabytes"=>ps_schools_max_size.to_i, "defaultMessageTimeToLive"=>"P6D", "lockDuration"=>"PT5M", "requiresDuplicateDetection"=>true, "deadLetteringOnMessageExpiration"=>true, "duplicateDetectionHistoryTimeWindow"=>"P1D", "enablePartitioning"=>false, "requiresSession"=>false, "name"=>"ps-report-schools"}]
    when 'ps-report-staging'
      [{"maxSizeInMegabytes"=>ps_staging_max_size.to_i, "defaultMessageTimeToLive"=>"P6D", "lockDuration"=>"PT5M", "requiresDuplicateDetection"=>true, "deadLetteringOnMessageExpiration"=>true, "duplicateDetectionHistoryTimeWindow"=>"P1D", "enablePartitioning"=>false, "requiresSession"=>false, "name"=>"ps-report-staging"}]
    when 'ps-report-export'
      [{"maxSizeInMegabytes"=>ps_export_max_size.to_i, "defaultMessageTimeToLive"=>"P6D", "lockDuration"=>"PT5M", "requiresDuplicateDetection"=>true, "deadLetteringOnMessageExpiration"=>true, "duplicateDetectionHistoryTimeWindow"=>"P1D", "enablePartitioning"=>false, "requiresSession"=>false, "name"=>"ps-report-export"}]
    else
      fail 'Name of queue not found'
    end
  end

end
