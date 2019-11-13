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

end
