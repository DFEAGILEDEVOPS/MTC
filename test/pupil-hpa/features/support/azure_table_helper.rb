class AzureTableHelper

  def self.get_row(table_name, p_key, r_key)
    query = { :filter => "RowKey eq '#{r_key.downcase}' and PartitionKey eq '#{p_key.downcase}'" }
    Timeout.timeout(ENV['WAIT_TIME'].to_i) { sleep 1 until !AZURE_TABLE_CLIENT.query_entities(table_name, query).empty? }
    AZURE_TABLE_CLIENT.query_entities(table_name, query).first.properties
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

  def self.get_check_result(check_code)
    query = { :filter => "RowKey eq '#{check_code.downcase}'" }
    Timeout.timeout(ENV['WAIT_TIME'].to_i) { sleep 1 until !AZURE_TABLE_CLIENT.query_entities('checkResult', query).empty? }
    AZURE_TABLE_CLIENT.query_entities('checkResult', query).first
  end

end
