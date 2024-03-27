require 'SecureRandom'

class AzureBlobHelper

  def self.no_fail_create_container()
    begin
      unique_container_name = "screenshots-#{SecureRandom.uuid}"
      AZURE_BLOB_CLIENT.create_container(unique_container_name)
      unique_container_name
    rescue Azure::Core::Http::HTTPError => e
      abort "unable to create blob container '#{@unique_container_name}'.
        Error:#{@e.message}"
    end
  end
end
