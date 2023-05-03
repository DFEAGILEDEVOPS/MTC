class AzureTableHelper


  def self.get_row(table_name, partition_key, row_key)
    AZURE_TABLE_CLIENT.get_entity(table_name, partition_key, row_key).properties
  end

    def self.wait_for_received_check(partition_key, row_key)
    begin
      retries ||= 0
      sleep 5
      p 'trying'
      a = get_row('receivedCheck', partition_key.downcase, row_key.downcase)
    rescue Azure::Core::Http::HTTPError => e
      retry if (retries += 1) < 120
    end
  end

  #### -- Enable below method when new check process is enabled

  def self.wait_for_prepared_check(school_password, pin)
    p school_password, pin
    found = false
    begin
      retries ||= 0
      sleep 5
      result = REDIS_CLIENT.get("preparedCheck:#{school_password}:#{pin}")
      if (result.nil?)
        fail "Pin not found in redis"
      end
    rescue
retry if (retries += 1) < 120
end
end

def self.get_pupil_feedback(check_code)
  query = { :filter => "checkCode eq '#{check_code}'" }
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i){sleep 1 until !AZURE_TABLE_CLIENT.query_entities('pupilFeedback', query).empty?}
  AZURE_TABLE_CLIENT.query_entities('pupilFeedback', query).first
end

def self.get_check_result(check_code)
  query = { :filter => "RowKey eq '#{check_code.downcase}'" }
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i){sleep 1 until !AZURE_TABLE_CLIENT.query_entities('checkResult', query).empty?}
  AZURE_TABLE_CLIENT.query_entities('checkResult', query).first
end

end
