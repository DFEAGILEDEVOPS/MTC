class AzureTableHelper


  def self.get_row(table_name, partition_key, row_key)
    AZURE_TABLE_CLIENT.get_entity(table_name, partition_key, row_key).properties
  end

  def self.wait_for_prepared_check(school_password, pin)
    p school_password, pin
    begin
      retries ||= 0
      sleep 2
      a = get_row('preparedCheck', school_password, pin)
    rescue Azure::Core::Http::HTTPError => e
      retry if (retries += 1) < 120
    end
  end

  #### -- Enable below method when new check process is enabled

  # def self.wait_for_prepared_check(school_password, pin)
  #   p school_password, pin
  #   found = false
  #   begin
  #     retries ||= 0
  #     sleep 2
  #     REDIS_CLIENT.keys.each do |key|
  #       if key.include?("#{pin}")
  #         puts "PREPARE CHECK KEY IN REDIS IS : #{key}"
  #         found = true
  #       end
  #     end
  #     if !found
  #       fail "Pin not found in redis"
  #     end
  #   rescue
  #     retry if (retries += 1) < 120
  #   end
  # end


  def self.get_pupil_feedback(check_code)
    query = { :filter => "checkCode eq '#{check_code}'" }
    Timeout.timeout(ENV['WAIT_TIME'].to_i){sleep 1 until !AZURE_TABLE_CLIENT.query_entities('pupilFeedback', query).empty?}
    AZURE_TABLE_CLIENT.query_entities('pupilFeedback', query).first
  end

end
