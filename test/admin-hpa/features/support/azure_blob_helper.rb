class AzureBlobHelper

  def self.no_fail_create_container(blob_container_name)
    begin
      AZURE_BLOB_CLIENT.create_container(blob_container_name)
      blob_container_name
    rescue Azure::Core::Http::HTTPError
      p 'Blob container name already exists, continuing'
      blob_container_name
    end
  end

  def self.remove_old_containers
    containers = AZURE_BLOB_CLIENT.list_containers.map {|containers| containers if containers.name.include? 'screenshots'}.compact
    old_containers = containers.compact.map {|container| container if ((Date.today.mjd - Date.strptime(container.name.split('screenshots-')[1].gsub("-", ' '), "%d %m %y").mjd) >= 3)}.compact
    old_containers.each {|container| AZURE_BLOB_CLIENT.delete_container(container.name)}
  end
end
