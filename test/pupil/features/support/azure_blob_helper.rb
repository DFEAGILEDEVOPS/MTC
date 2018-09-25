class AzureBlobHelper

  def self.get_blobs(blob_container_name)
    AZURE_TABLE_CLIENT.list_blobs(blob_container_name).properties
  end

end