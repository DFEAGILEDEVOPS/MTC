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

  def self.get_pupil_feedback(check_code)
    query = { :filter => "checkCode eq '#{check_code}'" }
    Timeout.timeout(60){sleep 1 until !AZURE_TABLE_CLIENT.query_entities('pupilFeedback', query).empty?}
    AZURE_TABLE_CLIENT.query_entities('pupilFeedback', query).first
  end

end
