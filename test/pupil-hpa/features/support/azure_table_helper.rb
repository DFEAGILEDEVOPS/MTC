class AzureTableHelper


  def self.get_row(table_name, partition_key, row_key)
    AZURE_TABLE_CLIENT.get_entity(table_name, partition_key, row_key).properties
  end

  def self.wait_for_prepared_check(school_password, pin)
    60.times do |i|
      begin
        sleep 2
        a = get_row('preparedCheck', school_password, pin)
        break if a['RowKey'] == pin
      rescue Azure::Core::Http::HTTPError => e
      end
    end
  end

end