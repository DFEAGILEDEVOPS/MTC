class AzureBlobHelper

  def self.get_blobs(blob_container_name)
    AZURE_BLOB_CLIENT.list_blobs(blob_container_name).properties
  end

end