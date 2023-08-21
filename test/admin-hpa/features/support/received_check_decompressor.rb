# require 'azure/storage/table'
# require 'lz_string'
#
# class ReceivedCheckDecompressor
#
#   def self.connection
#     if File.exist?('../../.env')
#       credentials = File.read('../../.env').split('AZURE_STORAGE_CONNECTION_STRING').last.split(';')
#       @account_name = credentials.find {|a| a.include? 'AccountName'}.gsub('AccountName=', '')
#       @account_key = credentials.find {|a| a.include? 'AccountKey'}.gsub('AccountKey=', '')
#     else
#       credentials = ENV['AZURE_STORAGE_CONNECTION_STRING'].split('AZURE_STORAGE_CONNECTION_STRING').last.split(';')
#       @account_name = credentials.find {|a| a.include? 'AccountName'}.gsub('AccountName=', '')
#       @account_key = credentials.find {|a| a.include? 'AccountKey'}.gsub('AccountKey=', '')
#     end
#     Azure::Storage::Table::TableService.create(storage_account_name: @account_name, storage_access_key: @account_key)
#   end
#
#   def self.get_row(table_name, partition_key, row_key)
#     azure_connection = connection
#     azure_connection.get_entity(table_name, partition_key, row_key).properties
#   end
#
#   def self.get_archive
#     fail 'please pass SCHOOL UUID and CHECK CODE in the format "decompress_achrive_message CF75C899-503E-4FC0-B0B0-D0F9D2AC7610 F3E1DE75-D6E9-4B63-989B-A1D37E0A7FA2"' if ARGV[1].nil?
#     get_row('receivedCheck', ARGV[0].downcase, ARGV[1].downcase)['archive']
#   end
#
#   def self.decompress_archive_message
#     archive = get_archive
#     LZString::UTF16.decompress(archive)
#     out_file = File.new(ENV['HOME'] + "/received_check_message_#{ARGV[1]}.json", "w")
#     out_file.puts(LZString::UTF16.decompress(archive))
#   end
# end
