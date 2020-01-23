require 'azure/storage/table'
require 'lz_string'

class ReceivedCheckDecompressor

  credentials = File.read('../../admin/.env').split('AZURE_STORAGE_CONNECTION_STRING').last.split(';')
  @account_name = credentials.find{|a| a.include? 'AccountName' }.gsub('AccountName=','')
  @account_key = credentials.find{|a| a.include? 'AccountKey' }.gsub('AccountKey=','')
  AZURE_TABLE_CLIENT = Azure::Storage::Table::TableService.create(storage_account_name: @account_name, storage_access_key: @account_key)

  def self.get_row(table_name, partition_key, row_key)
    AZURE_TABLE_CLIENT.get_entity(table_name, partition_key, row_key).properties
  end

  def self.get_archive
    fail 'please pass SCHOOL UUID and CHECK CODE in the format "decompress_achrive_message CF75C899-503E-4FC0-B0B0-D0F9D2AC7610 F3E1DE75-D6E9-4B63-989B-A1D37E0A7FA2"' if ARGV[1].nil?
    get_row('receivedCheck', ARGV[0], ARGV[1])['archive']
  end

  def self.decompress_archive_message
    archive = get_archive
    LZString::UTF16.decompress(archive)
    out_file = File.new(ENV['HOME']+ "/received_check_message_#{ARGV[1]}.json", "w")
    out_file.puts(LZString::UTF16.decompress(archive))
  end
end
