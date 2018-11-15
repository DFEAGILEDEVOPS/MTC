class AzureBlobHelper

  def self.get_blobs(blob_container_name)
    AZURE_BLOB_CLIENT.list_blobs(blob_container_name).properties
  end

  def self.no_fail_create_container(blob_container_name)
    begin
      AZURE_BLOB_CLIENT.create_container(blob_container_name)
      blob_container_name
    rescue Azure::Core::Http::HTTPError
      p 'Blob container name already exists, continuing'
      blob_container_name
    end
  end

end